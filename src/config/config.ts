import { Intents } from 'discord.js';
import { config as env } from 'dotenv';

env();

console.log(process.env.NODE_ENV);

/**
 * CONFIG
 * Set values that are meant to be user-changeable here!
 */
const config = {
	// TOKENS
	discordToken: process.env.DISCORD_TOKEN,
	googleApiToken: process.env.GOOGLE_API_TOKEN,
	clientId: process.env.CLIENT_ID,
	devGuildId: process.env.DEV_GUILD_ID,

	// ENVIRONMENT
	environment: process.env.NODE_ENV, // development or production

	// REDIS
	redisPort: 6379,
	redisHost: process.env.REDIS_HOST,

	// INIT
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MESSAGE_TYPING],

	// CONFIG
	redisNamespace: 'discord-youtube-bot',
	paginateMaxLength: 5,
	playlistImportMaxSize: 50, // YouTube API limit is 50
	searchExpiryMilliseconds: 60 * 1000,
	queueButtonExpiryMilliseconds: 600 * 1000,
	cacheExpiryHours: 24,
	cacheMaxSize: 2,
	audioVolume: 0.8,

	// THEME AND STYLE
	embedSuccess: '#00ff00',
	embedDanger: '#ff0000',
	embedWarning: '#ffff00',
	numberFormat: 'en-GB'
};

export default config;
export { default as commands } from './modules/commands';
export { default as globals } from './modules/globals';
