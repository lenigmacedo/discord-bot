import { AudioInterface } from 'bot-classes';
import { Guild } from 'discord.js';
import { MessageComponentHandler } from '../MessageComponentHandler.types';

const searchVideoSelection: MessageComponentHandler = async interaction => {
	try {
		if (!(interaction.guild instanceof Guild)) {
			return;
		}

		if (!interaction.isSelectMenu()) {
			return;
		}

		const audioInterface = AudioInterface.getInterfaceForGuild(interaction.guild);
		const value = interaction?.values[0];

		if (!value) {
			interaction.reply('I could not find the video from the selection. Try again?');
		}

		const appended = await audioInterface.queueAppend(value);

		if (appended) {
			interaction.reply('I have added it to the queue!');
		} else {
			interaction.reply('I was unable to add that video to the queue. Try again?');
		}
	} catch (error) {
		console.error(error);
	}
};

export default searchVideoSelection;
