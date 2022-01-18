import { config, globals } from 'bot-config';
import { Guild } from 'discord.js';

export class QueueManager {
	static client = globals.redisClient;
	namespace: string;

	/**
	 * An easy dependencyless queue manager for managing dynamic lists using Redis.
	 */
	constructor(id: string, namespaces: string[]) {
		this.namespace = `${config.redisNamespace}:${id}:queue:${namespaces.join(':')}`; // appname:guildid:queue:custom
	}

	/**
	 * Get a new instance of QueueManager using a guild instance.
	 *
	 * @param guild The Discord.js Guild instance.
	 * @param namespace A list for the namespace to organise multiple queues for a guild.
	 *
	 * @returns QueueManager
	 */
	static fromGuild(guild: Guild, namespaces: string[]) {
		return new this(guild.id, namespaces);
	}

	/**
	 * Get the static Redis client instance on this object.
	 */
	get client() {
		return QueueManager.client;
	}

	/**
	 * Add an item to the end of the queue.
	 *
	 * @param value A value to add.
	 * @returns A number of how many values were added.
	 */
	add(value: string) {
		return this.client.RPUSH(this.namespace, value);
	}

	/**
	 * Add a video to position 1 in the queue.
	 *
	 * @param value A value to prepend.
	 * @returns A number of how many values were added.
	 */
	prepend(value: string) {
		return this.client.LPUSH(this.namespace, value);
	}

	/**
	 * Get multiple items in the queue. By default it gets the first page.
	 *
	 * @param page The page you want to get. By default it is page 1.
	 * @param limit How many items in the page do you want to get.
	 * @returns string[] Array of values.
	 */
	getSome(page = 1, limit: number = config.paginateMaxLength) {
		const pageIndex = page - 1; // Redis starts from index 0
		const startIndex = pageIndex * limit;
		const endIndex = pageIndex * limit + limit - 1;

		return this.client.LRANGE(this.namespace, startIndex, endIndex);
	}

	/**
	 * Get all items in the queue.
	 *
	 * @returns Promise<string[]>
	 */
	getAll() {
		return this.client.LRANGE(this.namespace, 0, -1);
	}

	/**
	 * Get a queue item via its index.
	 *
	 * @param index Queue index number.
	 */
	async get(index: number) {
		const [value] = await this.client.LRANGE(this.namespace, index, index);
		return value;
	}

	/**
	 * Get the item in position 1 of the queue.
	 *
	 * @returns Promise<string | null>
	 */
	async first() {
		const result = await this.get(0);
		if (!result) return null;

		return result;
	}

	/**
	 * Delete an item from the queue.
	 *
	 * @param index The item index of the queue.
	 * @returns Promise<number> a number indicating how many items were removed.
	 */
	async delete(index: number) {
		const queueItem = await this.get(index);
		if (!queueItem) return false;
		return this.client.LREM(this.namespace, 0, queueItem);
	}

	/**
	 * Delete the #1 item in the queue.
	 *
	 * @returns Promise<string | null>
	 */
	deleteFirst() {
		return this.client.LPOP(this.namespace);
	}

	/**
	 * Get how long the queue is.
	 *
	 * @returns Promise<number>
	 */
	length() {
		return this.client.LLEN(this.namespace);
	}

	/**
	 * Identify if the queue is empty.
	 *
	 * @returns Promise<boolean> true indicates yes, false indicates no.
	 */
	async empty() {
		const queueLength = await this.length();
		return queueLength < 1;
	}

	/**
	 * Delete all items in the queue for the guild.
	 *
	 * @returns Promise<boolean> true indicates the operation was successful, false indicates there was nothing to delete.
	 */
	async purge() {
		const queueLength = await this.length();
		if (queueLength === 1) await this.client.DEL(this.namespace);
		else if (queueLength > 1) await this.client.LTRIM(this.namespace, -1, 0);
		// LTRIM does not work if there is more than one value
		else return false;
		return true;
	}
}
