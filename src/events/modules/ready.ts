import { registerCommands } from '../../functions';
import { Client } from 'discord.js';

const ready = (client: Client) => {
	console.log(`Bot logged in as ${client.user?.username}!`);

	client.user?.setActivity({
		name: 'Lenigs bot',
		type: 'PLAYING'
	});

	registerCommands();
};

export { ready };
