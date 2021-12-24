import { CommandInteraction } from 'discord.js';

export abstract class BaseCommand {
	/**
	 * The main property that BaseCommand runs its methods against.
	 */
	abstract commandInteraction: CommandInteraction;

	constructor(commandInteraction: CommandInteraction) {}

	/**
	 * The method that will be automatically run when the command is invoked.
	 */
	abstract runner(): void;
}
