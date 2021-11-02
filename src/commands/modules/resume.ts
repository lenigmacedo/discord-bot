import { YouTubeInterface } from 'bot-classes';
import { getCommandIntraction } from 'bot-functions';
import { CommandHandler } from '../CommandHandler.types';

const resume: CommandHandler = async initialInteraction => {
	try {
		const commandInteraction = getCommandIntraction(initialInteraction);

		if (!commandInteraction) {
			return;
		}

		const { interaction, guild, guildMember } = commandInteraction;
		await interaction.deferReply();

		if (!guildMember.voice.channel) {
			await interaction.editReply('🚨 You must be connected to a voice channel for me to resume!');
			return;
		}

		const audioInterface = YouTubeInterface.getInterfaceForGuild(guild);
		const unpaused = audioInterface.getPlayer().unpause();

		if (unpaused) {
			await interaction.editReply('✅ The audio has been resumed.');
		} else {
			await interaction.editReply('🚨 Nothing to resume.');
		}
	} catch (error) {
		console.error(error);
	}
};

export default resume;
