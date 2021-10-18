import { AudioInterface } from 'bot-classes';
import { CommandHandler } from '../CommandHandler.types';

const enqueue: CommandHandler = async interaction => {
	if (!interaction.guild) return;
	await interaction.reply('Enqueuing item...');
	const audioInterface = AudioInterface.getInterfaceForGuild(interaction.guild);
	const youtubeUrl = interaction.options.getString('youtube-url', true);
	const appended = await audioInterface.queueAppend(youtubeUrl);
	if (appended) await interaction.editReply('Item appended to the queue!');
	else await interaction.editReply('I could not add that item to the queue. Is it a valid URL?');
};

export default enqueue;
