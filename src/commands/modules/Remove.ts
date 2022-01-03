import { SlashCommandBuilder } from '@discordjs/builders';
import { UserInteraction, YouTubeInterface, YouTubeVideo } from 'bot-classes';
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
	async runner(handler: UserInteraction) {
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
	}
}
