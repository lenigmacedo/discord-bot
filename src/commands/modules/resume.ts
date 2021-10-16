import { AudioInterface } from 'bot-classes';
import { CommandHandler } from '../CommandHandler.types';

const resume: CommandHandler = async interaction => {
	if (!interaction.guild) return;

	const audioInterface = AudioInterface.getInterfaceForGuild(interaction.guild);

	audioInterface.getPlayer().unpause();

	interaction.reply('The audio has been resumed.');
};

export default resume;
