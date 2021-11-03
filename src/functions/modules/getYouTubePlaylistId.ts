/**
 * Pass in a URL or ID, and let the function return an ID. Or null if it's invalid!
 */
export default function getYouTubePlaylistId(urlOrId: string) {
	try {
		if (!urlOrId.startsWith('http')) {
			// ID length is always 34
			return urlOrId;
		}

		const url = new URL(urlOrId);
		const playlistId = url.searchParams.get('list');

		if (playlistId) {
			return playlistId;
		}

		return null;
	} catch (error) {
		return null;
	}
}
