import { Guild } from 'discord.js';
import { ButtonHandler } from '../ButtonHandler.types';

const queueClearAccept: ButtonHandler = async interaction => {
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
