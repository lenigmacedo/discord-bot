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
				playlistId: this.id,
				pageToken: undefined
			};

			// This function will run recursively to fetch ALL items from a playlist.
			// Due to the paginated nature of the YouTube API, this essentially loops through each page accumulating items as it goes.
			// For each iteration, it will pass in modified params for the next API call, the previous accumulated values, and retain reference to the original promise resolver function.
			// If the API response is good, it will append the new values to the previous accumulated values and re-invoke itself doing what was described on the line above.
			// When the API has been exhausted, it will invoke the original resolver function resolving the promise.
			async function recursiveVideoFetcher(
				resolver: (value: youtube_v3.Schema$PlaylistItem[]) => void,
				accumulator: youtube_v3.Schema$PlaylistItem[] = [],
				nextParams = params
			) {
				// Fetch the next max results value to keep the amount of items retrieved matching the config.
				// The newMaxResults value is later checked to ensure it is larger than 0 otherwise we have all we need.
				// YouTube API limit is 50 anyway, so it doesn't matter if it is a big number.
				const newMaxResults = config.playlistImportMaxSize - accumulator.length;
				nextParams.maxResults = newMaxResults;

				// The YouTube API does not paginate with numbers, it instead calculates a token that you must fetch by the response.
				// It uses the token and somehow knows what page to fetch.
				const response = await globals.youtubeApi.playlistItems.list(nextParams);
				const nextPageToken = response?.data?.nextPageToken;
				const items = response?.data?.items;

				if (items && nextPageToken && newMaxResults > 0) {
					nextParams.pageToken = nextPageToken;
					recursiveVideoFetcher(resolver, [...accumulator, ...items], nextParams);
				} else {
					resolver(accumulator);
				}
			}

			function runVideoFetcher(): Promise<youtube_v3.Schema$PlaylistItem[]> {
				return new Promise(resolve => recursiveVideoFetcher(resolve));
			}

			const items = await runVideoFetcher();

			return items || [];
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
