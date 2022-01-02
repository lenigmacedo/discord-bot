import { SlashCommandBuilder } from '@discordjs/builders';
import { UserInteraction, YouTubeInterface } from 'bot-classes';
import { ResponseEmojis } from 'bot-config';
import { CommandInteraction } from 'discord.js';
import { BaseCommand } from '../BaseCommand';
import { catchable } from '../decorators/catchable';

export default class Loop implements BaseCommand {
	register() {
		return new SlashCommandBuilder()
			.setName('loop')
			.setDescription('Loop the queue.')
			.addBooleanOption(option => option.setName('enabled').setDescription('Turn this feature on or off.').setRequired(true));
	}

	@catchable
	async runner(commandInteraction: CommandInteraction) {
		const handler = await new UserInteraction(commandInteraction).init(true);

		handler.voiceChannel;

		const youtubeInterface = YouTubeInterface.fromGuild(handler.guild);
		const looped = handler.commandInteraction.options.getBoolean('enabled', true);
		youtubeInterface.loop = looped;
		handler.editWithEmoji(`Playlist loop set to ${looped}.`, ResponseEmojis.Success);
	}
}
