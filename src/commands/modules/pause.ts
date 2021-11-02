import { YouTubeInterface } from 'bot-classes';
import { getCommandIntraction } from 'bot-functions';
import { CommandHandler } from '../CommandHandler.types';

const pause: CommandHandler = async initialInteraction => {
	try {
		const commandInteraction = getCommandIntraction(initialInteraction);

		if (!commandInteraction) {
			return;
		}

		const { interaction, guild, guildMember } = commandInteraction;
		await interaction.deferReply();

		if (!guildMember.voice.channel) {
			await interaction.editReply('🚨 You must be connected to a voice channel for me to pause!');
			return;
		}

		const audioInterface = YouTubeInterface.getInterfaceForGuild(guild);
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
