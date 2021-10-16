import { AudioPlayer, AudioPlayerState, createAudioPlayer, VoiceConnection } from '@discordjs/voice';
import config, { globals } from 'bot-config';
import { downloadYouTubeVideo } from 'bot-functions';
import { Guild } from 'discord.js';
import { promisify } from 'util';
import ytdl from 'ytdl-core-discord';

const RPUSH = promisify<string, string>(globals.redisClient.RPUSH).bind(globals.redisClient);
const LRANGE = promisify(globals.redisClient.LRANGE).bind(globals.redisClient);
const LLEN = promisify(globals.redisClient.LLEN).bind(globals.redisClient);
const LPOP = promisify(globals.redisClient.LPOP).bind(globals.redisClient);

/**
 * An easy toolbox for managing audio for this bot.
 */
export default class AudioInterface {
	guild: Guild;
	player: AudioPlayer;
	connection?: VoiceConnection;
	redisQueueNamespace: string;

	constructor(guild: Guild) {
		this.guild = guild;
		this.player = createAudioPlayer();
		this.redisQueueNamespace = `${config.redisNamespace}:${guild.id}:queue`;
	}

	/**
	 * Return the queue instance for this guild. Will contstruct a new one if one does not already exist.
	 */
	static getInterfaceForGuild(guild: Guild) {
		if (!globals.players.has(guild.id)) {
			globals.players.set(guild.id, new AudioInterface(guild));
		}

		return globals.players.get(guild.id) as AudioInterface;
	}

	/**
	 * Download the audio resource for a video. By default it will be the oldest item in the queue, but you can specify an index.
	 */
	async downloadFromQueue(queueItemIndex: number = 0) {
		if (queueItemIndex >= (await this.queueGetLength())) return null;
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
		const info = ytdl.getBasicInfo(queueItem);
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
		return new Promise(async (resolve, reject) => {
			try {
				const player = this.getPlayer();

				if ((await this.queueGetLength()) < 1) {
					resolve(null);
					return;
				}

				const audioResource = await this.downloadFromQueue();

				if (!audioResource) {
					resolve(null);
					return;
				}

				this.getPlayer().play(audioResource);
				await this.queueDeleteOldest();

				const onIdleCallback = async (oldState: AudioPlayerState, newState: AudioPlayerState) => {
					if (oldState.status === 'playing' && newState.status === 'idle') {
						player.removeListener('stateChange', onIdleCallback);
						resolve(true);
					}
				};

				player.on('stateChange', onIdleCallback);
			} catch (error) {
				reject(error);
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
	 * Add a URL to the end of the guild's queue.
	 */
	async queueAppend(url: string) {
		if (!ytdl.validateURL(url)) return null;

		await RPUSH(this.redisQueueNamespace, url);
		return true;
	}

	/**
	 * Get ALL items in the guild's queue.
	 */
	async queueGetAll() {
		const results = await LRANGE(this.redisQueueNamespace, 0, -1);
		return results;
	}

	/**
	 * Get a queue item from its index. 0 = first item the same as arrays.
	 */
	async queueGetFromIndex(indexNumber: number) {
		const results = await LRANGE(this.redisQueueNamespace, indexNumber, indexNumber);
		return results[0];
	}

	/**
	 * Get the oldest (first in line) item in the guild's queue.
	 */
	async queueGetOldest() {
		const results = await this.queueGetFromIndex(0);
		return results || null;
	}

	/**
	 * Remove the oldest item from the queue
	 */
	async queueDeleteOldest() {
		await LPOP(this.redisQueueNamespace);
		return true;
	}

	/**
	 * Get how long the queue is.
	 */
	async queueGetLength() {
		const result = await LLEN(this.redisQueueNamespace);
		return result;
	}

	/**
	 * Is the queue empty?
	 */
	async queueIsEmpty() {
		const queueLength = await this.queueGetLength();
		return queueLength < 1;
	}
}
