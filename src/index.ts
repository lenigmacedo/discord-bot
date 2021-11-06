import { REST } from '@discordjs/rest';
import config, { commands } from 'bot-config';
import { interactionCreate, ready } from 'bot-events';
import { Routes } from 'discord-api-types/v9';
import { Client } from 'discord.js';

const client = new Client({ intents: config.intents });
const { discordToken, clientId, devGuildId } = config;
const rest = new REST({ version: '9' }).setToken(discordToken as string);

const registerCommands = async () => {
	console.log('Started refreshing application (/) commands.');

	const route =
		config.environment === 'production'
			? Routes.applicationCommands(clientId as string)
			: Routes.applicationGuildCommands(clientId as string, devGuildId as string);

	await rest.put(route, { body: commands });

	console.log('Successfully reloaded application (/) commands.');
};

registerCommands();

client.on('ready', () => ready(client));
client.on('interactionCreate', interactionCreate);
client.login(discordToken);
