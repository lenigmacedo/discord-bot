import { config, globals } from 'bot-config';

export class Cache {
	static client = globals.redisClient;
	private namespace: string;

	/**
	 * A simple cache store abstraction using Redis JSON.
	 *
	 * @param namespaces Uniqely identify your cache set.
	 */
	constructor(namespaces: string[]) {
		this.namespace = `${config.redisNamespace}:global:cache:${namespaces.join(':')}`;
	}

	/**
	 * The Redis client is stored outside of the prototype. This is a helper method to retrieve when in instance context.
	 */
	get client() {
		return Cache.client;
	}

	/**
	 * Set a cache object. Auto-expires after a certain period of time.
	 *
	 * @param json A serialisable object.
	 * @param path Set subdata using a path. By default it will reassign the cache if a value already exists.
	 * @returns Promise<boolean> true if value set and expiry set, false otherwise.
	 */
	async set(json: any, path = '.') {
		const result = await this.client.json.SET(this.namespace, path, json);
		const expiry = await this.client.EXPIRE(this.namespace, config.cacheExpiryHours * 60 * 60);
		return !!(result && expiry);
	}

	/**
	 * Get data from the cache.
	 *
	 * @param path Retrieve subdata with a path.
	 * @returns Promise<TResponse | null> TResponse if a value exists, null otherwise.
	 */
	async get<TResponse>(path = '.') {
		const response = await this.client.json.GET(this.namespace, { path });

		if (response) return response as unknown as TResponse;

		return null;
	}

	/**
	 * Identify if a value already belongs in the cache.
	 *
	 * @returns Promise<boolean> true if value exists, false otherwise.
	 */
	hasValue() {
		return this.client.EXISTS(this.namespace);
	}
}
