import { globals } from '../../config';
import { Interaction } from 'discord.js';

/**
 * This function is the initialiser for when a user invokes a command.
 * It will find the command class, and run the runner method. However, it should be noted that commands
 * will use the @command decorator, which means that the call to the runner method will be intercepted.
 * This means that when you create a new command instance, the parameter that is passed in to runner() is no longer a
 * CommandInteraction instance, rather, a custom CommandInteractionHelper instance.
 *
 * @param interaction the interaction instance from when the user run the slash command
 */
const interactionCreate = async (interaction: Interaction) => {
	if (!interaction.isCommand()) return;

	const commandName = interaction.commandName;

	if (globals.commandModules.has(commandName)) {
		const commandClass = globals.commandModules.get(commandName); // Any is unavoidable here... as far as I am aware.
		new commandClass().runner(interaction);
	}
};

export { interactionCreate };
