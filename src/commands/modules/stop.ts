import { YouTubeInterface } from 'bot-classes';
import { getCommandIntraction } from 'bot-functions';
import { CommandHandler } from '../CommandHandler.types';

const stop: CommandHandler = async initialInteraction => {
	try {
		const commandInteraction = getCommandIntraction(initialInteraction);

		if (!commandInteraction) {
			return;
		}

		const { interaction, guild, guildMember } = commandInteraction;
		await interaction.deferReply();

		if (!guildMember.voice.channel) {
			await interaction.editReply('🚨 You must be connected to a voice channel for me to stop the queue!');
			return;
		}

		const audioInterface = YouTubeInterface.getInterfaceForGuild(guild);

		if (!audioInterface.getBusyStatus()) {
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
