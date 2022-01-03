import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

export interface BaseCommand {
	/**
	 * The JavaScript object representing a new command.
	 * This method should return an instance of SlashCommandBuilder, which will be turned into JSON when the bot runs and sent to the Discord API for this command.
	 *
	 * Conventions:
	 * - You MUST make sure that the name of the slash command and the filename are the same!
	 * - The first letter of the filename and classname of the command MUST be uppercase as per convention, but the slash command registration can stay lowercase.
	 *
	 * Remarks:
	 * - Please see https://discordjs.guide/interactions/registering-slash-commands.html#guild-commands for more info about slash commands.
	 */
	register(): SlashCommandBuilder | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;

	/**
	 * This method holds the logic of the slash command and runs when someone invokes the command.
	 *
	 * TIPS:
	 * - There are various classes you can import from 'bot-classes' that can help you compose the logic.
	 * - One example is UserInteraction, which will help you interact with the author of the command.
	 * - Catch all errors with the @command() decorator! This will automatically wrap the runner method in a try and catch block and handle the error gracefully.
	 */
	runner(commandInteraction: CommandInteraction): void;
}
