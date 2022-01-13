import { SlashCommandBuilder } from '@discordjs/builders';
import { CmdRequirementError, CommandInteractionHelper, YouTubeInterface } from 'bot-classes';
import { ResponseEmojis } from 'bot-config';
import { BaseCommand } from '../BaseCommand';
import { command } from '../decorators/command';

export default class Pause implements BaseCommand {
	register() {
		return new SlashCommandBuilder().setName('pause').setDescription('Pause the bot from playing audio.');
	}

	@command({
		ephemeral: false,
		enforceVoiceConnection: true
	})
	async runner(handler: CommandInteractionHelper) {
		const youtubeInterface = YouTubeInterface.fromGuild(handler.guild);
		const paused = youtubeInterface.pause();

		if (paused) await handler.respondWithEmoji('The audio has been paused.', ResponseEmojis.Success);
		else throw new CmdRequirementError('Nothing to pause.');
	}
}
