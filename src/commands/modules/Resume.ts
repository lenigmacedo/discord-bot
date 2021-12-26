import { SlashCommandBuilder } from '@discordjs/builders';
import { UserInteraction, YouTubeInterface } from 'bot-classes';
import { ResponseEmojis } from 'bot-config';
import { CommandInteraction } from 'discord.js';
import { BaseCommand } from '../BaseCommand';

export default class Resume implements BaseCommand {
	constructor(public commandInteraction: CommandInteraction) {}

	register() {
		return new SlashCommandBuilder().setName('resume').setDescription('Resume the bot if it is paused.');
	}

	async runner() {
		const handler = await new UserInteraction(this.commandInteraction).init();

		try {
			handler.voiceChannel;

			const youtubeInterface = YouTubeInterface.getInterfaceForGuild(handler.guild);
			const unpaused = youtubeInterface.player.unpause();

			if (unpaused) {
				await handler.editWithEmoji('The audio has been resumed.', ResponseEmojis.Success);
			} else {
				await handler.editWithEmoji('Nothing to resume.', ResponseEmojis.Danger);
			}
		} catch (error: any) {
			handler.editWithEmoji(error.message, ResponseEmojis.Danger);
			console.error(error);
		}
	}
}
