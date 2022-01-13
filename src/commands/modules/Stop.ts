import { SlashCommandBuilder } from '@discordjs/builders';
import { CmdRequirementError, CommandInteractionHelper, YouTubeInterface } from 'bot-classes';
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

		if (!audioInterface.busy) throw new CmdRequirementError('Nothing to stop.');

		audioInterface.deleteConnection();

		await handler.commandInteraction.deleteReply();
	}
}
