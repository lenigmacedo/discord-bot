import config, { globals } from 'bot-config';
import { getYouTubeUrl, getYouTubeVideoId } from 'bot-functions';
import { Guild } from 'discord.js';

/**
 * An easy toolbox for managing audio for this bot.
 */
export default class QueueManager {
	guild: Guild;
	redisQueueNamespace: string;

	constructor(guild: Guild, namespace: string) {
		this.guild = guild;
		this.redisQueueNamespace = `${config.redisNamespace}:${guild.id}:queue:${namespace}`;
	}

	/**
	 * Get the redis client instance
	 * Is getter to store method in prototype.
	 */
	get redis() {
		return globals.redisClient;
	}

	/**
	 * Append an item to the queue.
	 * @param key A YouTube URL or ID.
	 */
	async queueAppend(key: string) {
		const videoId = getYouTubeVideoId(key);
		if (!videoId) return null;
		await this.redis.RPUSH(this.redisQueueNamespace, videoId);
		return true;
	}

	/**
	 * Add a video id to the #1 spot in the queue.
	 * @param key A YouTube URL or ID.
	 */
	async queuePrepend(key: string) {
		const videoId = getYouTubeVideoId(key);
		if (!videoId) return null;
		await this.redis.LPUSH(this.redisQueueNamespace, videoId);
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
		const videoIds = await this.redis.LRANGE(this.redisQueueNamespace, startIndex, endIndex);
		const urls = videoIds.map(getYouTubeUrl).filter(url => typeof url === 'string') as string[];
		return urls;
	}

	/**
	 * Get a queue item via its index. Returns the video ID.
	 * @param index Queue index number.
	 */
	async queueGetFromIndex(index: number) {
		const results = await this.redis.LRANGE(this.redisQueueNamespace, index, index);
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
	 * @param index The item index of the queue.
	 */
	async queueDelete(index: number) {
		const queueItem = await this.queueGetFromIndex(index);
		if (!queueItem) return false;
		const result = await this.redis.LREM(this.redisQueueNamespace, 0, queueItem);
		if (result) return true;
		return false;
	}

	/**
	 * Delete the #1 item in the queue.
	 */
	async queueDeleteOldest() {
		await this.redis.LPOP(this.redisQueueNamespace);
		return true;
	}

	/**
	 * Get how long the queue is.
	 */
	async queueLength() {
		const result = await this.redis.LLEN(this.redisQueueNamespace);
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
		if (queueLength === 1) await this.redis.DEL(this.redisQueueNamespace);
		else if (queueLength > 1) await this.redis.LTRIM(this.redisQueueNamespace, -1, 0);
		// LTRIM does not work if there is more than one value
		else return false;
		return true;
	}
}
