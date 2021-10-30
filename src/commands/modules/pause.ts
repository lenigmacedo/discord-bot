import { YouTubeInterface } from 'bot-classes';
import { CommandHandler } from '../CommandHandler.types';

const pause: CommandHandler = async interaction => {
	try {
		if (!interaction.guild) {
			return;
		}

		await interaction.deferReply();
		const audioInterface = YouTubeInterface.getInterfaceForGuild(interaction.guild);
		const paused = audioInterface.getPlayer().pause(true);

		if (paused) {
			await interaction.editReply('✅ The audio has been paused.');
		} else {
			await interaction.editReply('🚨 Nothing to pause.');
		}
	} catch (error) {
		console.error(error);
	}
};

export default pause;
