import { AudioInterface } from 'bot-classes';
import { CommandHandler } from '../CommandHandler.types';

const pause: CommandHandler = async interaction => {
	if (!interaction.guild) return;
	await interaction.reply('Trying to pause...');
	const audioInterface = AudioInterface.getInterfaceForGuild(interaction.guild);
	const paused = audioInterface.getPlayer().pause(true);
	if (paused) await interaction.editReply('The audio has been paused.');
	else await interaction.editReply('I could not pause the audio.');
};

export default pause;
