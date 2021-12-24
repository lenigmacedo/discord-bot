import { Interaction } from 'discord.js';

const interactionCreate = async (interaction: Interaction) => {
	try {
		if (interaction.isCommand()) {
			const capitalisedCommandName = interaction.commandName.charAt(0).toUpperCase() + interaction.commandName.slice(1);
			const commandModule = await import(`bot-commands/modules/${capitalisedCommandName}`);
			new commandModule[capitalisedCommandName](interaction).runner();
		}
	} catch (error) {
		console.error(error);
	}
};

export default interactionCreate;
