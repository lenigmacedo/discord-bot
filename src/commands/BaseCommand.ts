import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

export interface BaseCommand {
	/**
	 * The main property that BaseCommand runs its methods against.
	 */
	commandInteraction: CommandInteraction;

	/**
	 * The JavaScript object representing a new command.
	 * This command will be sent to the Discord API as a slash command.
	 * You MUST make sure that the name of the slash command and the filename are the same!
	 * The filename and classname of the command MUST be uppercase as per convention, but the slash command registration can stay lowercase.
	 * Please see https://discordjs.guide/interactions/registering-slash-commands.html#guild-commands
	 */
	register(): SlashCommandBuilder | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;

	/**
	 * The method that will be automatically run when the command is invoked by a user in a Discord server (guild).
	 */
	runner(): void;
}
