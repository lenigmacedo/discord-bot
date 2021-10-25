import { youtube_v3 } from '@googleapis/youtube';
import config, { globals } from 'bot-config';

/**
 * With a string, search for an array of video URLs
 */
export default function findYouTubeUrls(query: string) {
	return new Promise<string[] | []>(async resolve => {
		try {
			const params: youtube_v3.Params$Resource$Search$List = {
				part: ['id'],
				maxResults: config.paginateMaxLength,
				type: ['video'],
				q: query
			};

			globals.youtubeApi.search.list(params, (error, data) => {
				if (error) {
					resolve([]);
					console.error(error);
					return;
				}

				const urls = data?.data.items
					?.map(video => {
						const id = video?.id?.videoId;
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
