import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteractionHelper, YouTubeInterface } from 'bot-classes';
import { ResponseEmojis } from 'bot-config';
import { BaseCommand } from '../BaseCommand';
import { command } from '../decorators/command';

export default class Resume implements BaseCommand {
	register() {
		return new SlashCommandBuilder().setName('resume').setDescription('Resume the bot if it is paused.');
	}

	@command({
		ephemeral: false,
		enforceVoiceConnection: true
	})
	async runner(handler: CommandInteractionHelper) {
		const youtubeInterface = YouTubeInterface.fromGuild(handler.guild);
		const unpaused = youtubeInterface.resume();

		if (unpaused) await handler.respondWithEmoji('The audio has been resumed.', ResponseEmojis.Success);
		else await handler.respondWithEmoji('Nothing to resume.', ResponseEmojis.Danger);
	}
}
