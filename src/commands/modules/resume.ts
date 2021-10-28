import { AudioInterface } from 'bot-classes';
import { CommandHandler } from '../CommandHandler.types';

const resume: CommandHandler = async interaction => {
	try {
		if (!interaction.guild) {
			return;
		}

		await interaction.deferReply();
		const audioInterface = AudioInterface.getInterfaceForGuild(interaction.guild);
		const unpaused = audioInterface.getPlayer().unpause();
		if (unpaused) await interaction.editReply('✅ The audio has been resumed.');
		else await interaction.editReply('🚨 Nothing to resume.');
	} catch (error) {
		console.error(error);
	}
};

export default resume;
