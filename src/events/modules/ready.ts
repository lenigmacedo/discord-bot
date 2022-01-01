import { config } from 'bot-config';
import { Client } from 'discord.js';

const ready = async (client: Client) => {
	console.log(`Bot logged in as ${client.user?.username}!`);
	console.log(`Environment: ${config.environment}`);

	client.user?.setActivity({
		name: 'music | type "/"!',
		type: 'PLAYING'
	});
};

export default ready;
