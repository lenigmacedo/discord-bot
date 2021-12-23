import { Command, YouTubeInterface } from 'bot-classes';
import { ResponseEmojis } from 'bot-config';
import { initComponentInteractionHandler } from 'bot-functions';
import { Message, MessageActionRow, MessageButton } from 'discord.js';
import { CommandHandler } from '../CommandHandler.types';

const clear: CommandHandler = async initialInteraction => {
	const handler = await new Command(initialInteraction).init();

	try {
		handler.voiceChannel;

		const guild = handler.guild;
		const youtubeHandler = YouTubeInterface.getInterfaceForGuild(guild);
		const queueLength = await youtubeHandler.queue.queueLength();

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
	} catch (error) {
		handler.followUpEmoji('There was a problem executing your request.', ResponseEmojis.Danger);
		console.error(error);
	}
};

export default clear;
