import { AudioInterface } from 'bot-classes';
import { safeJoinVoiceChannel } from 'bot-functions';
import { GuildMember } from 'discord.js';
import { CommandHandler } from '../CommandHandler.types';

const start: CommandHandler = async interaction => {
	try {
		const guildMember = interaction.member;
		await interaction.deferReply();

		if (!interaction?.guild?.id || !(guildMember instanceof GuildMember)) {
			return;
		}

		const voiceChannel = guildMember.voice.channel;

		if (!voiceChannel) {
			await interaction.editReply('🚨 You must be connected to a voice channel for me to know where to join!');
			return;
		}

		const audioInterface = AudioInterface.getInterfaceForGuild(interaction.guild);
		const queue = await audioInterface.queueGetMultiple();

		if (!queue.length) {
			await interaction.editReply('🚨 The queue is empty.');
			return;
		}

		if (audioInterface.isBusy()) {
			await interaction.editReply('🚨 I am busy!');
			return;
		}

		await interaction.editReply('🔃 Preparing to play...');
		audioInterface.setConnection(safeJoinVoiceChannel(interaction));
		await interaction.editReply('🔊 I am now playing the queue.');
		while (await audioInterface.queueRunner());
		audioInterface.deleteConnection();
	} catch (error) {
		console.error(error);
	}
};

export default start;
