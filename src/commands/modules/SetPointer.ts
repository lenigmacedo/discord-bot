import { SlashCommandBuilder } from '@discordjs/builders';
import { CmdRequirementError, CommandInteractionHelper, YouTubeInterface } from '../../classes';
import { ResponseEmojis } from '../../config';
import { BaseCommand } from '../BaseCommand';
import { command } from '../decorators/command';

export default class SetPointer implements BaseCommand {
	register() {
		return new SlashCommandBuilder()
			.setName('setpointer')
			.setDescription('Set the pointer for the pointer-based queue system.')
			.addIntegerOption(option => option.setName('value').setDescription('What is the queue item index you want this bot to start playing at?'));
	}

	@command({
		enforceVoiceConnection: true,
		ephemeral: false
	})
	async runner(handler: CommandInteractionHelper) {
		const youtubeInterface = YouTubeInterface.fromGuild(handler.guild);

		if (youtubeInterface.busy) throw new CmdRequirementError('I am busy! Use `/stop` first.');

		const wantedPointer = handler.commandInteraction.options.getInteger('value') || 1;
		const newPointer = await youtubeInterface.setPointer(wantedPointer);

		handler.respondWithEmoji(`Pointer set to \`${newPointer}\``, ResponseEmojis.Success);
	}
}
