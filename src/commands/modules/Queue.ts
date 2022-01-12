import { SlashCommandBuilder } from '@discordjs/builders';
import { CmdRequirementError, CommandInteractionHelper, QueueReader, YouTubeInterface, YouTubeVideo } from 'bot-classes';
import { YtdlVideoInfoResolved } from 'bot-classes/modules/YouTubeVideo';
import { config, ResponseEmojis } from 'bot-config';
import { BaseCommand } from '../BaseCommand';
import { command } from '../decorators/command';

export default class Queue implements BaseCommand {
	register() {
		return new SlashCommandBuilder()
			.setName('queue')
			.setDescription('Get a list of all the items in the queue.')
			.addIntegerOption(option => option.setName('page').setDescription('Page number for if your queue is really long!'));
	}

	@command()
	async runner(handler: CommandInteractionHelper) {
		const youtubeInterface = YouTubeInterface.fromGuild(handler.guild);
		const queueLength = await youtubeInterface.queue.length();

		if (!queueLength) throw new CmdRequirementError('The queue is currently empty.');

		const page = handler.commandInteraction.options.getInteger('page') || 1;

		const queueReader = new QueueReader({
			title: () => `${ResponseEmojis.Scroll} ${handler.guild.name}'s queue`,
			caption: (page, pageCount, itemCount) => `Items: ${itemCount}\nPage: ${page}/${pageCount}`,
			page: page,
			handler: handler,
			getQueueLength: () => youtubeInterface.queue.length(),
			pageBuilder: page => this.pageBuilder(youtubeInterface, page)
		});

		await queueReader.run();
	}

	/**
	 * This method will run whenever someone interacts with the queue. It builds the new page.
	 */
	private async pageBuilder(youtubeInterface: YouTubeInterface, page: number) {
		const queue = await youtubeInterface.queue.getSome(page);

		const videoDetailPromiseArray = queue.map(youtubeVideo =>
			YouTubeVideo.fromId(youtubeVideo).info<YtdlVideoInfoResolved['videoDetails']>('.videoDetails')
		);

		const videoDetails = await Promise.all(videoDetailPromiseArray);

		const videoDetailsList = videoDetails.map((videoDetails, index) => {
			const itemNumberOffset = (page - 1) * config.paginateMaxLength;
			const itemNumber = index + 1 + itemNumberOffset;

			return {
				name: videoDetails?.title ? `${itemNumber}) ${videoDetails.title.substring(0, 100)}` : `${itemNumber}) ${ResponseEmojis.Danger} FAILED`,
				value: videoDetails?.description ? `By \`${videoDetails.author.name}\`.\n>> ${videoDetails.video_url}` : 'Video not available.'
			};
		});

		if (!videoDetailsList) throw new CmdRequirementError('Unable to retrieve video details!');

		return videoDetailsList;
	}
}
