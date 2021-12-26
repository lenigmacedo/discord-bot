import config from 'bot-config';
import { interactionCreate, ready } from 'bot-events';
import { registerCommands } from 'bot-functions';
import { Client } from 'discord.js';

const client = new Client({ intents: config.intents });

registerCommands();

client.on('ready', () => ready(client));
client.on('interactionCreate', interactionCreate);
client.login(config.discordToken);
