import { Queue } from 'bot-classes';
import { CommandHandler } from '../CommandHandler.types';

const pause: CommandHandler = async interaction => {
	if (!interaction.guild) return;

	const queue = Queue.getQueue(interaction.guild);

	queue.getPlayer().pause();

	interaction.reply('The audio has been paused.');
};

export default pause;
