import { YouTubeInterface } from 'bot-classes';
import { getCommandIntraction } from 'bot-functions';
import { CommandHandler } from '../CommandHandler.types';

const skip: CommandHandler = async initialInteraction => {
	try {
		const commandInteraction = getCommandIntraction(initialInteraction);

		if (!commandInteraction) {
			return;
		}

		const { interaction, guild, guildMember } = commandInteraction;
		await interaction.deferReply();

		if (!guildMember.voice.channel) {
			await interaction.editReply('🚨 You must be connected to a voice channel for me to skip the audio!');
			return;
		}

		const audioInterface = YouTubeInterface.getInterfaceForGuild(guild);
		const skipped = audioInterface.emitAudioFinish();

		if (skipped) {
			await interaction.editReply('➡️ The audio has been skipped.');
		} else {
			await interaction.editReply('🚨 I cannot skip as I am not playing anything!');
		}
	} catch (error) {
		console.error(error);
	}
};

export default skip;
