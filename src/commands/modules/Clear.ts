import { SlashCommandBuilder } from '@discordjs/builders';
import { UserInteraction, YouTubeInterface } from 'bot-classes';
import { ResponseEmojis } from 'bot-config';
import { initComponentInteractionHandler } from 'bot-functions';
import { CommandInteraction, Message, MessageActionRow, MessageButton } from 'discord.js';
import { BaseCommand } from '../BaseCommand';
import { catchable } from '../decorators/catchable';

export default class Clear implements BaseCommand {
	register() {
		return new SlashCommandBuilder().setName('clear').setDescription('Clear the entire queue.');
	}

	@catchable
	async runner(commandInteraction: CommandInteraction) {
		const handler = await new UserInteraction(commandInteraction).init();

		handler.voiceChannel;

		const guild = handler.guild;
		const youtubeHandler = YouTubeInterface.fromGuild(guild);
		const queueLength = await youtubeHandler.queue.length();

		if (queueLength < 1) {
			handler.editWithEmoji('The queue is empty!', ResponseEmojis.Info);
			return;
		}

		const actionRow = new MessageActionRow().addComponents(
			new MessageButton().setCustomId('queue-clear-accept').setLabel('Delete!').setStyle('DANGER'),
			new MessageButton().setCustomId('queue-clear-decline').setLabel('Leave it!').setStyle('SUCCESS')
		);

		const botMessage = await handler.editWithEmoji(
			{
				content: `Are you sure you want to delete the ENTIRE queue?\n${queueLength} item${queueLength > 1 ? 's' : ''} will be removed.`,
				components: [actionRow]
			},
			ResponseEmojis.Info
		);

		if (botMessage instanceof Message) {
			initComponentInteractionHandler(botMessage, handler.commandInteraction);
		}
	}
}
