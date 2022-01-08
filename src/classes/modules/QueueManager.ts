import { config } from 'bot-config';
import { Guild } from 'discord.js';
import { createClient } from 'redis';

export class QueueManager {
	static client = createClient({ url: `redis://${config.redisHost}:${config.redisPort}` });
	namespace: string;

	/**
	 * An easy dependencyless queue manager for managing dynamic lists using Redis.
	 */
	constructor(guildId: string, namespaces: string[]) {
		this.namespace = `${config.redisNamespace}:${guildId}:queue:${namespaces.join(':')}`; // appname:guildid:queue:custom
	}

	/**
	 * Open a connection to Redis.
	 */
	async open() {
		if (!this.client.isOpen) await this.client.connect();
	}

	/**
	 * Close the connection to Redis.
	 */
	async close() {
		if (this.client.isOpen) await this.client.disconnect();
	}

	/**
	 *
	 * @param guild The Discord.js Guild instance.
	 * @param namespace The namespace to organise multiple queues for a guild.
	 * As this takes an array, it will be joined with a ':' during construction.
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
	 * Append an item to the queue.
	 * @param value A value to add.
	 * @returns A number of how many values were added.
	 */
	add(value: string) {
		return this.client.RPUSH(this.namespace, value);
	}

	/**
	 * Add a video id to the left side of the queue.
	 * @param value A value to prepend.
	 * @returns A number of how many values were added.
	 */
	prepend(value: string) {
		return this.client.LPUSH(this.namespace, value);
	}

	/**
	 * Get multiple items in the queue. By default it gets the first page.
	 * @param page The page you want to get. By default it is page 1.
	 * @param limit How many items in the page do you want to get.
	 * @returns An array of string values.
	 */
	getSome(page = 1, limit: number = config.paginateMaxLength) {
		const pageIndex = page - 1; // Redis starts from index 0
		const startIndex = pageIndex * limit;
		const endIndex = pageIndex * limit + limit - 1;
		return this.client.LRANGE(this.namespace, startIndex, endIndex);
	}

	/**
	 * Get multiple items in the queue. By default it gets the first page.
	 * @param page The page you want to get. By default it is page 1.
	 * @param limit How many items in the page do you want to get.
	 * @returns An array of string values.
	 */
	getAll() {
		return this.client.LRANGE(this.namespace, 0, -1);
	}

	/**
	 * Get a queue item via its index.
	 * @param index Queue index number.
	 */
	async get(index: number) {
		const [value] = await this.client.LRANGE(this.namespace, index, index);
		return value;
	}

	/**
	 * Get the #1 item in the guild's queue.
	 */
	async first() {
		const result = await this.get(0);
		if (!result) return null;

		return result;
	}

	/**
	 * Delete an item from the queue.
	 * @param index The item index of the queue.
	 */
	async delete(index: number) {
		const queueItem = await this.get(index);
		if (!queueItem) return false;
		return this.client.LREM(this.namespace, 0, queueItem);
	}

	/**
	 * Delete the #1 item in the queue.
	 */
	deleteFirst() {
		return this.client.LPOP(this.namespace);
	}

	/**
	 * Get how long the queue is.
	 */
	length() {
		return this.client.LLEN(this.namespace);
	}

	/**
	 * Is the queue empty?
	 */
	async empty() {
		const queueLength = await this.length();
		return queueLength < 1;
	}

	/**
	 * Delete all items in the queue for the guild.
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

QueueManager.client.connect();
