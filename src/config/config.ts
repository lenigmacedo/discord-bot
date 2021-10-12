import { config as env } from 'dotenv';

env();

const config = {
	discordToken: process.env.DISCORD_TOKEN,
	devClientId: process.env.DEV_CLIENT_ID,
	devGuildId: process.env.DEV_GUILD_ID
};

export default config;
export { default as commands } from './modules/commands';
