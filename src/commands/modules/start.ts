import { YouTubeInterface } from 'bot-classes';
import { getCommandIntraction, safeJoinVoiceChannel } from 'bot-functions';
import { CommandHandler } from '../CommandHandler.types';

const start: CommandHandler = async initialInteraction => {
	try {
		const commandInteraction = getCommandIntraction(initialInteraction);

		if (!commandInteraction) {
			return;
		}

		const { interaction, guild, guildMember } = commandInteraction;
		await interaction.deferReply();

		if (!guildMember.voice.channel) {
			await interaction.editReply('🚨 You must be connected to a voice channel for me to start the queue!');
			return;
		}

		const audioInterface = YouTubeInterface.getInterfaceForGuild(guild);
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
