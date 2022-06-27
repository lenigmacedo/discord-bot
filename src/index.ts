import { config } from  './config';
import { interactionCreate, ready } from './events';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import { Client } from 'discord.js';

const client = new Client({ intents: config.intents });

console.log(`Environment: ${config.environment}`);
console.log(`Redis host: ${config.redisHost}`);

client.on('ready', () => ready(client));
client.on('error', console.error);
client.on('interactionCreate', interactionCreate);

client.login(config.discordToken);
