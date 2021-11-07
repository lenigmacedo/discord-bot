import { createAudioResource } from '@discordjs/voice';
import ytdl from 'ytdl-core-discord';

export default async function downloadYtVideo(url: string) {
	try {
		if (!ytdl.validateURL(url)) return null;
		const audioBitstream = await ytdl(url, { filter: 'audioonly', highWaterMark: 1 << 25 });

		if (!audioBitstream) {
			return null;
		}

		const audioResource = createAudioResource(audioBitstream, { inlineVolume: true });
		return audioResource;
	} catch (error) {
		console.error(error);
		return null;
	}
}
