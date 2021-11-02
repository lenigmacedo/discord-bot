import { YouTubeInterface } from 'bot-classes';
import { getCommandIntraction } from 'bot-functions';
import { CommandHandler } from '../CommandHandler.types';

const volume: CommandHandler = async initialInteraction => {
	try {
		const commandInteraction = getCommandIntraction(initialInteraction);

		if (!commandInteraction) return;

		const { interaction, guild, guildMember } = commandInteraction;
		const voiceChannel = guildMember.voice.channel;
		await interaction.deferReply();

		if (!voiceChannel) {
			await interaction.editReply('🚨 You must be connected to a voice channel for me to modify the volume!');
			return;
		}

		const audioInterface = YouTubeInterface.getInterfaceForGuild(guild);
		const volumeLevel = interaction.options.getNumber('level', true);
		const isSet = audioInterface.setVolume(volumeLevel);

		if (isSet) interaction.editReply(`🔊 Set volume to \`${volumeLevel}%\``);
		else interaction.editReply('🚨 Could not set the volume! Make sure it is between 0 and 100.');
	} catch (error) {
		console.error(error);
	}
};

export default volume;
