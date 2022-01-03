import { SlashCommandBuilder } from '@discordjs/builders';
import { QueueManager, UserInteraction } from 'bot-classes';
import { ResponseEmojis } from 'bot-config';
import { moveArrItem } from 'bot-functions';
import { CommandInteraction } from 'discord.js';
import { BaseCommand } from '../BaseCommand';
import { catchable } from '../decorators/catchable';

export default class Move implements BaseCommand {
	register() {
		return new SlashCommandBuilder()
			.setName('move')
			.setDescription('Move an item in the queue. If no "to" option is specified, it will be pushed to position 1.')
			.addIntegerOption(option => option.setName('item-number').setDescription("The item's current position."))
			.addIntegerOption(option => option.setName('to').setDescription("The item's new position.").setRequired(false));
	}

	@catchable
	async runner(commandInteraction: CommandInteraction) {
		const handler = await new UserInteraction(commandInteraction).init(false);
		const queue = new QueueManager(handler.guild.id, 'youtube');

		handler.voiceChannel;

		const queueLength = await queue.length();

		// It is assumed users will start from index 1, not 0 like us programmers!
		const fromPosition = handler.commandInteraction.options.getInteger('item-number', true);
		const toPosition = handler.commandInteraction.options.getInteger('to') || 1;

		if (fromPosition > queueLength || fromPosition < 1) {
			handler.editWithEmoji('From position is out of range!', ResponseEmojis.Danger);
			return;
		} else if (toPosition > queueLength || toPosition < 1) {
			handler.editWithEmoji('To position is out of range!', ResponseEmojis.Danger);
			return;
		}

		const currentItems = await queue.getAll();
		const alteredQueue = moveArrItem(currentItems, fromPosition - 1, toPosition - 1);
		const queuePurged = await queue.purge(); // Redis does not support moving items in a list. We'll let JS do it.

		if (queuePurged) {
			const awaitingReAdded = alteredQueue.map(item => queue.add(item));
			await Promise.all(awaitingReAdded);
			handler.editWithEmoji('Queue item moved!', ResponseEmojis.Info);
		}
	}
}
