import { createAudioResource } from '@discordjs/voice';
import { youtube_v3 } from '@googleapis/youtube';
import { Cache } from 'bot-classes';
import { config, globals } from 'bot-config';
import ytdl from 'ytdl-core-discord';
import { YouTubeBase } from './YouTubeBase';

export class YouTubeVideo extends YouTubeBase {
	redisNamespace = `${config.redisNamespace}:youtubeVideoInfo`;
	cache: Cache;

	private constructor(url: string) {
		super(url);
		this.cache = new Cache(['youtubevideo', this.id]);
	}

	/**
	 * This class is a toolbox for everything to do with YouTube videos.
	 *
	 * It sorts out info gathering, url resolving, validation, search queries, downloading audio etc just by an id or URL.
	 *
	 * @param id The video ID.
	 */
	static fromId(id: string) {
		return new this(`https://www.youtube.com/watch?v=${id}`);
	}

	/**
	 * This class is a toolbox for everything to do with YouTube videos.
	 *
	 * It sorts out info gathering, url resolving, validation, search queries, downloading audio etc just by an id or URL.
	 *
	 * @param url The video URL.
	 */
	static fromUrl(url: string) {
		return new this(url);
	}

	/**
	 * Validate a given ID. Does not rely on ytdl-core.
	 *
	 * @param id The video ID.
	 * @returns boolean true indicates valid, false indicates not valid.
	 */
	private static validateId(id: string) {
		const regex = /^[a-zA-Z0-9-_]{11}$/;
		return regex.test(id);
	}

	/**
	 * Gets the Redis namespace for queries for this instance.
	 *
	 * @returns string
	 */
	get namespace() {
		return `${this.redisNamespace}:${this.id}`;
	}

	/**
	 * Get the video ID.
	 *
	 * @returns string
	 */
	get id() {
		// The former is the traditional youtube.com/?v=id and the latter is the youtu.be/id URL format.
		const id = this.urlInstance.searchParams.get('v') || this.urlInstance.pathname.substring(1); // pathname always starts with a '/'

		if (id && YouTubeVideo.validateId(id)) {
			return id;
		}

		throw TypeError('ID for the video resource cannot be found or was not valid.');
	}

	/**
	 * Search like you're using the YouTube search bar! Input a string, get a list of video resources back.
	 *
	 * Each item will contain a big amount of information.
	 *
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
		} catch (error: any) {
			console.error(
				'Could not contact YouTube data API. Ensure you have a valid API key, which you can manage at https://console.cloud.google.com/apis/credentials'
			);
			console.error(error);
			return [];
		}
	}

	/**
	 * Search like you're using the search bar! Input a string, get a list of video URLs back.
	 *
	 * @param search The search query.
	 * @param limit The maximum allowed quantity of videos to search for.
	 * @returns Promise<string[]> A list of URLs.
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
	 *
	 * @returns Promise<AudioResource | null>
	 */
	async download() {
		try {
			const bitstream = await ytdl(this.url, { filter: 'audioonly', highWaterMark: 1 << 25 });

			if (!bitstream) {
				return null;
			}

			return createAudioResource(bitstream, { inlineVolume: true });
		} catch (error: any) {
			console.error(error);
			return null;
		}
	}

	/**
	 * Get the video details via ytdl. Does not require an API key, but might be rate limited from IP (unconfirmed).
	 *
	 * Caches information for later retrieval using RedisJSON. Expiry set in config.
	 */
	async info<TResponse>(path?: string): Promise<TResponse | null> {
		try {
			const existsInCache = await this.cache.hasValue();

			if (!existsInCache) {
				const videoInfo = await ytdl.getBasicInfo(this.url);
				await this.cache.set(videoInfo);
			}

			return await this.cache.get<TResponse>(path);
		} catch (error) {
			console.error(error);
			return null;
		}
	}
}

export type YtdlVideoInfoResolved = Awaited<ReturnType<typeof ytdl.getBasicInfo>>;
