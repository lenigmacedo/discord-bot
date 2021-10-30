import ytdl from 'ytdl-core-discord';

/**
 * Pass in a URL or ID, and let the function return a URL. Or null if it's invalid!
 */
export default function getYouTubeUrl(urlOrId: string) {
	try {
		if (ytdl.validateID(urlOrId)) return `https://www.youtube.com/watch?v=${urlOrId}`;
		else if (ytdl.validateURL(urlOrId)) return urlOrId;
		return null;
	} catch (error) {
		return null;
	}
}
