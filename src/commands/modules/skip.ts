import { AudioInterface } from 'bot-classes';
import { CommandHandler } from '../CommandHandler.types';

const skip: CommandHandler = async interaction => {
	if (!interaction.guild) return;

	const audioInterface = AudioInterface.getInterfaceForGuild(interaction.guild);

	const skipped = audioInterface.emitAudioFinish();

	if (skipped) interaction.reply('The audio has been skipped.');
	else interaction.reply('I cannot skip as I am not playing anything!');
};

export default skip;
