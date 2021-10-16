import { AudioInterface } from 'bot-classes';
import { safeJoinVoiceChannel } from 'bot-functions';
import { CommandHandler } from '../CommandHandler.types';

const queue: CommandHandler = async interaction => {
	if (!interaction.guild) return;

	const audioInterface = AudioInterface.getInterfaceForGuild(interaction.guild);

	const queue = await audioInterface.queueGetAll();

	if (!queue.length) {
		interaction.reply('The queue is empty.');
	}

	const runNow = interaction.options.getBoolean('run-now');

	if (!runNow) {
		const reply = `**You have ${queue.length} items in the queue:**\n${queue.map((item, index) => `${index + 1}) \`${item}\``).join('\n')}`;
		interaction.reply(reply);
		return;
	}

	if (audioInterface.isBusy()) {
		interaction.reply('I am busy!');
		return;
	}

	await interaction.reply('Preparing to play...');

	audioInterface.setConnection(safeJoinVoiceChannel(interaction));

	await interaction.editReply('I am now playing the queue.');

	while (await audioInterface.queueRunner());

	audioInterface.deleteConnection();
};

export default queue;
