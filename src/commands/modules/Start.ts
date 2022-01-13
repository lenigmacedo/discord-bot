import { SlashCommandBuilder } from '@discordjs/builders';
import { CmdRequirementError, CommandInteractionHelper, YouTubeInterface } from 'bot-classes';
import { BaseCommand } from '../BaseCommand';
import { command } from '../decorators/command';
import Controls from './Controls';

export default class Start implements BaseCommand {
	register() {
		return new SlashCommandBuilder().setName('start').setDescription('Start the queue if the bot is not already playing.');
	}

	@command({
		ephemeral: false,
		enforceVoiceConnection: true
	})
	async runner(handler: CommandInteractionHelper) {
		const youtubeInterface = YouTubeInterface.fromGuild(handler.guild);
		const queue = await youtubeInterface.queue.getSome();

		if (!queue.length) throw new CmdRequirementError('The queue is empty.');
		if (youtubeInterface.busy) throw new CmdRequirementError('I am busy!');

		await Controls.generateControls(handler, youtubeInterface);
		await youtubeInterface.runner(handler);
	}
}
