import { SlashCommandBuilder } from '@discordjs/builders';
import { UserInteraction, YouTubeInterface } from 'bot-classes';
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
		const handler = await new UserInteraction(this.commandInteraction).init();

		try {
			handler.voiceChannel;

			const youtubeInterface = YouTubeInterface.getInterfaceForGuild(handler.guild);
			const itemToDeleteIndex = handler.commandInteraction.options.getInteger('item-number', true);
			const removedDetails = await youtubeInterface.getItemInfo(itemToDeleteIndex - 1);

			if (!removedDetails) {
				handler.editWithEmoji('Unable to identify the queue item. Did you specify the right number?', ResponseEmojis.Danger);
				return;
			}

			const removed = await youtubeInterface.queue.queueDelete(itemToDeleteIndex - 1);

			if (removed) {
				await handler.editWithEmoji(`Removed \`${removedDetails.videoDetails.title}\`.`, ResponseEmojis.Success);
			} else {
				await handler.editWithEmoji('🚨 There was a problem removing the item.', ResponseEmojis.Danger);
			}
		} catch (error: any) {
			handler.editWithEmoji(error.message, ResponseEmojis.Danger);
			console.error(error);
		}
	}
}
