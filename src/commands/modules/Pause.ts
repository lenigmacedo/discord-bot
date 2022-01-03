import { SlashCommandBuilder } from '@discordjs/builders';
import { UserInteraction, YouTubeInterface } from 'bot-classes';
import { ResponseEmojis } from 'bot-config';
import { CommandInteraction } from 'discord.js';
import { BaseCommand } from '../BaseCommand';
import { command } from '../decorators/command';

export default class Pause implements BaseCommand {
	register() {
		return new SlashCommandBuilder().setName('pause').setDescription('Pause the bot from playing audio.');
	}

	@command()
	async runner(commandInteraction: CommandInteraction) {
		const handler = await new UserInteraction(commandInteraction).init(false);

		handler.voiceChannel;

		const youtubeInterface = YouTubeInterface.fromGuild(handler.guild);
		const paused = youtubeInterface.player.pause(true);

		if (paused) {
			await handler.editWithEmoji('The audio has been paused.', ResponseEmojis.Success);
		} else {
			await handler.editWithEmoji('Nothing to pause.', ResponseEmojis.Info);
		}
	}
}
