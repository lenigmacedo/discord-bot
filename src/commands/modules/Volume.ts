import { SlashCommandBuilder } from '@discordjs/builders';
import { UserInteraction, YouTubeInterface } from 'bot-classes';
import { ResponseEmojis } from 'bot-config';
import { BaseCommand } from '../BaseCommand';
import { command } from '../decorators/command';

export default class Volume implements BaseCommand {
	register() {
		return new SlashCommandBuilder()
			.setName('volume')
			.setDescription('Set the volume of the bot. Affects all listeners.')
			.addIntegerOption(option => option.setName('level').setRequired(true).setDescription('Value between 0 and 100.'));
	}

	@command({
		ephemeral: false,
		enforceVoiceConnection: true
	})
	async runner(handler: UserInteraction) {
		const audioInterface = YouTubeInterface.fromGuild(handler.guild);
		const volumeLevel = handler.commandInteraction.options.getInteger('level', true);
		const isSet = audioInterface.setVolume(volumeLevel);

		if (isSet) handler.editWithEmoji(`Set volume to \`${volumeLevel}%\``, ResponseEmojis.Speaker);
		else handler.editWithEmoji('Could not set the volume! Make sure it is between 0 and 100.', ResponseEmojis.Danger);
	}
}
