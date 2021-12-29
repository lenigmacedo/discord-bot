import {
	AudioPlayer,
	AudioPlayerIdleState,
	AudioPlayerPlayingState,
	AudioPlayerState,
	AudioPlayerStatus,
	AudioResource,
	createAudioPlayer,
	VoiceConnection
} from '@discordjs/voice';
import { QueueManager } from 'bot-classes';
import config, { globals } from 'bot-config';
import { Guild } from 'discord.js';
import ytdl from 'ytdl-core-discord';
import { BaseAudioInterface } from '../BaseAudioInterface';

type Awaited<T> = T extends PromiseLike<infer U> ? U : T;
export type YtdlVideoInfoResolved = Awaited<ReturnType<typeof ytdl.getBasicInfo>>;

export default class YouTubeInterface implements BaseAudioInterface {
	private audioPlayer: AudioPlayer;
	private volume: number;
	private connection?: VoiceConnection;
	private currentResource?: AudioResource | null;
	queue: QueueManager;

	/**
	 * An easy toolbox for managing audio for this bot.
	 */
	constructor(guild: Guild) {
		this.audioPlayer = createAudioPlayer();
		this.volume = config.audioVolume;
		this.queue = new QueueManager(guild, 'youtube');
	}

	/**
	 * Get the queue instance for a given guild.
	 * @param guild The guild to get the instance for.
	 */
	static getInterfaceForGuild(guild: Guild) {
		if (!globals.youtubePlayers.has(guild.id)) {
			globals.youtubePlayers.set(guild.id, new YouTubeInterface(guild));
		}

		return globals.youtubePlayers.get(guild.id) as YouTubeInterface;
	}

	/**
	 * Get the video info. By default it is the first item in the queue.
	 * @param queueItemIndex The queue item index.
	 */
	async getItemInfo(queueItemIndex: number = 0) {
		const queueItem = await this.queue.queueGetFromIndex(queueItemIndex);
		if (!queueItem) return null;
		const info = await this.getDetails(queueItem.url);
		return info;
	}

	/**
	 * Get the player instance associated with this guild.
	 */
	get player() {
		return this.audioPlayer;
	}

	/**
	 * Is the bot playing audio in thie guild?
	 */
	getBusyStatus() {
		const connection = this.getConnection();
		if (!connection?.state.status) return false;
		if (connection?.state.status !== 'destroyed') return true;
		return false;
	}

	/**
	 * Start the execution of the queue by joining the bot and playing audio.
	 * To use this, await this method in a while loop. Will resolve true to indicate finish, and null to stop.
	 */
	queueRunner(): Promise<true | null> {
		return new Promise(async resolve => {
			try {
				const player = this.player;
				const youtubeVideo = await this.queue.queueGetOldest();
				const queueLength = await this.queue.queueLength();

				if (!youtubeVideo || !queueLength) {
					resolve(null);
					return;
				}

				const audioResource = await youtubeVideo.download();

				const onIdleCallback = async (oldState: AudioPlayerState, newState: AudioPlayerState) => {
					if (oldState.status === 'playing' && newState.status === 'idle') {
						player.removeListener('stateChange', onIdleCallback);
						await this.queue.queueDeleteOldest();
						resolve(true);
					}
				};

				player.on('stateChange', onIdleCallback);

				if (!audioResource) {
					console.error('Audio playback skipped due to no audio resource being detected.');
					player.removeListener('stateChange', onIdleCallback);
					await this.queue.queueDeleteOldest();
					resolve(true);
					return;
				}

				this.currentResource = audioResource;
				this.currentResource.volume?.setVolume(this.volume);

				player.play(this.currentResource);

				// Ytdl core sometimes does not reliably download the audio data, so this handles the error.
				player.once('error', async () => {
					console.error('Audio playback skipped due to invalid stream data!');
					await this.queue.queueDeleteOldest();
					player.removeListener('stateChange', onIdleCallback);
					resolve(true);
				});
			} catch (error) {
				console.error(error);
				await this.queue.queueDeleteOldest();
				resolve(true);
			}
		});
	}

	/**
	 * Set a connection instance to the guild.
	 * @param connection Connection to set.
	 */
	setConnection(connection: VoiceConnection) {
		this.connection = connection;
		this.connection.subscribe(this.player);
	}

	/**
	 * Destroy the connection instance associated with this guild
	 */
	deleteConnection() {
		this.currentResource = null;
		const destroyed = this.connection?.state.status === 'destroyed';

		if (this.connection instanceof VoiceConnection && !destroyed) {
			this.connection.disconnect();
			this.connection.destroy();
			return true;
		}

		return null;
	}

	/**
	 * Get the connection instance associated with this guild.
	 */
	getConnection() {
		return this.connection || null;
	}

	/**
	 * Get the current audio resource
	 */
	getCurrentAudioResource() {
		return this.currentResource || null;
	}

	/**
	 * Set the audible volume of the bot.
	 * @param volume Volume between 0 and 100
	 */
	setVolume(volume: number): boolean {
		try {
			if (volume < 0 || volume > 100) {
				return false;
			}

			this.volume = volume / 100; // 0 is mute, 1 is max volume.
			const currentAudioResource = this.getCurrentAudioResource();

			if (currentAudioResource) {
				currentAudioResource.volume?.setVolume(this.volume);
			}

			return true;
		} catch (error) {
			return false;
		}
	}

	/**
	 * Emit the exact event that will happen when the bot gets to the end of its current audio track. Useful for skipping.
	 */
	emitAudioFinish() {
		const currentAudioResource = this.getCurrentAudioResource();
		const player = this.player;
		if (!(currentAudioResource instanceof AudioResource)) return null;

		const oldState: AudioPlayerPlayingState = {
			status: AudioPlayerStatus.Playing,
			playbackDuration: currentAudioResource.playbackDuration,
			missedFrames: 0,
			resource: currentAudioResource,
			onStreamError: () => {}
		};

		const newState: AudioPlayerIdleState = {
			status: AudioPlayerStatus.Idle
		};

		player.emit('stateChange', oldState, newState);
		return true;
	}

	/**
	 * Get the video details via ytdl.
	 * @param url The video URL.
	 */
	async getDetails(url: string): Promise<YtdlVideoInfoResolved | null> {
		try {
			const videoId = ytdl.getVideoID(url);
			if (!videoId) return null;
			const namespace = `${this.queue.redisQueueNamespace}:${videoId}`;
			const searchCache = await this.queue.redis.GET(namespace);

			if (searchCache) {
				return JSON.parse(searchCache);
			} else {
				if (!ytdl.validateURL(url)) return null;

				const results = await ytdl.getBasicInfo(url);
				const json = JSON.stringify(results);
				await this.queue.redis.SET(namespace, json);
				// Set an expiry on the cache, so that it will be forced to re-fetch in the future to keep the data up to date
				await this.queue.redis.EXPIRE(namespace, config.cacheExpiryHours * 3600); // 3600 seconds in an hour
				return results;
			}
		} catch (error) {
			console.error(error);
			return null;
		}
	}
}
