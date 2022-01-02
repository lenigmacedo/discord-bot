import { YouTubeInterface } from 'bot-classes';
import { ResponseEmojis } from 'bot-config';
import { Guild } from 'discord.js';
import { MessageComponentHandler } from '../MessageComponentHandler.types';

const queueClearAccept: MessageComponentHandler = async (interaction, initialInteraction) => {
	try {
		if (!(interaction.guild instanceof Guild)) {
			return;
		}

		const audioInterface = YouTubeInterface.fromGuild(interaction.guild);

		if ((await audioInterface.queue.length()) > 0) {
			const deleted = await audioInterface.queue.purge();

			if (deleted)
				await initialInteraction?.editReply({
					content: `${ResponseEmojis.Rubbish} The queue has been deleted. I hope that wasn't a mistake!`,
					components: []
				});
			else
				await initialInteraction?.editReply({
					content: `${ResponseEmojis.Danger} I was unable to delete the queue.`,
					components: []
				});
		} else {
			await initialInteraction?.editReply({
				content: `${ResponseEmojis.Info} The queue is empty. Maybe it was deleted whilst you was making your decision.`,
				components: []
			});
		}
	} catch (error) {
		console.error(error);
	}
};

export default queueClearAccept;
