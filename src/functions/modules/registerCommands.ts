import { REST } from '@discordjs/rest';
import { config, globals } from 'bot-config';
import { Routes } from 'discord-api-types/v9';
import fs from 'fs';
import path from 'path';

/**
 * This function registers all slash commands to the Discord API.
 * It also stores all command classes in the globals object to be used later.
 */
export async function registerCommands() {
	const { discordToken, clientId, devGuildId } = config;
	const rest = new REST({ version: '9' }).setToken(discordToken as string);

	console.log('Started refreshing application slash commands.');

	// Create an endpoint to the Discord API that has the relevant Bot ID.
	// If not in production, the development Guild ID is added to speed up the command registration process.
	const route =
		config.environment === 'production'
			? Routes.applicationCommands(clientId as string)
			: Routes.applicationGuildCommands(clientId as string, devGuildId as string);

	// This section simply finds all command classes.
	const commandModulePath = path.resolve('src', 'commands', 'modules');
	const commandModuleResolvingEntries = fs.readdirSync(commandModulePath).map(async moduleName => {
		const module = await import(`${commandModulePath}/${moduleName}`);
		return [moduleName, module];
	});

	const commandModules = await Promise.all(commandModuleResolvingEntries);

	// Register all commands to the Discord API and add the commands to the globals commandModules Map() instance.
	const slashCommandRegistrations = commandModules.map(module => {
		const commandName = module[0].split('.')[0].toLowerCase(); // Remove the '.ts' at the end and force lowercase.
		const commandClass = module[1].default;
		globals.commandModules.set(commandName, commandClass);
		return new commandClass().register().toJSON();
	});

	console.log(`${globals.commandModules.size} unique commands have been found on the file system.`);

	// Send a HTTP PUT request to the Discord API to register all slash commands.
	await rest.put(route, { body: slashCommandRegistrations });

	console.log('Successfully reloaded application slash commands.');
}
