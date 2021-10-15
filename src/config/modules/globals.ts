import { Guild } from 'discord.js';
import Queue from '../../classes/classes/Queue';

const globals = {
	players: new Map<Guild['id'], Queue>()
};

export default globals;
