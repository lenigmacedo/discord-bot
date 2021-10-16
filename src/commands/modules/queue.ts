import { AudioInterface } from 'bot-classes';
import { CommandHandler } from '../CommandHandler.types';

const queue: CommandHandler = async interaction => {
	if (!interaction.guild) return;

	const audioInterface = AudioInterface.getInterfaceForGuild(interaction.guild);

	const queue = await audioInterface.queueGetMultiple();

	if (!queue.length) {
		await interaction.reply('The queue is empty.');
		return;
	}

	const reply = `**Displaying the first ${queue.length} items in the queue:**\n${queue.map((item, index) => `${index + 1}) \`${item}\``).join('\n')}`;

	interaction.reply(reply);
};

export default queue;
