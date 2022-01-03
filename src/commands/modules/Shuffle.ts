import { SlashCommandBuilder } from '@discordjs/builders';
import { QueueManager, UserInteraction } from 'bot-classes';
import { ResponseEmojis } from 'bot-config';
import { shuffleArr } from 'bot-functions';
import { CommandInteraction } from 'discord.js';
import { BaseCommand } from '../BaseCommand';
import { catchable } from '../decorators/catchable';

export default class Shuffle implements BaseCommand {
	register() {
		return new SlashCommandBuilder().setName('shuffle').setDescription('Shuffle the queue! This operation cannot be undone.');
	}

	@catchable
	async runner(commandInteraction: CommandInteraction) {
		const handler = await new UserInteraction(commandInteraction).init(false);
		const queue = new QueueManager(handler.guild.id, 'youtube');

		handler.voiceChannel;

		const currentItems = await queue.getAll();
		const shuffledItems = shuffleArr(currentItems);
		const queuePurged = await queue.purge(); // Delete the queue, Redis does not have functionality to shuffle. We'll let JS do that.

		if (queuePurged) {
			const awaitingReAdded = shuffledItems.map(item => queue.add(item));
			await Promise.all(awaitingReAdded);
			handler.editWithEmoji('The queue has been shuffled!', ResponseEmojis.Success);
		}
	}
}
