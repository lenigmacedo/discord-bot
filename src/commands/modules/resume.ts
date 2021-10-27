import { AudioInterface } from 'bot-classes';
import { CommandHandler } from '../CommandHandler.types';

const resume: CommandHandler = async interaction => {
	try {
		if (!interaction.guild) {
			return;
		}

		await interaction.reply('Trying to resume...');
		const audioInterface = AudioInterface.getInterfaceForGuild(interaction.guild);
		const unpaused = audioInterface.getPlayer().unpause();
		if (unpaused) await interaction.editReply('The audio has been resumed.');
		else await interaction.editReply('I could not unpause the audio.');
	} catch (error) {
		console.error(error);
	}
};

export default resume;
