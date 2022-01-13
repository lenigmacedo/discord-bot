import { SlashCommandBuilder } from '@discordjs/builders';
import { CmdRequirementError, CommandInteractionHelper, YouTubeInterface, YouTubeVideo } from 'bot-classes';
import { ResponseEmojis } from 'bot-config';
import { BaseCommand } from '../BaseCommand';
import { command } from '../decorators/command';

export default class Remove implements BaseCommand {
	register() {
		return new SlashCommandBuilder()
			.setName('remove')
			.setDescription('Remove an item from the queue with its queue number.')
			.addIntegerOption(option =>
				option.setName('item-number').setDescription('The item number. You can use /queue to identify this.').setRequired(true)
			);
	}

	@command({
		ephemeral: false,
		enforceVoiceConnection: true
	})
	async runner(handler: CommandInteractionHelper) {
		const youtubeInterface = YouTubeInterface.fromGuild(handler.guild);
		const itemToDeleteIndex = handler.commandInteraction.options.getInteger('item-number', true);
		const removedVideoId = await youtubeInterface.getItemId(itemToDeleteIndex - 1);
		const removedTitle = await YouTubeVideo.fromId(removedVideoId).info<string>('.videoDetails.title');

		if (!removedTitle) throw new CmdRequirementError('Unable to identify the queue item. Did you specify the right number?');

		const removed = await youtubeInterface.queue.delete(itemToDeleteIndex - 1);

		if (removed) await handler.respondWithEmoji(`Removed \`${removedTitle}\`.`, ResponseEmojis.Success);
		else throw new CmdRequirementError('🚨 There was a problem removing the item.');
	}
}
