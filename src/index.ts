import { REST } from '@discordjs/rest';
import config, { commands } from 'bot-config';
import { interactionCreate, ready } from 'bot-events';
import { Routes } from 'discord-api-types/v9';
import { Client } from 'discord.js';

const client = new Client({ intents: config.intents });
const { discordToken, clientId, devGuildId } = config;
const rest = new REST({ version: '9' }).setToken(discordToken as string);

const registerCommands = () => {
	console.log('Started refreshing application (/) commands.');
	if (!clientId) throw TypeError('No client ID defined in .env. This is required.');
	let route = null;

	switch (config.environment) {
		case 'production':
			route = Routes.applicationCommands(clientId as string);
			break;
		case 'development':
			route = Routes.applicationGuildCommands(clientId as string, devGuildId as string);
			break;
		default:
			throw TypeError('Environment not defined! Make sure NODE_ENV environment variable is set to "production" or "development".');
	}

	rest
		.put(route, { body: commands })
		.then(() => console.log('Successfully reloaded application (/) commands.'))
		.catch(console.error);
};

registerCommands();

client.on('ready', ready);
client.on('interactionCreate', interactionCreate);
client.login(discordToken);
