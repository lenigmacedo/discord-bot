import { config } from 'bot-config';
import { createClient } from 'redis';

export default class Cache {
	static client = createClient({ url: `redis://${config.redisHost}:${config.redisPort}` });
	private namespace: string;

	/**
	 * A convenient way to store temporary data into cache.
	 *
	 * Persists on server reboots, and items can expire as defined times.
	 * @param name The key of this cache object.
	 */
	constructor(name: string) {
		this.namespace = `${config.redisNamespace}:global:cache:youtubevideo:${name}`;
	}

	/**
	 * Get the static client instance shared between all instances.
	 */
	get client() {
		return Cache.client;
	}

	/**
	 * Write a serialised JSON object to this cache. By default it overwrites the whole value in the key.
	 *
	 * Will also assign an expiry defined in the config.
	 *
	 * @param json A serialisable object to convert to JSON.
	 * @returns Whether the operation failed or not.
	 */
	async set(json: any, path: string = '.') {
		const result = await this.client.json.SET(this.namespace, path, json);
		const expiry = await this.client.EXPIRE(this.namespace, config.cacheExpiryHours * 60 * 60);
		return !!(result && expiry);
	}

	/**
	 * Get a value using a path. If a path is not specified then all is returned if any.
	 *
	 * @param path The path to the desired value. May or may not exist.
	 */
	async get<TResponse>(path: string = '.') {
		const response = await this.client.json.GET(this.namespace, { path });

		if (response) {
			return response as unknown as TResponse;
		}

		return null;
	}

	/**
	 * Does this cache object have data stored in the cache?
	 */
	hasValue() {
		return this.client.EXISTS(this.namespace);
	}
}

Cache.client.connect();
