import { Command, YouTubeInterface } from 'bot-classes';
import { ResponseEmojis } from 'bot-config';
import { CommandInteraction } from 'discord.js';
import { BaseCommand } from '../BaseCommand';

export class Enqueue implements BaseCommand {
	constructor(public commandInteraction: CommandInteraction) {}

	async runner() {
		const handler = await new Command(this.commandInteraction).init();

		try {
			handler.voiceChannel;

			const youtubeInterface = YouTubeInterface.getInterfaceForGuild(handler.guild);
			const youtubeUrl = handler.commandInteraction.options.getString('url', true);
			const videoDetails = await youtubeInterface.getDetails(youtubeUrl);

			if (!videoDetails) {
				await handler.editWithEmoji(
					'I could not add that item to the queue. Is it a valid URL? Is it age restricted or private?',
					ResponseEmojis.Danger
				);
				return;
			}

			const appended = await youtubeInterface.queue.queueAppend(youtubeUrl);

			if (appended) await handler.editWithEmoji(`Enqueued \`${videoDetails.videoDetails.title}\`.`, ResponseEmojis.Success);
			else await handler.editWithEmoji('I could not add that item to the queue. Is it a valid URL?', ResponseEmojis.Danger);
		} catch (error: any) {
			handler.editWithEmoji(error.message, ResponseEmojis.Danger);
			console.error(error);
		}
	}
}
