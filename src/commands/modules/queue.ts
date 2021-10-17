import { AudioInterface } from 'bot-classes';
import { getVideoDetails, YtdlVideoInfoResolved } from 'bot-functions';
import { CommandHandler } from '../CommandHandler.types';

const queue: CommandHandler = async interaction => {
	if (!interaction.guild) return;

	const audioInterface = AudioInterface.getInterfaceForGuild(interaction.guild);

	const queue = await audioInterface.queueGetMultiple();

	if (!queue.length) {
		await interaction.reply('The queue is empty.');
		return;
	}

	const videoDetails = (await Promise.all(queue.map(url => getVideoDetails(url)))).filter(Boolean) as YtdlVideoInfoResolved[];

	const reply = `**Displaying the first ${queue.length} items in the queue:**\n${videoDetails
		.map(({ videoDetails }, index) => {
			const { title = 'Problem getting video details', viewCount } = videoDetails;

			if (!title || !parseInt(viewCount)) return 'Error getting video.';

			return `${index + 1}) \`${title}\`, \`${parseInt(viewCount).toLocaleString()}\` views`;
		})
		.join('\n')}`;

	interaction.reply(reply);
};

export default queue;
