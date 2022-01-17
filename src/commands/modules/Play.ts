import { SlashCommandBuilder } from '@discordjs/builders';
import { CmdRequirementError, CommandInteractionHelper, YouTubeInterface, YouTubeVideo } from 'bot-classes';
import { ResponseEmojis } from 'bot-config';
import { BaseCommand } from '../BaseCommand';
import { command } from '../decorators/command';
import Controls from './Controls';

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
		const [video] = await YouTubeVideo.search(query, 1);

		if (!video?.id?.videoId) throw new CmdRequirementError('I could not find a video. Try something less specific?');

		const youtubeVideo = YouTubeVideo.fromId(video.id.videoId);

		if (youtubeInterface.busy) {
			await handler.respondWithEmoji('As I am currently busy, I will add the video to the end of the queue.', ResponseEmojis.Info);
			await youtubeInterface.queue.add(youtubeVideo.id);
		} else {
			await youtubeInterface.queue.prepend(youtubeVideo.id);
			youtubeInterface.setPointer(1);
			await Controls.generateControls(handler, youtubeInterface);
			await youtubeInterface.runner(handler);
		}
	}
}
