import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteractionHelper, YouTubeInterface } from 'bot-classes';
import { ResponseEmojis } from 'bot-config';
import { BaseCommand } from '../BaseCommand';
import { command } from '../decorators/command';

export default class Stop implements BaseCommand {
	register() {
		return new SlashCommandBuilder().setName('stop').setDescription('Stop the bot from playing.');
	}

	@command({
		ephemeral: false,
		enforceVoiceConnection: true
	})
	async runner(handler: CommandInteractionHelper) {
		const audioInterface = YouTubeInterface.fromGuild(handler.guild);

		if (!audioInterface.busy) {
			await handler.editWithEmoji('Nothing to stop.', ResponseEmojis.Danger);
			return;
		}

		audioInterface.deleteConnection();
		await handler.editWithEmoji('I have been stopped.', ResponseEmojis.Success);
	}
}
