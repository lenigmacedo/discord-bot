import { Intents } from 'discord.js';
import { config as env } from 'dotenv';

env();

const config = {
	discordToken: process.env.DISCORD_TOKEN,
	devClientId: process.env.DEV_CLIENT_ID,
	devGuildId: process.env.DEV_GUILD_ID,
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES]
};

export default config;
export { default as commands } from './modules/commands';
export { default as globals } from './modules/globals';
