import { Queue } from 'bot-classes';
import { Guild } from 'discord.js';

const globals = {
	players: new Map<Guild['id'], Queue>()
};

export default globals;
