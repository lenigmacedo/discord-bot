import { YouTubeInterface } from 'bot-classes';
import { getCommandIntraction } from 'bot-functions';
import { CommandHandler } from '../CommandHandler.types';

const enqueue: CommandHandler = async initialInteraction => {
	try {
		const commandInteraction = getCommandIntraction(initialInteraction);

		if (!commandInteraction) {
			return;
		}

		const { interaction, guild, guildMember } = commandInteraction;
		await interaction.deferReply();

		if (!guildMember.voice.channel) {
			await interaction.editReply('🚨 You must be connected to a voice channel for me to modify the queue!');
			return;
		}

		const audioInterface = YouTubeInterface.getInterfaceForGuild(guild);
		const youtubeUrl = interaction.options.getString('url', true);
		const videoDetails = await audioInterface.getDetails(youtubeUrl);

		if (!videoDetails) {
			await interaction.editReply('🚨 I could not add that item to the queue. Is it a valid URL? Is it age restricted or private?');
			return;
		}

		const appended = await audioInterface.queue.queueAppend(youtubeUrl);

		if (appended) {
			await interaction.editReply(`✅ Enqueued \`${videoDetails.videoDetails.title}\`.`);
		} else {
			await interaction.editReply('🚨 I could not add that item to the queue. Is it a valid URL?');
		}
	} catch (error) {
		console.error(error);
	}
};

export default enqueue;
