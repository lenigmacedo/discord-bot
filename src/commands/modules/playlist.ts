import { YouTubeInterface } from 'bot-classes';
import { getCommandIntraction } from 'bot-functions';
import getYoutubePlaylistUrls from 'bot-functions/modules/getPlaylistUrls';
import getYoutubePlaylistId from 'bot-functions/modules/getYouTubePlaylistId';
import { CommandHandler } from '../CommandHandler.types';

const playlist: CommandHandler = async initialInteraction => {
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
		const playlistUrl = interaction.options.getString('url', true);
		const playlistId = getYoutubePlaylistId(playlistUrl);

		if (!playlistId) {
			await interaction.editReply('🚨 URL provided is not valid, try again?');
			return;
		}

		await interaction.editReply('🔃 Searching for videos in the playlist. Please wait...');
		const videoUrlsFromPlaylist = await getYoutubePlaylistUrls(playlistId);
		const awaitingAppendedUrls = videoUrlsFromPlaylist.map(videoUrl => audioInterface.queueAppend(videoUrl));
		const resolvedAppendedUrls = await Promise.all(awaitingAppendedUrls);
		const filteredAppendedUrls = resolvedAppendedUrls.filter(Boolean);
		const count = filteredAppendedUrls.length;

		if (count > 0) {
			await interaction.editReply(`✅ Added ${count} video${count > 1 ? 's' : ''} to the queue.`);
		} else {
			await interaction.editReply('🚨 Failed to add playlist items to the queue. Is the URL valid?');
		}
	} catch (error) {
		console.error(error);
	}
};

export default playlist;
