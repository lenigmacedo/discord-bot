import { Command, YouTubeInterface } from 'bot-classes';
import { ResponseEmojis } from 'bot-config';
import { getYouTubeUrls, safeJoinVoiceChannel } from 'bot-functions';
import { CommandInteraction } from 'discord.js';
import { BaseCommand } from '../BaseCommand';

export class Play implements BaseCommand {
	constructor(public commandInteraction: CommandInteraction) {}

	async runner() {
		const handler = await new Command(this.commandInteraction).init();

		try {
			handler.voiceChannel;

			const queryOrUrl = handler.commandInteraction.options.getString('url-or-query', true);
			const youtubeInterface = YouTubeInterface.getInterfaceForGuild(handler.guild);

			if (youtubeInterface.getBusyStatus()) {
				await handler.editWithEmoji('I am busy!', ResponseEmojis.Danger);
				return;
			}

			let prepended = await youtubeInterface.queue.queuePrepend(queryOrUrl);
			let url = '';

			if (!prepended) {
				console.log('Query not URL, trying a search...');
				const urls = await getYouTubeUrls(queryOrUrl, 1);
				url = urls[0];
				prepended = await youtubeInterface.queue.queuePrepend(url);

				if (!prepended) {
					await handler.editWithEmoji('I could not find a video. Try something less specific?', ResponseEmojis.Danger);
					return;
				}
			} else {
				url = queryOrUrl;
			}

			await handler.editWithEmoji('Preparing to play...', ResponseEmojis.Loading);
			youtubeInterface.setConnection(safeJoinVoiceChannel(handler.commandInteraction));
			const videoDetails = await youtubeInterface.getDetails(url);

			if (videoDetails) {
				await handler.commandInteraction.editReply(`🔊 Playing \`${videoDetails?.videoDetails.title}\`.`);
			} else {
				await handler.editWithEmoji(
					'Unable to play the video. It might be private, age restricted or something else. It will be skipped.',
					ResponseEmojis.Danger
				);
			}

			while (await youtubeInterface.queueRunner());
			youtubeInterface.deleteConnection();
		} catch (error: any) {
			handler.editWithEmoji(error.message, ResponseEmojis.Danger);
			console.error(error);
		}
	}
}
