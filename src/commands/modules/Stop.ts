import { Command, YouTubeInterface } from 'bot-classes';
import { ResponseEmojis } from 'bot-config';
import { CommandInteraction } from 'discord.js';
import { BaseCommand } from '../BaseCommand';

export class Stop implements BaseCommand {
	constructor(public commandInteraction: CommandInteraction) {}

	async runner() {
		const handler = await new Command(this.commandInteraction).init();

		try {
			handler.voiceChannel;

			const audioInterface = YouTubeInterface.getInterfaceForGuild(handler.guild);

			if (!audioInterface.getBusyStatus()) {
				await handler.editWithEmoji('Nothing to stop.', ResponseEmojis.Danger);
				return;
			}

			audioInterface.deleteConnection();
			await handler.editWithEmoji('I have been stopped.', ResponseEmojis.Success);
		} catch (error: any) {
			handler.editWithEmoji(error.message, ResponseEmojis.Danger);
			console.error(error);
		}
	}
}
