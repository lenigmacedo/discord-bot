import { Guild } from 'discord.js';
import { MessageComponentHandler } from '../MessageComponentHandler.types';

const queueClearDecline: MessageComponentHandler = async (interaction, initialInteraction) => {
	try {
		if (!(interaction.guild instanceof Guild)) {
			return;
		}

		await initialInteraction?.editReply({
			content: "😔 Ok! Don't scare me like that again!",
			components: []
		});
	} catch (error) {
		console.error(error);
	}
};

export default queueClearDecline;
