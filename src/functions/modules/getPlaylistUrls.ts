import { youtube_v3 } from '@googleapis/youtube';
import config, { globals } from 'bot-config';

/**
 * With a videoId string, search for an array of video URLs
 */
export default function getPlaylistUrls(playlistId: string, limit = config.playlistImportMaxSize) {
	return new Promise<string[]>(async resolve => {
		try {
			const params: youtube_v3.Params$Resource$Playlistitems$List = {
				part: ['snippet'],
				maxResults: limit,
				playlistId
			};

			globals.youtubeApi.playlistItems.list(params, (error, data) => {
				if (error) {
					resolve([]);
					console.error(error);
					return;
				}

				const urls = data?.data.items
					?.map(({ snippet }) => {
						const id = snippet?.resourceId?.videoId;
						if (!id) return null;
						return `https://www.youtube.com/watch?v=${id}`;
					})
					.filter(Boolean) as string[] | undefined;

				if (!urls?.length) {
					resolve([]);
					return;
				}

				resolve(urls);
			});
		} catch (error) {
			console.error(error);
			return resolve([]);
		}
	});
}
