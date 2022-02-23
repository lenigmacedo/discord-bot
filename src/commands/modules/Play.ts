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
			.addStringOption(option => option.setName('query').setDescription('A search query. First result from the search query will be used.'));
	}

	@command({
		ephemeral: false,
		enforceVoiceConnection: true,
		msgOnExpire: 'Controls has expired. Please use `/controls` to get get it back for another 15 minutes.'
	})
	async runner(handler: CommandInteractionHelper) {
		const query = handler.commandInteraction.options.getString('query');
		const youtubeInterface = YouTubeInterface.fromGuild(handler.guild);

		if (query) {
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

				handler.status = 'SUCCESS';

				await youtubeInterface.runner(handler);
			}
		} else if (!youtubeInterface.busy) {
			youtubeInterface.setPointer(1);
			await Controls.generateControls(handler, youtubeInterface);

			handler.status = 'SUCCESS';

			await youtubeInterface.runner(handler);
		} else {
			throw new CmdRequirementError('I am busy!');
		}
	}
}
