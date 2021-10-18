import { AudioInterface } from 'bot-classes';
import { CommandHandler } from '../CommandHandler.types';

const enqueue: CommandHandler = async interaction => {
	if (!interaction.guild) return;
	const audioInterface = AudioInterface.getInterfaceForGuild(interaction.guild);
	const youtubeUrl = interaction.options.getString('youtube-url', true);
	const appended = await audioInterface.queueAppend(youtubeUrl);
	if (appended) interaction.reply('Item appended to the queue!');
	else interaction.reply('I could not add that item to the queue. Is it a valid URL?');
};

export default enqueue;
