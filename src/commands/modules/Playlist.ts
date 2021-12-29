import { SlashCommandBuilder } from '@discordjs/builders';
import { UserInteraction, YouTubeInterface, YouTubePlaylist, YouTubeVideo } from 'bot-classes';
import { ResponseEmojis } from 'bot-config';
import { CommandInteraction } from 'discord.js';
import { BaseCommand } from '../BaseCommand';

export default class Playlist implements BaseCommand {
	constructor(public commandInteraction: CommandInteraction) {}

	register() {
		return new SlashCommandBuilder()
			.setName('playlist')
			.setDescription(`Import a playlist into the queue.`)
			.addStringOption(option => option.setName('url').setDescription('The URL containing the playlist ID.').setRequired(true));
	}

	async runner() {
		const handler = await new UserInteraction(this.commandInteraction).init();

		try {
			handler.voiceChannel;

			const audioInterface = YouTubeInterface.getInterfaceForGuild(handler.guild);
			const playlistUrl = handler.commandInteraction.options.getString('url', true);
			const youtubePlaylist = YouTubePlaylist.fromUrl(playlistUrl);

			if (!youtubePlaylist.id) {
				await handler.editWithEmoji('URL provided is not valid, try again?', ResponseEmojis.Danger);
				return;
			}

			await handler.editWithEmoji('Searching for videos in the playlist. Please wait...', ResponseEmojis.Loading);
			const videoUrlsFromPlaylist = await youtubePlaylist.fetchVideoUrls();
			const awaitingAppendedUrls = videoUrlsFromPlaylist.map(videoUrl => audioInterface.queue.queueAppend(YouTubeVideo.fromUrl(videoUrl)));
			const resolvedAppendedUrls = await Promise.all(awaitingAppendedUrls);
			const filteredAppendedUrls = resolvedAppendedUrls.filter(Boolean);
			const totalAppendedUrls = filteredAppendedUrls.length;

			if (totalAppendedUrls > 0) {
				await handler.editWithEmoji(`Added ${totalAppendedUrls} video${totalAppendedUrls > 1 ? 's' : ''} to the queue.`, ResponseEmojis.Success);
			} else {
				await handler.editWithEmoji('Failed to add playlist items to the queue. Is the URL valid?', ResponseEmojis.Danger);
			}
		} catch (error: any) {
			handler.editWithEmoji(error.message, ResponseEmojis.Danger);
			console.error(error);
		}
	}
}
