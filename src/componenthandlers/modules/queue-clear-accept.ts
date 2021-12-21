import { YouTubeInterface } from 'bot-classes';
import { Guild } from 'discord.js';
import { MessageComponentHandler } from '../MessageComponentHandler.types';

const queueClearAccept: MessageComponentHandler = async (interaction, initialInteraction) => {
	try {
		if (!(interaction.guild instanceof Guild)) {
			return;
		}

		const audioInterface = YouTubeInterface.getInterfaceForGuild(interaction.guild);

		if ((await audioInterface.queue.queueLength()) > 0) {
			const deleted = await audioInterface.queue.queuePurge();

			if (deleted)
				await initialInteraction?.editReply({
					content: "🚮 The queue has been deleted. I hope that wasn't a mistake!",
					components: []
				});
			else
				await initialInteraction?.editReply({
					content: '🚨 I was unable to delete the queue.',
					components: []
				});
		} else {
			await initialInteraction?.editReply({
				content: '🚨 The queue is empty. Maybe it was deleted whilst you was making your decision.',
				components: []
			});
		}
	} catch (error) {
		console.error(error);
	}
};

export default queueClearAccept;
