import { Command, YouTubeInterface } from 'bot-classes';
import { ResponseEmojis } from 'bot-config';
import { safeJoinVoiceChannel } from 'bot-functions';
import { CommandInteraction } from 'discord.js';
import { BaseCommand } from '../BaseCommand';

export class Start implements BaseCommand {
	constructor(public commandInteraction: CommandInteraction) {}

	async runner() {
		const handler = await new Command(this.commandInteraction).init();

		try {
			handler.voiceChannel;

			const audioInterface = YouTubeInterface.getInterfaceForGuild(handler.guild);
			const queue = await audioInterface.queue.queueGetMultiple();

			if (!queue.length) {
				await handler.editWithEmoji('The queue is empty.', ResponseEmojis.Danger);
				return;
			}

			if (audioInterface.getBusyStatus()) {
				await handler.editWithEmoji('I am busy!', ResponseEmojis.Danger);
				return;
			}

			await handler.editWithEmoji('Preparing to play...', ResponseEmojis.Loading);
			audioInterface.setConnection(safeJoinVoiceChannel(handler.commandInteraction));
			const firstItemInQueue = await audioInterface.queue.queueGetOldest();

			if (!firstItemInQueue) {
				handler.editWithEmoji('Unable to play the track.', ResponseEmojis.Danger);
				return;
			}

			const videoDetails = await audioInterface.getDetails((await audioInterface.queue.queueGetOldest()) as string);

			if (videoDetails) {
				await handler.editWithEmoji(`I am now playing the queue. First up \`${videoDetails.videoDetails.title}\`!`, ResponseEmojis.Speaker);
			} else {
				await handler.editWithEmoji('I am now playing the queue.', ResponseEmojis.Speaker); // If the video is invalid, the queue should handle it and skip it.
			}

			while (await audioInterface.queueRunner());
			audioInterface.deleteConnection();
		} catch (error) {
			console.error(error);
		}
	}
}
