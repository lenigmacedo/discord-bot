import { SlashCommandBuilder } from '@discordjs/builders';
import { UserInteraction, YouTubeInterface } from 'bot-classes';
import { ResponseEmojis } from 'bot-config';
import { CommandInteraction } from 'discord.js';
import { BaseCommand } from '../BaseCommand';
import { command } from '../decorators/command';

export default class Stop implements BaseCommand {
	register() {
		return new SlashCommandBuilder().setName('stop').setDescription('Stop the bot from playing.');
	}

	@command()
	async runner(commandInteraction: CommandInteraction) {
		const handler = await new UserInteraction(commandInteraction).init(false);

		handler.voiceChannel;

		const audioInterface = YouTubeInterface.fromGuild(handler.guild);

		if (!audioInterface.busy) {
			await handler.editWithEmoji('Nothing to stop.', ResponseEmojis.Danger);
			return;
		}

		audioInterface.deleteConnection();
		await handler.editWithEmoji('I have been stopped.', ResponseEmojis.Success);
	}
}
