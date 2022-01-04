import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteractionHelper, YouTubeInterface, YouTubeVideo } from 'bot-classes';
import { ResponseEmojis } from 'bot-config';
import { BaseCommand } from '../BaseCommand';
import { command } from '../decorators/command';

export default class Start implements BaseCommand {
	register() {
		return new SlashCommandBuilder().setName('start').setDescription('Start the queue if the bot is not already playing.');
	}

	@command({
		ephemeral: false,
		enforceVoiceConnection: true
	})
	async runner(handler: CommandInteractionHelper) {
		const audioInterface = YouTubeInterface.fromGuild(handler.guild);
		const queue = await audioInterface.queue.getSome();

		if (!queue.length) {
			await handler.editWithEmoji('The queue is empty.', ResponseEmojis.Danger);
			return;
		}

		if (audioInterface.busy) {
			await handler.editWithEmoji('I am busy!', ResponseEmojis.Danger);
			return;
		}

		await handler.editWithEmoji('Preparing to play...', ResponseEmojis.Loading);
		audioInterface.setConnection(handler.joinVoiceChannel());
		const firstItemInQueue = await audioInterface.queue.first();

		if (!firstItemInQueue) {
			handler.editWithEmoji('Unable to play the track.', ResponseEmojis.Danger);
			return;
		}

		const nextVideo = await audioInterface.queue.first();

		if (nextVideo) {
			const title = await YouTubeVideo.fromId(nextVideo).info<string>('.videoDetails.title');

			if (title) {
				await handler.editWithEmoji(`I am now playing the queue. First up \`${title}\`!`, ResponseEmojis.Speaker);
			} else {
				await handler.editWithEmoji('I am now playing the queue.', ResponseEmojis.Speaker); // If the video is invalid, the queue should handle it and skip it.
			}
		}

		while (await audioInterface.runner());
		audioInterface.deleteConnection();
	}
}
