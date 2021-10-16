import { AudioInterface } from 'bot-classes';
import config from 'bot-config';
import { Guild } from 'discord.js';
import redis from 'redis';

const globals = {
	players: new Map<Guild['id'], AudioInterface>(),
	redisClient: redis.createClient({
		host: config.redisHost,
		port: config.redisPort
	})
};

export default globals;
