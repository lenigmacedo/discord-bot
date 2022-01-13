import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteractionHelper, YouTubeInterface } from 'bot-classes';
import { ResponseEmojis } from 'bot-config';
import { BaseCommand } from '../BaseCommand';
import { command } from '../decorators/command';

export default class Skip implements BaseCommand {
	register() {
		return new SlashCommandBuilder().setName('skip').setDescription('Skip the current audio.');
	}

	@command({
		ephemeral: false,
		enforceVoiceConnection: true
	})
	async runner(handler: CommandInteractionHelper) {
		const audioInterface = YouTubeInterface.fromGuild(handler.guild);
		const skipped = audioInterface.emitAudioFinish();

		if (skipped) await handler.commandInteraction.deleteReply();
		else await handler.respondWithEmoji('I cannot skip as I am not playing anything!', ResponseEmojis.Danger);
	}
}
