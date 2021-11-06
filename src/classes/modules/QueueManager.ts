import config, { globals } from 'bot-config';
import { getYouTubeUrl, getYouTubeVideoId } from 'bot-functions';
import { Guild } from 'discord.js';
import { promisify } from 'util';

const RPUSH = promisify<string, string>(globals.redisClient.RPUSH).bind(globals.redisClient);
const LPUSH = promisify<string, string>(globals.redisClient.LPUSH).bind(globals.redisClient);
const LRANGE = promisify(globals.redisClient.LRANGE).bind(globals.redisClient);
const LLEN = promisify(globals.redisClient.LLEN).bind(globals.redisClient);
const LPOP = promisify(globals.redisClient.LPOP).bind(globals.redisClient);
const LTRIM = promisify(globals.redisClient.LTRIM).bind(globals.redisClient);
const DEL = promisify<string>(globals.redisClient.DEL).bind(globals.redisClient);
const LREM = promisify(globals.redisClient.LREM).bind(globals.redisClient);

/**
 * An easy toolbox for managing audio for this bot.
 */
export default class QueueManager {
	guild: Guild;
	redisQueueNamespace: string;

	constructor(guild: Guild, redisNamespace: string) {
		this.guild = guild;
		this.redisQueueNamespace = `${config.redisNamespace}:${guild.id}:queue:${redisNamespace}`;
	}

	/**
	 * Append an item to the queue.
	 * @param urlOrId A YouTube URL or ID.
	 */
	async queueAppend(urlOrId: string) {
		const videoId = getYouTubeVideoId(urlOrId);
		if (!videoId) return null;
		await RPUSH(this.redisQueueNamespace, videoId);
		return true;
	}

	/**
	 * Add a video id to the #1 spot in the queue.
	 * @param urlOrId A YouTube URL or ID.
	 */
	async queuePrepend(urlOrId: string) {
		const videoId = getYouTubeVideoId(urlOrId);
		if (!videoId) return null;
		await LPUSH(this.redisQueueNamespace, videoId);
		return true;
	}

	/**
	 * Get multiple items in the queue.
	 * @param page The page you want to get. By default it is page 1.
	 * @param limit How many items in the page do you want to get.
	 */
	async queueGetMultiple(page = 1, limit: number = config.paginateMaxLength) {
		const pageIndex = page - 1; // Redis starts from index 0
		const startIndex = pageIndex * limit;
		const endIndex = pageIndex * limit + limit - 1;
		const videoIds = await LRANGE(this.redisQueueNamespace, startIndex, endIndex);
		const urls = videoIds.map(getYouTubeUrl).filter(url => typeof url === 'string') as string[];
		return urls;
	}

	/**
	 * Get a queue item via its index. Returns the video ID.
	 * @param indexNumber Queue index number.
	 */
	async queueGetFromIndex(indexNumber: number) {
		const results = await LRANGE(this.redisQueueNamespace, indexNumber, indexNumber);
		return results[0];
	}

	/**
	 * Get the #1 item in the guild's queue.
	 */
	async queueGetOldest() {
		const result = await this.queueGetFromIndex(0);
		if (!result) return null;
		const url = getYouTubeUrl(result);
		return url;
	}

	/**
	 * Delete an item from the queue.
	 * @param queueItemIndex The item index of the queue.
	 */
	async queueDelete(queueItemIndex: number) {
		const queueItem = await this.queueGetFromIndex(queueItemIndex);
		if (!queueItem) return false;
		const result = await LREM(this.redisQueueNamespace, 0, queueItem);
		if (result) return true;
		return false;
	}

	/**
	 * Delete the #1 item in the queue.
	 */
	async queueDeleteOldest() {
		await LPOP(this.redisQueueNamespace);
		return true;
	}

	/**
	 * Get how long the queue is.
	 */
	async queueLength() {
		const result = await LLEN(this.redisQueueNamespace);
		return result;
	}

	/**
	 * Is the queue empty?
	 */
	async queueIsEmpty() {
		const queueLength = await this.queueLength();
		return queueLength < 1;
	}

	/**
	 * Delete all items in the queue for the guild.
	 */
	async queuePurge() {
		const queueLength = await this.queueLength();
		if (queueLength === 1) await DEL(this.redisQueueNamespace);
		else if (queueLength > 1) await LTRIM(this.redisQueueNamespace, -1, 0);
		// LTRIM does not work if there is more than one value
		else return false;
		return true;
	}
}
