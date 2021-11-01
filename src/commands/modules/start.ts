import { YouTubeInterface } from 'bot-classes';
import { safeJoinVoiceChannel } from 'bot-functions';
import { GuildMember } from 'discord.js';
import { CommandHandler } from '../CommandHandler.types';

const start: CommandHandler = async interaction => {
	try {
		const guildMember = interaction.member;

		if (!interaction?.guild?.id || !(guildMember instanceof GuildMember)) {
			return;
		}

		await interaction.deferReply();
		const voiceChannel = guildMember.voice.channel;

		if (!voiceChannel) {
			await interaction.editReply('🚨 You must be connected to a voice channel for me to know where to join!');
			return;
		}

		const audioInterface = YouTubeInterface.getInterfaceForGuild(interaction.guild);
		const queue = await audioInterface.queueGetMultiple();

		if (!queue.length) {
			await interaction.editReply('🚨 The queue is empty.');
			return;
		}

		if (audioInterface.getBusyStatus()) {
			await interaction.editReply('🚨 I am busy!');
			return;
		}

		await interaction.editReply('🔃 Preparing to play...');
		audioInterface.setConnection(safeJoinVoiceChannel(interaction));
		const firstItemInQueue = await audioInterface.queueGetOldest();

		if (!firstItemInQueue) {
			interaction.editReply('🚨 Unable to play the track.');
			return;
		}

		const videoDetails = await audioInterface.getDetails((await audioInterface.queueGetOldest()) as string);

		if (videoDetails) {
			await interaction.editReply(`🔊 I am now playing the queue. First up \`${videoDetails.videoDetails.title}\`!`);
		} else {
			await interaction.editReply('🔊 I am now playing the queue.'); // If the video is invalid, the queue should handle it and skip it.
		}

		while (await audioInterface.queueRunner());
		audioInterface.deleteConnection();
	} catch (error) {
		console.error(error);
	}
};

export default start;
