import { Intents } from 'discord.js';
import { config as env } from 'dotenv';

env();

/**
 * CONFIG
 * Set values that are meant to be user-changeable here!
 */
const config = {
	discordToken: process.env.DISCORD_TOKEN,
	googleApiToken: process.env.GOOGLE_API_TOKEN,
	clientId: process.env.CLIENT_ID,
	devGuildId: process.env.DEV_GUILD_ID,
	environment: process.env.NODE_ENV, // development or production
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MESSAGE_TYPING],
	redisNamespace: 'discord-youtube-bot',
	paginateMaxLength: 5,
	searchExpiryMilliseconds: 60 * 1000,
	cacheExpiryHours: 24,
	redisHost: process.env.NODE_ENV === 'production' ? 'redis' : 'localhost',
	redisPort: 6379,
	embedSuccess: '#00ff00',
	embedDanger: '#ff0000',
	embedWarning: '#ffff00'
};

export default config;
export { default as commands } from './modules/commands';
export { default as globals } from './modules/globals';
