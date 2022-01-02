import { SlashCommandBuilder } from '@discordjs/builders';
import { UserInteraction, YouTubeInterface, YouTubeVideo } from 'bot-classes';
import { ResponseEmojis } from 'bot-config';
import { CommandInteraction } from 'discord.js';
import { BaseCommand } from '../BaseCommand';
import { catchable } from '../decorators/catchable';

export default class Enqueue implements BaseCommand {
	register() {
		return new SlashCommandBuilder()
			.setName('enqueue')
			.setDescription('Add a YouTube video to the end of the queue.')
			.addStringOption(option => option.setName('url').setDescription('The YouTube video URL.').setRequired(true));
	}

	@catchable
	async runner(commandInteraction: CommandInteraction) {
		const handler = await new UserInteraction(commandInteraction).init(false);

		handler.voiceChannel;

		const youtubeInterface = YouTubeInterface.fromGuild(handler.guild);
		const youtubeUrl = handler.commandInteraction.options.getString('url', true);
		const youtubeVideo = YouTubeVideo.fromUrl(youtubeUrl);
		const title = await youtubeVideo.info<string>('.videoDetails.title');

		if (!title) {
			await handler.editWithEmoji(
				'I could not add that item to the queue. Is it a valid URL? Is it age restricted or private?',
				ResponseEmojis.Danger
			);
			return;
		}

		const appended = await youtubeInterface.queue.add(youtubeVideo.id);

		if (appended) await handler.editWithEmoji(`Enqueued \`${title}\`.`, ResponseEmojis.Success);
		else await handler.editWithEmoji('I could not add that item to the queue. Is it a valid URL?', ResponseEmojis.Danger);
	}
}
