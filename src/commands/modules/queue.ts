import { AudioInterface } from 'bot-classes';
import { getVideoDetails, YtdlVideoInfoResolved } from 'bot-functions';
import { CommandHandler } from '../CommandHandler.types';

const queue: CommandHandler = async interaction => {
	if (!interaction.guild) return;
	await interaction.reply('Fetching queue...');
	const audioInterface = AudioInterface.getInterfaceForGuild(interaction.guild);
	const queue = await audioInterface.queueGetMultiple();

	if (!queue.length) {
		await interaction.editReply('The queue is empty.');
		return;
	}

	const videoDetails = (await Promise.all(queue.map(url => getVideoDetails(url)))) as YtdlVideoInfoResolved[];

	const reply = `**Displaying the first ${queue.length} items in the queue:**\n${videoDetails
		.map((videoDetails, index) => {
			const i = index ? index + 1 : 'CURRENT';

			if (!videoDetails) {
				return `${i}) *Could not fetch. This video may be age restricted, private, or something else.*`;
			}

			const { title, viewCount } = videoDetails.videoDetails;

			if (!title || !parseInt(viewCount)) {
				return 'Error getting video.';
			}

			return `${i}) \`${title}\`, \`${parseInt(viewCount).toLocaleString()}\` views`;
		})
		.join('\n')}`;

	await interaction.editReply(reply);
};

export default queue;
