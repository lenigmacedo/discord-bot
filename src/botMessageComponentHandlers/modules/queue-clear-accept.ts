import { AudioInterface } from 'bot-classes';
import { Guild } from 'discord.js';
import { MessageComponentHandler } from '../MessageComponentHandler.types';

const queueClearAccept: MessageComponentHandler = async interaction => {
	try {
		if (!(interaction.guild instanceof Guild)) {
			return;
		}

		const audioInterface = AudioInterface.getInterfaceForGuild(interaction.guild);

		if ((await audioInterface.queueGetLength()) > 0) {
			await audioInterface.queueDelete();
			await interaction.reply("🚮 The queue has been deleted. I hope that wasn't a mistake!");
		} else {
			await interaction.reply({
				content: 'ℹ️ Uhhh, the queue is now empty. Maybe it was deleted whilst you was making your decision.',
				ephemeral: true
			});
		}
	} catch (error) {
		console.error(error);
	}
};

export default queueClearAccept;
