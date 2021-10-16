import { AudioInterface } from 'bot-classes';
import { safeJoinVoiceChannel } from 'bot-functions';
import { CommandHandler } from '../CommandHandler.types';

const start: CommandHandler = async interaction => {
	if (!interaction.guild) return;

	const audioInterface = AudioInterface.getInterfaceForGuild(interaction.guild);

	const queue = await audioInterface.queueGetMultiple();

	if (!queue.length) {
		await interaction.reply('The queue is empty.');
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

export default start;
