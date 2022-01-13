import { SlashCommandBuilder } from '@discordjs/builders';
import { CmdRequirementError, CommandInteractionHelper, YouTubeInterface, YouTubeVideo } from 'bot-classes';
import { ResponseEmojis } from 'bot-config';
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

	@command({
		ephemeral: false,
		enforceVoiceConnection: true
	})
	async runner(handler: CommandInteractionHelper) {
		const query = handler.commandInteraction.options.getString('query', true);
		const youtubeInterface = YouTubeInterface.fromGuild(handler.guild);

		if (youtubeInterface.busy) throw new CmdRequirementError('I am busy!');

		const [video] = await YouTubeVideo.search(query, 1);

		if (!video?.id?.videoId) throw new CmdRequirementError('I could not find a video. Try something less specific?');

		const youtubeVideo = YouTubeVideo.fromId(video.id.videoId);

		await youtubeInterface.queue.prepend(youtubeVideo.id);
		await handler.respondWithEmoji('Preparing to play...', ResponseEmojis.Loading);

		const title = await youtubeVideo.info<string>('.videoDetails.title');

		if (title) await handler.commandInteraction.editReply(`🔊 Playing \`${title}\`.`);
		else throw new CmdRequirementError('Unable to play the video. It might be private, age restricted or something else. It will be skipped.');

		await youtubeInterface.runner(handler);
	}
}
