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
import { downloadYouTubeVideo, getYouTubeUrl } from 'bot-functions';
import { Guild } from 'discord.js';
import { promisify } from 'util';
import ytdl from 'ytdl-core-discord';
import { InterfaceDefinition } from '../InterfaceDefinition.types';

const GET = promisify(globals.redisClient.GET).bind(globals.redisClient);
const SET = promisify(globals.redisClient.SET).bind(globals.redisClient);
const EXPIRE = promisify(globals.redisClient.EXPIRE).bind(globals.redisClient);

type Awaited<T> = T extends PromiseLike<infer U> ? U : T;
export type YtdlVideoInfoResolved = Awaited<ReturnType<typeof ytdl.getBasicInfo>>;

/**
 * An easy toolbox for managing audio for this bot.
 */
export default class YouTubeInterface implements InterfaceDefinition {
	player: AudioPlayer;
	queue: QueueManager;
	volume: number;
	connection?: VoiceConnection;
	currentResource?: AudioResource | null;

	constructor(guild: Guild) {
		this.player = createAudioPlayer();
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
	 * Download a Discord audio resource via ytdl.
	 * @param queueItemIndex The queue item index.
	 */
	async download(queueItemIndex: number = 0) {
		try {
			const queueLength = await this.queue.queueLength();
			if (queueItemIndex >= queueLength) return null;
			const queueItem = await this.queue.queueGetFromIndex(queueItemIndex);
			const queueItemUrl = getYouTubeUrl(queueItem);
			if (!queueItemUrl) return null;
			const audioResource = await downloadYouTubeVideo(queueItemUrl);
			return audioResource;
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	/**
	 * Get the video info. By default it is the first item in the queue.
	 * @param queueItemIndex The queue item index.
	 */
	async getItemInfo(queueItemIndex: number = 0) {
		const queueItem = await this.queue.queueGetFromIndex(queueItemIndex);
		if (!queueItem) return null;
		const info = await this.getDetails(queueItem);
		return info;
	}

	/**
	 * Get the player instance associated with this guild.
	 */
	getPlayer() {
		return this.player;
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
				const player = this.getPlayer();
				const queueLength = await this.queue.queueLength();

				if (queueLength < 1) {
					resolve(null);
					return;
				}

				const audioResource = await this.download();

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
		this.connection.subscribe(this.getPlayer());
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
		const player = this.getPlayer();
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
			const searchCache = await GET(namespace);

			if (searchCache) {
				console.log(`Video id ${videoId} found in cache! Using cache.`);
				return JSON.parse(searchCache);
			} else {
				if (!ytdl.validateURL(url)) return null;
				console.log(`Video id ${videoId} not found in cache! Getting video details.`);
				const results = await ytdl.getBasicInfo(url);
				const json = JSON.stringify(results);
				await SET(namespace, json);
				// Set an expiry on the cache, so that it will be forced to re-fetch in the future to keep the data up to date
				await EXPIRE(namespace, config.cacheExpiryHours * 3600); // 3600 seconds in an hour
				return results;
			}
		} catch (error) {
			console.error(error);
			return null;
		}
	}
}
