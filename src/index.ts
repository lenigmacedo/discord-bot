import { REST } from '@discordjs/rest';
import config, { commands } from 'bot-config';
import { interactionCreate, ready } from 'bot-events';
import { Routes } from 'discord-api-types/v9';
import { Client } from 'discord.js';

const client = new Client({ intents: config.intents });
const { discordToken, devClientId, devGuildId } = config;
const rest = new REST({ version: '9' }).setToken(discordToken as string);

const registerCommands = () => {
	console.log('Started refreshing application (/) commands.');

	let route = null;

	switch (config.environment) {
		case 'production':
			route = Routes.applicationGuildCommands(devClientId as string, devGuildId as string);
			break;
		case 'development':
			route = Routes.applicationCommands(devClientId as string);
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
