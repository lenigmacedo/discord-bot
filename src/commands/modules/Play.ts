import { SlashCommandBuilder } from '@discordjs/builders';
import { UserInteraction, YouTubeInterface, YouTubeVideo } from 'bot-classes';
import { ResponseEmojis } from 'bot-config';
import { CommandInteraction } from 'discord.js';
import { BaseCommand } from '../BaseCommand';
import { command } from '../decorators/command';

export default class Play implements BaseCommand {
	register() {
		return new SlashCommandBuilder()
			.setName('play')
			.setDescription('If the bot is not busy, you can play something. Then it will continue the queue.')
			.addStringOption(option =>
				option.setName('query').setDescription('A search query. First result from the search query will be used.').setRequired(true)
			);
	}

	@command()
	async runner(commandInteraction: CommandInteraction) {
		const handler = await new UserInteraction(commandInteraction).init(false);

		handler.voiceChannel;

		const query = handler.commandInteraction.options.getString('query', true);
		const youtubeInterface = YouTubeInterface.fromGuild(handler.guild);

		if (youtubeInterface.busy) {
			await handler.editWithEmoji('I am busy!', ResponseEmojis.Danger);
			return;
		}

		const [video] = await YouTubeVideo.search(query, 1);

		if (!video?.id?.videoId) {
			await handler.editWithEmoji('I could not find a video. Try something less specific?', ResponseEmojis.Danger);
			return;
		}

		const youtubeVideo = YouTubeVideo.fromId(video.id.videoId);
		await youtubeInterface.queue.prepend(youtubeVideo.id);
		await handler.editWithEmoji('Preparing to play...', ResponseEmojis.Loading);
		youtubeInterface.setConnection(handler.joinVoiceChannel());
		const title = await youtubeVideo.info<string>('.videoDetails.title');

		if (title) {
			await handler.commandInteraction.editReply(`🔊 Playing \`${title}\`.`);
		} else {
			await handler.editWithEmoji(
				'Unable to play the video. It might be private, age restricted or something else. It will be skipped.',
				ResponseEmojis.Danger
			);
		}

		while (await youtubeInterface.runner());
		youtubeInterface.deleteConnection();
	}
}
