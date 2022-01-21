import { Intents } from 'discord.js';
import { config as env } from 'dotenv';

env();

/**
 * CONFIG
 *
 * This bot has a lot of options for defaults. Feel free to change them (if you know what you are doing!)
 */
export const config = {
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
	forgetItemsOnFinish: true, // Remove items from the queue when they have finished playing
	paginateMaxLength: 5,
	playlistImportMaxSize: 50, // For every 50 items, 1 unit of your YouTube API quota will be consumed. Increase this with caution!
	searchExpiryMilliseconds: 60 * 1000,
	queueButtonExpiryMilliseconds: 600 * 1000,
	cacheExpiryHours: 24,
	audioVolume: 0.8,
	minimumDefaultPermissions: ['SPEAK'], // By default, the user should have these privileges unless the command has been overridden.

	numberFormat: 'en-GB'
};
