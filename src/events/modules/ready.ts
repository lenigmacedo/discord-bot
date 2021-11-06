import config from 'bot-config';
import { Client } from 'discord.js';

const ready = (client: Client) => {
	console.log(`Bot logged in as ${client.user?.username}!`);
	console.log(`Environment: ${config.environment}`);
	console.log(`Redis connected on port ${config.redisPort} with hostname "${config.redisHost}".`);

	client.user?.setActivity({
		name: 'music | Type "/"!',
		type: 'PLAYING'
	});
};

export default ready;
