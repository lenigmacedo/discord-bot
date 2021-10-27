import { Guild } from 'discord.js';
import { MessageComponentHandler } from '../MessageComponentHandler.types';

const queueClearAccept: MessageComponentHandler = async interaction => {
	try {
		if (!(interaction.guild instanceof Guild)) {
			return;
		}

		await interaction.reply({ content: "Ok! Don't scare me like that again!", ephemeral: true });
	} catch (error) {
		console.error(error);
	}
};

export default queueClearAccept;
