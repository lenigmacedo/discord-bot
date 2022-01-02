import { SlashCommandBuilder } from '@discordjs/builders';
import { UserInteraction, YouTubeInterface, YouTubeVideo } from 'bot-classes';
import { ResponseEmojis } from 'bot-config';
import { CommandInteraction } from 'discord.js';
import { BaseCommand } from '../BaseCommand';

export default class Remove implements BaseCommand {
	constructor(public commandInteraction: CommandInteraction) {}

	register() {
		return new SlashCommandBuilder()
			.setName('remove')
			.setDescription('Remove an item from the queue with its queue number.')
			.addIntegerOption(option =>
				option.setName('item-number').setDescription('The item number. You can use /queue to identify this.').setRequired(true)
			);
	}

	async runner() {
		const handler = await new UserInteraction(this.commandInteraction).init(false);

		try {
			handler.voiceChannel;

			const youtubeInterface = YouTubeInterface.fromGuild(handler.guild);
			const itemToDeleteIndex = handler.commandInteraction.options.getInteger('item-number', true);
			const removedVideoId = await youtubeInterface.getItemId(itemToDeleteIndex - 1);
			const removedTitle = await YouTubeVideo.fromId(removedVideoId).info<string>('.videoDetails.title');

			if (!removedTitle) {
				handler.editWithEmoji('Unable to identify the queue item. Did you specify the right number?', ResponseEmojis.Danger);
				return;
			}

			const removed = await youtubeInterface.queue.delete(itemToDeleteIndex - 1);

			if (removed) {
				await handler.editWithEmoji(`Removed \`${removedTitle}\`.`, ResponseEmojis.Success);
			} else {
				await handler.editWithEmoji('🚨 There was a problem removing the item.', ResponseEmojis.Danger);
			}
		} catch (error: any) {
			await handler.oops(error);
		}
	}
}
