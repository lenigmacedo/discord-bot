import { YouTubeInterface } from 'bot-classes';
import { Guild } from 'discord.js';
import { MessageComponentHandler } from '../MessageComponentHandler.types';

const queueClearAccept: MessageComponentHandler = async interaction => {
	try {
		if (!(interaction.guild instanceof Guild)) {
			return;
		}

		const audioInterface = YouTubeInterface.getInterfaceForGuild(interaction.guild);
		await interaction.deferReply();

		if ((await audioInterface.queueGetLength()) > 0) {
			const deleted = await audioInterface.queueDelete();
			if (deleted) await interaction.editReply("🚮 The queue has been deleted. I hope that wasn't a mistake!");
			else await interaction.editReply('🚨 I was unable to delete the queue.');
		} else {
			await interaction.editReply('🚨 The queue is empty. Maybe it was deleted whilst you was making your decision.');
		}
	} catch (error) {
		console.error(error);
	}
};

export default queueClearAccept;
