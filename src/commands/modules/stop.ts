import { AudioInterface } from 'bot-classes';
import { CommandHandler } from '../CommandHandler.types';

const stop: CommandHandler = async interaction => {
	if (!interaction.guild) return;

	const audioInterface = AudioInterface.getInterfaceForGuild(interaction.guild);

	if (!audioInterface.isBusy()) {
		interaction.reply('I am not doing anything that needs stopping.');
		return;
	}

	audioInterface.deleteConnection();

	interaction.reply('The bot has been stopped.');
};

export default stop;
