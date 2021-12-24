import { Command, YouTubeInterface } from 'bot-classes';
import { ResponseEmojis } from 'bot-config';
import { CommandInteraction } from 'discord.js';
import { BaseCommand } from '../BaseCommand';

export class Volume implements BaseCommand {
	constructor(public commandInteraction: CommandInteraction) {}

	async runner() {
		const handler = await new Command(this.commandInteraction).init();

		try {
			handler.voiceChannel;

			const audioInterface = YouTubeInterface.getInterfaceForGuild(handler.guild);
			const volumeLevel = handler.commandInteraction.options.getInteger('level', true);
			const isSet = audioInterface.setVolume(volumeLevel);

			if (isSet) {
				handler.editWithEmoji(`Set volume to \`${volumeLevel}%\``, ResponseEmojis.Speaker);
			} else {
				handler.editWithEmoji('Could not set the volume! Make sure it is between 0 and 100.', ResponseEmojis.Danger);
			}
		} catch (error: any) {
			handler.editWithEmoji(error.message, ResponseEmojis.Danger);
			console.error(error);
		}
	}
}
