import { AudioInterface } from 'bot-classes';
import { CommandHandler } from '../CommandHandler.types';

const enqueue: CommandHandler = async interaction => {
	if (!interaction.guild) return;

	const audioInterface = AudioInterface.getInterfaceForGuild(interaction.guild);

	const youtubeUrl = interaction.options.get('youtube-url', true).value;

	if (typeof youtubeUrl !== 'string') {
		interaction.reply('Invalid argument provided. This issue must be reported to the bot developer, as it is a configuration issue on our end.');
		return;
	}

	audioInterface.queueAppend(youtubeUrl);

	interaction.reply('Item appended to the queue!');
};

export default enqueue;
