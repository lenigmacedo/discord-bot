import { handleMessageComponentEvent } from 'bot-functions';
import { CollectorFilter, CommandInteraction, Message, MessageComponentInteraction } from 'discord.js';

/**
 * This function creates an event listener for the interaction response for things like buttons and dropdown menus.
 * It checks that the user who originally sent the message is the one that interacts and then disposes of the event listener when it is used once.
 */
const initOneTimeUseComponentInteraction = (interactableMessage: Message, initialInteraction: CommandInteraction) => {
	try {
		if (!interactableMessage.components.length) {
			return;
		}

		const filter: CollectorFilter<[MessageComponentInteraction]> = messageComponentInteraction => {
			if (messageComponentInteraction.user.id === initialInteraction.member?.user.id) return true;
			return false;
		};

		const collector = interactableMessage.createMessageComponentCollector({
			max: 1,
			filter
		});

		collector.on('end', handleMessageComponentEvent);
	} catch (error) {
		console.error(error);
	}
};

export default initOneTimeUseComponentInteraction;
