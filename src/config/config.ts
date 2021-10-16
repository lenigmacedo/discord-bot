import { Intents } from 'discord.js';
import { config as env } from 'dotenv';

env();

const config = {
	discordToken: process.env.DISCORD_TOKEN,
	devClientId: process.env.CLIENT_ID,
	devGuildId: process.env.DEV_GUILD_ID,
	environment: process.env.NODE_ENV, // development or production
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES],
	redisNamespace: 'discord-youtube-bot',
	redisHost: (() => {
		switch (process.env.NODE_ENV) {
			case 'production':
				return 'redis';
			case 'development':
				return 'localhost';
			default:
				return 'localhost';
		}
	})(),
	redisPort: 6379
};

export default config;
export { default as commands } from './modules/commands';
export { default as globals } from './modules/globals';
