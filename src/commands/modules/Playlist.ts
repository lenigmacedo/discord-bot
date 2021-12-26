import { SlashCommandBuilder } from '@discordjs/builders';
import { Command, YouTubeInterface } from 'bot-classes';
import { ResponseEmojis } from 'bot-config';
import getYoutubePlaylistUrls from 'bot-functions/modules/getPlaylistUrls';
import getYoutubePlaylistId from 'bot-functions/modules/getYouTubePlaylistId';
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
		const handler = await new Command(this.commandInteraction).init();

		try {
			handler.voiceChannel;

			const audioInterface = YouTubeInterface.getInterfaceForGuild(handler.guild);
			const playlistUrl = handler.commandInteraction.options.getString('url', true);
			const playlistId = getYoutubePlaylistId(playlistUrl);

			if (!playlistId) {
				await handler.editWithEmoji('URL provided is not valid, try again?', ResponseEmojis.Danger);
				return;
			}

			await handler.editWithEmoji('Searching for videos in the playlist. Please wait...', ResponseEmojis.Loading);
			const videoUrlsFromPlaylist = await getYoutubePlaylistUrls(playlistId);
			const awaitingAppendedUrls = videoUrlsFromPlaylist.map(videoUrl => audioInterface.queue.queueAppend(videoUrl));
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
