import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteractionHelper, YouTubeInterface } from '../../classes';
import { ResponseEmojis } from '../../config';
import { BaseCommand } from '../BaseCommand';
import { command } from '../decorators/command';

export default class Loop implements BaseCommand {
	register() {
		return new SlashCommandBuilder()
			.setName('loop')
			.setDescription('Loop the queue.')
			.addBooleanOption(option => option.setName('enabled').setDescription('Turn this feature on or off.').setRequired(true));
	}

	@command({
		enforceVoiceConnection: true
	})
	async runner(handler: CommandInteractionHelper) {
		const youtubeInterface = YouTubeInterface.fromGuild(handler.guild);
		const looped = handler.commandInteraction.options.getBoolean('enabled', true);

		youtubeInterface.loop = looped;
		handler.respondWithEmoji(`Playlist loop set to ${looped}.`, ResponseEmojis.Success);
	}
}
