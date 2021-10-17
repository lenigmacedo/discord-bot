import { AudioInterface } from 'bot-classes';
import { GuildMember } from 'discord.js';
import { CommandHandler } from '../CommandHandler.types';

const skip: CommandHandler = async interaction => {
	const guildMember = interaction.member;
	if (!interaction?.guild?.id || !(guildMember instanceof GuildMember)) {
		return;
	}

	// Prevents cheeky people from skipping when they're not connected with the people listening!
	const voiceChannel = guildMember.voice.channel;
	if (!voiceChannel) {
		await interaction.reply('You must be connected to a voice channel for me to skip the audio!');
		return;
	}

	const audioInterface = AudioInterface.getInterfaceForGuild(interaction.guild);

	const skipped = audioInterface.emitAudioFinish();

	if (skipped) interaction.reply('The audio has been skipped.');
	else interaction.reply('I cannot skip as I am not playing anything!');
};

export default skip;
