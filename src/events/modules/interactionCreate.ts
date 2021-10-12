import { Interaction } from 'discord.js';

const interactionCreate = async (interaction: Interaction) => {
	try {
		if (interaction.isCommand()) {
			const commandModule = await import(`bot-commands/modules/${interaction.commandName}`);
			const handler = commandModule.default;

			handler(interaction);
		}
	} catch (error) {
		console.error(error);
	}
};

export default interactionCreate;
