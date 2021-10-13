import { REST } from '@discordjs/rest';
import config, { commands } from 'bot-config';
import { interactionCreate, ready } from 'bot-events';
import { Routes } from 'discord-api-types/v9';
import { Client, Intents } from 'discord.js';

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES] });
const { discordToken, devClientId, devGuildId } = config;
const rest = new REST({ version: '9' }).setToken(discordToken as string);

const registerCommands = () => {
	console.log('Started refreshing application (/) commands.');
	const guildCommandsRoute = Routes.applicationGuildCommands(devClientId as string, devGuildId as string);
	rest
		.put(guildCommandsRoute, { body: commands })
		.then(() => console.log('Successfully reloaded application (/) commands.'))
		.catch(console.error);
};

registerCommands();

client.on('ready', ready);
client.on('interactionCreate', interactionCreate);
client.login(discordToken);

export default registerCommands;
