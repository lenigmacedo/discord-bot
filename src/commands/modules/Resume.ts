import { SlashCommandBuilder } from '@discordjs/builders';
import { UserInteraction, YouTubeInterface } from 'bot-classes';
import { ResponseEmojis } from 'bot-config';
import { CommandInteraction } from 'discord.js';
import { BaseCommand } from '../BaseCommand';
import { command } from '../decorators/command';

export default class Resume implements BaseCommand {
	register() {
		return new SlashCommandBuilder().setName('resume').setDescription('Resume the bot if it is paused.');
	}

	@command()
	async runner(commandInteraction: CommandInteraction) {
		const handler = await new UserInteraction(commandInteraction).init(false);

		handler.voiceChannel;

		const youtubeInterface = YouTubeInterface.fromGuild(handler.guild);
		const unpaused = youtubeInterface.player.unpause();

		if (unpaused) {
			await handler.editWithEmoji('The audio has been resumed.', ResponseEmojis.Success);
		} else {
			await handler.editWithEmoji('Nothing to resume.', ResponseEmojis.Danger);
		}
	}
}
