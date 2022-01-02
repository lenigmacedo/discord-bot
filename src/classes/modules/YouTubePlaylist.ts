import { youtube_v3 } from '@googleapis/youtube';
import { config, globals } from 'bot-config';
import { YouTubeVideo } from '..';
import YouTubeBase from './YouTubeBase';

export default class YouTubePlaylist extends YouTubeBase {
	constructor(url: string) {
		super(url);
	}

	/**
	 * Get a new instance of this class using the resource ID.
	 * @param id The resource ID
	 */
	static fromId(id: string) {
		return new this(`https://www.youtube.com/playlist?list=${id}`);
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
		const regex = /^[a-zA-Z0-9-_]{34}$/;
		return regex.test(id);
	}

	/**
	 * Get the playlist ID.
	 */
	get id() {
		const id = this.urlInstance.searchParams.get('list');

		if (id && YouTubePlaylist.validateId(id)) {
			return id;
		}

		throw TypeError('ID for the video resource cannot be found.');
	}

	/**
	 * Fetch all the video resources using the playlist URL within this instance.
	 */
	async fetchVideos() {
		try {
			const params: youtube_v3.Params$Resource$Playlistitems$List = {
				part: ['snippet'],
				maxResults: config.playlistImportMaxSize,
				playlistId: this.id
			};

			const response = await globals.youtubeApi.playlistItems.list(params);

			return response.data.items || [];
		} catch (error) {
			console.error(error);
			return [];
		}
	}

	/**
	 * Fetch all video URLs or IDs within this playlist.
	 */
	async fetchVideosStr(type: 'id' | 'url' = 'id') {
		const videos = await this.fetchVideos();

		if (!videos.length) return [];

		const urls: string[] = [];

		for (const video of videos) {
			const id = video.snippet?.resourceId?.videoId;

			if (id) {
				// YouTubeVideo class has validation.
				if (type === 'id') urls.push(YouTubeVideo.fromId(id).id);
				else if (type === 'url') urls.push(YouTubeVideo.fromId(id).url);
			}
		}

		return urls;
	}
}
