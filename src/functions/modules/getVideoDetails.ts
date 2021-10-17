import config, { globals } from 'bot-config';
import { promisify } from 'util';
import ytdl from 'ytdl-core-discord';

const redisNamespace = `${config.redisNamespace}:videoDetails`;

const GET = promisify(globals.redisClient.GET).bind(globals.redisClient);
const SET = promisify(globals.redisClient.SET).bind(globals.redisClient);
const EXPIRE = promisify(globals.redisClient.EXPIRE).bind(globals.redisClient);

type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

export type YtdlVideoInfoResolved = Awaited<ReturnType<typeof ytdl.getBasicInfo>>;

/**
 * Leverages the ytdl.getBasicInfo() function but adds a Redis caching layer on top to prevent unnecessary API calls.
 */
export default async function getVideoDetails(url: string): Promise<YtdlVideoInfoResolved | null> {
	try {
		const videoId = ytdl.getVideoID(url);

		if (!videoId) return null;

		const namespace = `${redisNamespace}:${videoId}`;

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
