import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteractionHelper, QueueManager } from 'bot-classes';
import { ResponseEmojis } from 'bot-config';
import { shuffleArr } from 'bot-functions';
import { BaseCommand } from '../BaseCommand';
import { command } from '../decorators/command';

export default class Shuffle implements BaseCommand {
	register() {
		return new SlashCommandBuilder().setName('shuffle').setDescription('Shuffle the queue! This operation cannot be undone.');
	}

	@command({
		ephemeral: false,
		enforceVoiceConnection: true
	})
	async runner(handler: CommandInteractionHelper) {
		const queue = QueueManager.fromGuild(handler.guild, ['youtube', 'global']);
		const currentItems = await queue.getAll();
		const shuffledItems = shuffleArr(currentItems);

		await queue.purge(); // Delete the queue, Redis does not have functionality to shuffle. We'll let JS do that.

		const awaitingReAdded = shuffledItems.map(item => queue.add(item));

		await Promise.all(awaitingReAdded);

		handler.respondWithEmoji('The queue has been shuffled!', ResponseEmojis.Success);
	}
}
