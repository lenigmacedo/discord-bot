import { createAudioResource } from '@discordjs/voice';
import { youtube_v3 } from '@googleapis/youtube';
import { config, globals } from 'bot-config';
import ytdl from 'ytdl-core-discord';
import Cache from './Cache';
import YouTubeBase from './YouTubeBase';

type Awaited<T> = T extends PromiseLike<infer U> ? U : T;
export type YtdlVideoInfoResolved = Awaited<ReturnType<typeof ytdl.getBasicInfo>>;

export default class YouTubeVideo extends YouTubeBase {
	redisNamespace = `${config.redisNamespace}:youtubeVideoInfo`;
	cache: Cache;

	constructor(url: string) {
		super(url);
		this.cache = new Cache(this.id);
	}

	/**
	 * Get a new instance of this class using the resource ID.
	 * @param id The resource ID
	 */
	static fromId(id: string) {
		return new this(`https://www.youtube.com/watch?v=${id}`);
	}

	/**
	 * Get a new instance of this class using a video URL.
	 * @param url The video URL
	 */
	static fromUrl(url: string) {
		return new this(url);
	}

	/**
	 * Validate a given ID.
	 * @param id The video ID.
	 */
	private static validateId(id: string) {
		const regex = /^[a-zA-Z0-9-_]{11}$/;
		return regex.test(id);
	}

	/**
	 * Gets the Redis namespace for queries for this instance.
	 */
	get namespace() {
		return `${this.redisNamespace}:${this.id}`;
	}

	/**
	 * Get the video ID.
	 */
	get id() {
		const id = this.urlInstance.searchParams.get('v');

		if (id && YouTubeVideo.validateId(id)) {
			return id;
		}

		throw TypeError('ID for the video resource cannot be found or was not valid.');
	}

	/**
	 * Search like you're using the YouTube search bar! Input a string, get a list of video resources back.
	 * Each item will contain a big amount of information.
	 * @param query The search query.
	 * @param limit The maximum allowed quantity of videos to search for.
	 */
	static async search(query: string, limit = config.paginateMaxLength) {
		try {
			const params: youtube_v3.Params$Resource$Search$List = {
				part: ['id'],
				maxResults: limit,
				type: ['video'],
				q: query
			};

			const response = await globals.youtubeApi.search.list(params);

			return response.data.items || [];
		} catch (error) {
			console.error(error);
			return [];
		}
	}

	/**
	 * Search like you're using the search bar! Input a string, get a list of video URLs back.
	 * @param search The search query.
	 * @param limit The maximum allowed quantity of videos to search for.
	 */
	static async searchForUrls(query: string, limit?: number) {
		const videos = await this.search(query, limit);

		if (!videos.length) {
			return [];
		}

		const urls: string[] = [];

		for (const video of videos) {
			const id = video?.id?.videoId;
			if (id) urls.push(`https://www.youtube.com/watch?v=${id}`);
		}

		return urls;
	}

	/**
	 * Download the video's audio, and make it a Discord.js audio resource.
	 */
	async download() {
		try {
			const bitstream = await ytdl(this.url, { filter: 'audioonly', highWaterMark: 1 << 25 });

			if (!bitstream) {
				return null;
			}

			return createAudioResource(bitstream, { inlineVolume: true });
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	/**
	 * Get the video details via ytdl. Does not require an API key, but might be rate limited from IP (unconfirmed).
	 * Caches information for later retrieval using RedisJSON. Expiry set in config.
	 */
	async info<TResponse>(path?: string): Promise<TResponse | null> {
		try {
			const existsInCache = await this.cache.hasValue();

			if (!existsInCache) {
				const videoInfo = await ytdl.getBasicInfo(this.url);
				await this.cache.set(videoInfo);
			}
			const resp = await this.cache.get<TResponse>(path);
			return resp;
		} catch (error) {
			console.error(error);
			return null;
		}
	}
}
