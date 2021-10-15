import { Queue } from 'bot-classes';
import { CommandHandler } from '../CommandHandler.types';

const resume: CommandHandler = async interaction => {
	if (!interaction.guild) return;

	const queue = Queue.getQueue(interaction.guild);

	queue.getPlayer().unpause();

	interaction.reply('The audio has been resumed.');
};

export default resume;
