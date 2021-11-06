import config from 'bot-config';
import { CollectorFilter, CommandInteraction, Message, MessageComponentInteraction } from 'discord.js';

type ComponentInteractionFilter = CollectorFilter<[MessageComponentInteraction]>;

/**
 * This function creates an event listener for the interaction response for things like buttons and dropdown menus.
 * It checks that the user who originally sent the message is the one that interacts and then disposes of the event listener when it is used once.
 * It also removes any components that are no longer in use.
 * This will hook into the componententeractions/modules folder. Make sure the file is the same name as the component's custom id to register it.
 */
const initOneTimeUseComponentInteraction = (interactableMessage: Message, initialInteraction: CommandInteraction) => {
	try {
		if (!interactableMessage.components.length) {
			return;
		}

		const filter: ComponentInteractionFilter = messageComponentInteraction => {
			if (messageComponentInteraction.user.id === initialInteraction.member?.user.id) return true;
			return false;
		};

		const collector = interactableMessage.createMessageComponentCollector({
			max: 1,
			time: config.searchExpiryMilliseconds,
			filter
		});

		collector.on('end', async collected => {
			const message = collected.first();

			if (!message) {
				initialInteraction.editReply({ components: [] });
				return;
			}

			const handlerModule = await import(`bot-message-component-handlers/modules/${message.customId}`);
			handlerModule.default(message, initialInteraction);
		});
	} catch (error) {
		console.error(error);
	}
};

export default initOneTimeUseComponentInteraction;
