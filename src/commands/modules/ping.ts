import { CommandHandler } from '../CommandHandler.types';

const ping: CommandHandler = event => {
	event.reply('Pong!');
};

export default ping;
