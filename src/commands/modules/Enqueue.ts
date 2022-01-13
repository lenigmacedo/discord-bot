import { SlashCommandBuilder } from '@discordjs/builders';
import { CmdRequirementError, CommandInteractionHelper, YouTubeInterface, YouTubeVideo } from 'bot-classes';
import { ResponseEmojis } from 'bot-config';
import { BaseCommand } from '../BaseCommand';
import { command } from '../decorators/command';

export default class Enqueue implements BaseCommand {
	register() {
		return new SlashCommandBuilder()
			.setName('enqueue')
			.setDescription('Add a YouTube video to the end of the queue.')
			.addStringOption(option => option.setName('url').setDescription('The YouTube video URL.').setRequired(true));
	}

	@command({
		ephemeral: false,
		enforceVoiceConnection: true
	})
	async runner(handler: CommandInteractionHelper) {
		const youtubeInterface = YouTubeInterface.fromGuild(handler.guild);
		const youtubeUrl = handler.commandInteraction.options.getString('url', true);
		const youtubeVideo = YouTubeVideo.fromUrl(youtubeUrl);
		const title = await youtubeVideo.info<string>('.videoDetails.title');

		if (!title) throw new CmdRequirementError('I could not add that item to the queue. Is it a valid URL? Is it age restricted or private?');

		const appended = await youtubeInterface.queue.add(youtubeVideo.id);

		if (appended) await handler.respondWithEmoji(`Enqueued \`${title}\`.`, ResponseEmojis.Success);
		else throw new CmdRequirementError('I could not add that item to the queue. Is it a valid URL?');
	}
}
