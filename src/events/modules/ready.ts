import { registerCommands } from 'bot-functions';
import { Client } from 'discord.js';

const ready = async (client: Client) => {
	console.log(`Bot logged in as ${client.user?.username}!`);

	client.user?.setActivity({
		name: 'music | type "/"!',
		type: 'PLAYING'
	});

	registerCommands();
};

export default ready;
