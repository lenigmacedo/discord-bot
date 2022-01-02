import { SlashCommandBuilder } from '@discordjs/builders';
import { QueueManager, UserInteraction } from 'bot-classes';
import { ResponseEmojis } from 'bot-config';
import { CommandInteraction } from 'discord.js';
import { BaseCommand } from '../BaseCommand';

export default class Clean implements BaseCommand {
	register() {
		return new SlashCommandBuilder().setName('clean').setDescription('Remove all duplicates from the queue.');
	}

	async runner(commandInteraction: CommandInteraction) {
		const handler = await new UserInteraction(commandInteraction).init(false);
		const queue = new QueueManager(handler.guild.id, 'youtube');

		handler.voiceChannel;

		const currentItems = await queue.getAll();
		const oldLen = currentItems.length;
		const dedupedItems = Array.from(new Set(currentItems));
		const newLen = dedupedItems.length;
		const queuePurged = await queue.purge(); // Delete the queue, Redis does not have functionality to dedupe. We'll let JS do that.

		if (queuePurged) {
			const awaitingReAdded = dedupedItems.map(item => queue.add(item));
			await Promise.all(awaitingReAdded);
			handler.editWithEmoji(`The queue has been cleaned!\nRemoved: \`${oldLen - newLen}\`.`, ResponseEmojis.Info);
		}
	}
}
