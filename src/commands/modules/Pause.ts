import { Command, YouTubeInterface } from 'bot-classes';
import { ResponseEmojis } from 'bot-config';
import { CommandInteraction } from 'discord.js';
import { BaseCommand } from '../BaseCommand';

export class Pause implements BaseCommand {
	constructor(public commandInteraction: CommandInteraction) {}

	async runner() {
		const handler = await new Command(this.commandInteraction).init();

		try {
			handler.voiceChannel;

			const youtubeInterface = YouTubeInterface.getInterfaceForGuild(handler.guild);
			const paused = youtubeInterface.player.pause(true);

			if (paused) {
				await handler.editWithEmoji('The audio has been paused.', ResponseEmojis.Success);
			} else {
				await handler.editWithEmoji('Nothing to pause.', ResponseEmojis.Info);
			}
		} catch (error: any) {
			handler.editWithEmoji(error.message, ResponseEmojis.Danger);
			console.error(error);
		}
	}
}
