import { SlashCommandBuilder } from '@discordjs/builders';
import { UserInteraction, YouTubeInterface } from 'bot-classes';
import { ResponseEmojis } from 'bot-config';
import { CommandInteraction } from 'discord.js';
import { BaseCommand } from '../BaseCommand';

export default class Skip implements BaseCommand {
	constructor(public commandInteraction: CommandInteraction) {}

	register() {
		return new SlashCommandBuilder().setName('skip').setDescription('Skip the current audio.');
	}

	async runner() {
		const handler = await new UserInteraction(this.commandInteraction).init(false);

		try {
			handler.voiceChannel;

			const audioInterface = YouTubeInterface.getInterfaceForGuild(handler.guild);
			const skipped = audioInterface.emitAudioFinish();

			if (skipped) {
				await handler.editWithEmoji('The audio has been skipped.', ResponseEmojis.ArrowRight);
			} else {
				await handler.editWithEmoji('I cannot skip as I am not playing anything!', ResponseEmojis.Danger);
			}
		} catch (error: any) {
			handler.editWithEmoji(error.message, ResponseEmojis.Danger);
			console.error(error);
		}
	}
}
