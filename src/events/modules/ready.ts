import config, { globals } from 'bot-config';
import { Client } from 'discord.js';

const ready = (client: Client) => {
	console.log(`Bot logged in as ${client.user?.username}!`);
	console.log(`Environment: ${config.environment}`);

	globals.redisClient.on('connect', () => {
		console.log(`Redis connected on port ${config.redisPort} with hostname "${config.redisHost}".`);
	});

	globals.redisClient.on('error', error => {
		console.error(error);
		throw Error('Error communicating with Redis database.');
	});

	globals.redisClient.connect();

	client.user?.setActivity({
		name: 'music | type "/"!',
		type: 'PLAYING'
	});
};

export default ready;
