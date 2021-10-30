import ytdl from 'ytdl-core-discord';

/**
 * Pass in a URL or ID, and let the function return an ID. Or null if it's invalid!
 */
export default function getYouTubeVideoId(urlOrId: string) {
	try {
		if (ytdl.validateID(urlOrId)) return urlOrId;
		return ytdl.getURLVideoID(urlOrId);
	} catch (error) {
		return null;
	}
}
