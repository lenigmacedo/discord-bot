import { AudioInterface } from 'bot-classes';
import { CommandHandler } from '../CommandHandler.types';

const stop: CommandHandler = async interaction => {
	try {
		if (!interaction.guild) {
			return;
		}

		await interaction.reply('Stopping...');
		const audioInterface = AudioInterface.getInterfaceForGuild(interaction.guild);

		if (!audioInterface.isBusy()) {
			await interaction.editReply('I am not doing anything that needs stopping.');
			return;
		}

		audioInterface.deleteConnection();
		await interaction.editReply('The bot has been stopped.');
	} catch (error) {
		console.error(error);
	}
};

export default stop;
