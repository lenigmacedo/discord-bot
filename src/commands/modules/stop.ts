import { AudioInterface } from 'bot-classes';
import { CommandHandler } from '../CommandHandler.types';

const stop: CommandHandler = async interaction => {
	try {
		if (!interaction.guild) {
			return;
		}

		await interaction.deferReply();
		const audioInterface = AudioInterface.getInterfaceForGuild(interaction.guild);

		if (!audioInterface.isBusy()) {
			await interaction.editReply('🚨 Nothing to stop.');
			return;
		}

		audioInterface.deleteConnection();
		await interaction.editReply('✅ I have been stopped.');
	} catch (error) {
		console.error(error);
	}
};

export default stop;
