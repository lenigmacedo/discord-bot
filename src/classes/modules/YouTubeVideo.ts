import { createAudioResource } from '@discordjs/voice';
import { youtube_v3 } from '@googleapis/youtube';
import config, { globals } from 'bot-config';
import ytdl from 'ytdl-core-discord';
import YouTubeBase from './YouTubeBase';

export default class YouTubeVideo extends YouTubeBase {
	constructor(url: string) {
		super(url);
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
}
