import { SlashCommandBuilder } from '@discordjs/builders';
import { UserInteraction, YouTubeInterface } from 'bot-classes';
import { ResponseEmojis } from 'bot-config';
import { CommandInteraction } from 'discord.js';
import { BaseCommand } from '../BaseCommand';

export default class Stop implements BaseCommand {
	constructor(public commandInteraction: CommandInteraction) {}

	register() {
		return new SlashCommandBuilder().setName('stop').setDescription('Stop the bot from playing.');
	}

	async runner() {
		const handler = await new UserInteraction(this.commandInteraction).init(false);

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
