import config, { globals } from 'bot-config';
import { Guild } from 'discord.js';
import { promisify } from 'util';
import ytdl from 'ytdl-core-discord';

const RPUSH = promisify<string, string>(globals.redisClient.RPUSH).bind(globals.redisClient);
const LPUSH = promisify<string, string>(globals.redisClient.LPUSH).bind(globals.redisClient);
const LRANGE = promisify(globals.redisClient.LRANGE).bind(globals.redisClient);
const LLEN = promisify(globals.redisClient.LLEN).bind(globals.redisClient);
const LPOP = promisify(globals.redisClient.LPOP).bind(globals.redisClient);
const LTRIM = promisify(globals.redisClient.LTRIM).bind(globals.redisClient);
const DEL = promisify<string>(globals.redisClient.DEL).bind(globals.redisClient);

/**
 * An easy toolbox for managing audio for this bot.
 */
export default class QueueManager {
	guild: Guild;
	redisQueueNamespace: string;

	constructor(guild: Guild, redisNamespace: string) {
		this.guild = guild;
		this.redisQueueNamespace = redisNamespace;
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
	 * Add a URL to the end of the guild's queue.
	 */
	async queuePrepend(url: string) {
		if (!ytdl.validateURL(url)) return null;
		await LPUSH(this.redisQueueNamespace, url);
		return true;
	}

	/**
	 * Get many items in the guild's queue. Default limit is one less than defined in the config because it starts at index 0.
	 */
	async queueGetMultiple(page = 1, limit: number = config.paginateMaxLength) {
		const pageIndex = page - 1; // Redis starts from index 0
		const startIndex = pageIndex * limit;
		const endIndex = pageIndex * limit + limit - 1;

		const results = await LRANGE(this.redisQueueNamespace, startIndex, endIndex);
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

	/**
	 * Delete all items in the queue for the guild
	 */
	async queueDelete() {
		const queueLength = await this.queueGetLength();
		if (queueLength === 1) await DEL(this.redisQueueNamespace);
		else if (queueLength > 1) await LTRIM(this.redisQueueNamespace, -1, 0);
		// LTRIM does not work if there is more than one value
		else return null;
		return true;
	}
}
