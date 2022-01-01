import { SlashCommandBuilder } from '@discordjs/builders';
import { UserInteraction, YouTubeInterface, YouTubeVideo } from 'bot-classes';
import { ResponseEmojis } from 'bot-config';
import { CommandInteraction } from 'discord.js';
import { BaseCommand } from '../BaseCommand';

export default class Enqueue implements BaseCommand {
	constructor(public commandInteraction: CommandInteraction) {}

	register() {
		return new SlashCommandBuilder()
			.setName('enqueue')
			.setDescription('Add a YouTube video to the end of the queue.')
			.addStringOption(option => option.setName('url').setDescription('The YouTube video URL.').setRequired(true));
	}

	async runner() {
		const handler = await new UserInteraction(this.commandInteraction).init(false);

		try {
			handler.voiceChannel;

			const youtubeInterface = YouTubeInterface.fromGuild(handler.guild);
			const youtubeUrl = handler.commandInteraction.options.getString('url', true);
			const youtubeVideo = YouTubeVideo.fromUrl(youtubeUrl);
			const videoDetails = await youtubeVideo.info();

			if (!videoDetails) {
				await handler.editWithEmoji(
					'I could not add that item to the queue. Is it a valid URL? Is it age restricted or private?',
					ResponseEmojis.Danger
				);
				return;
			}

			const appended = await youtubeInterface.queue.add(youtubeVideo.id);

			if (appended) await handler.editWithEmoji(`Enqueued \`${videoDetails.videoDetails.title}\`.`, ResponseEmojis.Success);
			else await handler.editWithEmoji('I could not add that item to the queue. Is it a valid URL?', ResponseEmojis.Danger);
		} catch (error: any) {
			await handler.oops(error);
		}
	}
}
