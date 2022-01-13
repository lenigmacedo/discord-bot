import { SlashCommandBuilder } from '@discordjs/builders';
import { CmdRequirementError, CommandInteractionHelper, MediaControls, YouTubeInterface } from 'bot-classes';
import { YouTubeVideo, YtdlVideoInfoResolved } from 'bot-classes/modules/YouTubeVideo';
import { ResponseEmojis } from 'bot-config';
import { BaseCommand } from '../BaseCommand';
import { command } from '../decorators/command';

export default class Controls implements BaseCommand {
	register() {
		return new SlashCommandBuilder().setName('controls').setDescription('View an interactive command centre to control the bot.');
	}

	@command({
		enforceGuild: true,
		enforceVoiceConnection: true,
		ephemeral: false
	})
	async runner(handler: CommandInteractionHelper) {
		const youtubeInterface = YouTubeInterface.fromGuild(handler.guild);
		const queueLength = await youtubeInterface.queue.length();

		if (!queueLength) throw new CmdRequirementError('There is nothing in the queue.');
		if (!youtubeInterface.busy) throw new CmdRequirementError('Please start the bot with `/start` or `/play` to make use of this command.');

		await Controls.generateControls(handler, youtubeInterface);
	}

	/**
	 * Generate interactive controls for the user.
	 *
	 * @param handler The handler to set the controls to.
	 * @param youtubeInterface The YouTubeInterface instance to read from.
	 */
	static async generateControls(handler: CommandInteractionHelper, youtubeInterface: YouTubeInterface) {
		const mediaControls = MediaControls.fromGuild(handler.guild, handler, getCurrentHandler => {
			youtubeInterface.events
				.on('next', async () => await mediaControls.refreshContent())
				.on('stop', async () => {
					const latestHandler = getCurrentHandler();
					await latestHandler.respondWithEmoji({ content: 'The audio has been stopped.', embeds: [], components: [] }, ResponseEmojis.Info);
				});
		});

		mediaControls.clearEvents();

		mediaControls.events
			.on('resume', () => youtubeInterface.resume())
			.on('pause', () => youtubeInterface.pause())
			.on('next', () => youtubeInterface.emitAudioFinish())
			.on('stop', () => youtubeInterface.deleteConnection());

		mediaControls.addContentFunction(async () => {
			const nextVideo = await youtubeInterface.getItemId();

			if (!nextVideo) return null;

			const queueLength = await youtubeInterface.queue.length();
			const pointer = youtubeInterface.currentPointer;
			const videoInfo = await YouTubeVideo.fromId(nextVideo).info<YtdlVideoInfoResolved['videoDetails']>('.videoDetails').catch(console.error);
			const { title, video_url, likes, author, thumbnails, viewCount } = videoInfo || {};

			const content = {
				title: title || 'No URL',
				description: `Playing: \`${pointer}\`/\`${queueLength}\` | ${video_url || 'Video URL not found.'}`,
				likes: `${likes}` || '?',
				views: `${viewCount}` || '?',
				author: author?.name || '?',
				thumbnailUrl: thumbnails?.[3]?.url || 'No URL'
			};

			return content;
		});

		await mediaControls.start();
	}
}
