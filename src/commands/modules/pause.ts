import { AudioInterface } from 'bot-classes';
import { CommandHandler } from '../CommandHandler.types';

const pause: CommandHandler = async interaction => {
	if (!interaction.guild) return;
	const audioInterface = AudioInterface.getInterfaceForGuild(interaction.guild);
	audioInterface.getPlayer().pause();
	interaction.reply('The audio has been paused.');
};

export default pause;
