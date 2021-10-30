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
import { downloadYouTubeVideo } from 'bot-functions';
import { Guild } from 'discord.js';
import { promisify } from 'util';
import ytdl from 'ytdl-core-discord';

const GET = promisify(globals.redisClient.GET).bind(globals.redisClient);
const SET = promisify(globals.redisClient.SET).bind(globals.redisClient);
const EXPIRE = promisify(globals.redisClient.EXPIRE).bind(globals.redisClient);

type Awaited<T> = T extends PromiseLike<infer U> ? U : T;
export type YtdlVideoInfoResolved = Awaited<ReturnType<typeof ytdl.getBasicInfo>>;

/**
 * An easy toolbox for managing audio for this bot.
 */
export default class YouTubeInterface extends QueueManager {
	player: AudioPlayer;
	connection?: VoiceConnection;
	currentResource?: AudioResource | null;

	constructor(guild: Guild) {
		super(guild, `${config.redisNamespace}:${guild.id}:queue:youtube`);
		this.player = createAudioPlayer();
	}

	/**
	 * Return the queue instance for this guild. Will contstruct a new one if one does not already exist.
	 */
	static getInterfaceForGuild(guild: Guild) {
		if (!globals.players.has(guild.id)) {
			globals.players.set(guild.id, new YouTubeInterface(guild));
		}

		return globals.players.get(guild.id) as YouTubeInterface;
	}

	/**
	 * Download the audio resource for a video. By default it will be the oldest item in the queue, but you can specify an index.
	 */
	async downloadFromQueue(queueItemIndex: number = 0) {
		const queueLength = await this.queueGetLength();
		if (queueItemIndex >= queueLength) return null;
		const queueItem = (await this.queueGetFromIndex(queueItemIndex)) || '';
		const audioResource = await downloadYouTubeVideo(queueItem);
		return audioResource;
	}

	/**
	 * Get the video info. By default it is the first item in the queue.
	 */
	async queueGetQueueItemInfo(queueItemIndex: number = 0) {
		const queueItem = await this.queueGetFromIndex(queueItemIndex);
		if (!queueItem) return null;
		const info = await this.getYouTubeVideoDetails(queueItem);
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
	isBusy() {
		const connection = this.getConnection();
		if (!connection?.state.status) return false;
		if (connection?.state.status !== 'destroyed') return true;
		return false;
	}

	/**
	 * Start the execution of the queue by joining the bot and playing audio.
	 */
	queueRunner(): Promise<true | null> {
		return new Promise(async resolve => {
			try {
				const player = this.getPlayer();

				if ((await this.queueGetLength()) < 1) {
					resolve(null);
					return;
				}

				const audioResource = await this.downloadFromQueue();

				if (!audioResource) {
					await this.queueDeleteOldest();
					resolve(true);
					return;
				}

				this.currentResource = audioResource;
				this.getPlayer().play(this.currentResource);

				const onIdleCallback = async (oldState: AudioPlayerState, newState: AudioPlayerState) => {
					if (oldState.status === 'playing' && newState.status === 'idle') {
						player.removeListener('stateChange', onIdleCallback);
						await this.queueDeleteOldest();
						resolve(true);
					}
				};

				player.on('stateChange', onIdleCallback);
			} catch (error) {
				console.error(error);
				await this.queueDeleteOldest();
				resolve(true);
			}
		});
	}

	/**
	 * Set the connection instance associated with this guild.
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

		if (this.connection instanceof VoiceConnection) {
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

	async getYouTubeVideoDetails(url: string): Promise<YtdlVideoInfoResolved | null> {
		try {
			const videoId = ytdl.getVideoID(url);
			if (!videoId) return null;
			const namespace = `${this.redisQueueNamespace}:${videoId}`;
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
