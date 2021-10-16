import { createAudioResource } from '@discordjs/voice';
import ytdl from 'ytdl-core-discord';

export default async function downloadYtVideo(url: string) {
	if (!ytdl.validateURL(url)) return null;
	const audioBitstream = await ytdl(url, { filter: 'audioonly' });
	const audioResource = createAudioResource(audioBitstream);

	return audioResource;
}
