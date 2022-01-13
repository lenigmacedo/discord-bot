import { SlashCommandBuilder } from '@discordjs/builders';
import { CmdRequirementError, CommandInteractionHelper, YouTubeInterface } from 'bot-classes';
import { ResponseEmojis } from 'bot-config';
import { MessageActionRow, MessageButton } from 'discord.js';
import { BaseCommand } from '../BaseCommand';
import { command } from '../decorators/command';

export default class Clear implements BaseCommand {
	register() {
		return new SlashCommandBuilder().setName('clear').setDescription('Clear the entire queue.');
	}

	@command({
		requires: ['ADMINISTRATOR'],
		enforceVoiceConnection: true
	})
	async runner(handler: CommandInteractionHelper) {
		const guild = handler.guild;
		const youtubeHandler = YouTubeInterface.fromGuild(guild);
		const queueLength = await youtubeHandler.queue.length();

		if (queueLength < 1) throw new CmdRequirementError('The queue is empty!');

		const actionRow = new MessageActionRow().addComponents(
			new MessageButton().setCustomId('queue-clear-accept').setLabel('Delete!').setStyle('DANGER'),
			new MessageButton().setCustomId('queue-clear-decline').setLabel('Leave it!').setStyle('SUCCESS')
		);

		const botMessage = await handler.respondWithEmoji(
			{
				content: `Are you sure you want to delete the ENTIRE queue?\n${queueLength} item${queueLength > 1 ? 's' : ''} will be removed.`,
				components: [actionRow]
			},
			ResponseEmojis.Info
		);

		handler.componentInteractionHandler(botMessage);
	}
}
