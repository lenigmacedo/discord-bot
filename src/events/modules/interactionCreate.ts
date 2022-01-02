import { globals } from 'bot-config';
import { Interaction } from 'discord.js';

const interactionCreate = async (interaction: Interaction) => {
	try {
		if (interaction.isCommand()) {
			const commandName = interaction.commandName;

			if (globals.commandModules.has(commandName)) {
				const commandClass = globals.commandModules.get(commandName); // Any is unavoidable here... as far as I am aware.
				new commandClass().runner(interaction);
			}
		}
	} catch (error) {
		console.error(error);
	}
};

export default interactionCreate;
