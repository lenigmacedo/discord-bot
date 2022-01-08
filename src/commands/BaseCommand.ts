import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from '@discordjs/builders';
import { CommandInteractionHelper } from 'bot-classes';

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
	register(): SlashCommandBuilder | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'> | SlashCommandSubcommandsOnlyBuilder;

	/**
	 * This method holds the logic of the slash command and runs when someone invokes the command.
	 *
	 * TIP:
	 * Add the @command() decorator to your runner method. This will handle some things behind the scenes for you, like permissions, error handling and more.
	 */
	runner(handler: CommandInteractionHelper): void;
}
