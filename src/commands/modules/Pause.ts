import { SlashCommandBuilder } from '@discordjs/builders';
import { UserInteraction, YouTubeInterface } from 'bot-classes';
import { ResponseEmojis } from 'bot-config';
import { CommandInteraction } from 'discord.js';
import { BaseCommand } from '../BaseCommand';

export default class Pause implements BaseCommand {
	constructor(public commandInteraction: CommandInteraction) {}

	register() {
		return new SlashCommandBuilder().setName('pause').setDescription('Pause the bot from playing audio.');
	}

	async runner() {
		const handler = await new UserInteraction(this.commandInteraction).init();

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
