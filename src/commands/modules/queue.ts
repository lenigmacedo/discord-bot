import { AudioInterface } from 'bot-classes';
import config from 'bot-config';
import { getVideoDetails, YtdlVideoInfoResolved } from 'bot-functions';
import { ColorResolvable, EmbedFieldData, MessageEmbed } from 'discord.js';
import { CommandHandler } from '../CommandHandler.types';

const queue: CommandHandler = async interaction => {
	try {
		if (!interaction.guild) {
			return;
		}

		await interaction.deferReply();
		const audioInterface = AudioInterface.getInterfaceForGuild(interaction.guild);
		const queue = await audioInterface.queueGetMultiple();

		if (!queue.length) {
			await interaction.editReply('ℹ️ The queue is empty.');
			return;
		}

		const videoDetails = (await Promise.all(queue.map(url => getVideoDetails(url)))) as YtdlVideoInfoResolved[];

		if (videoDetails.length > config.paginateMaxLength) videoDetails.length = config.paginateMaxLength;

		const fields: EmbedFieldData[] = videoDetails.map((videoDetails, index) => {
			const number = index + 1;
			const videoDetailsObj = videoDetails?.videoDetails;

			if (!videoDetailsObj?.title || !videoDetailsObj?.description) {
				return {
					name: `${number}) 🚨 FAILED`,
					value: `Video private or age restricted or something else.`
				};
			}

			return {
				name: `${number}) ${videoDetailsObj.title.substring(0, 100)}`,
				value: videoDetailsObj.description.substring(0, 200) + '...'
			};
		});

		const embed = new MessageEmbed()
			.setColor(config.embedSuccess as ColorResolvable)
			.setTitle(`📃 Current Queue`)
			.setDescription(`There ${queue.length === 1 ? 'is' : 'are'} ${queue.length} item${queue.length === 1 ? '' : 's'} in the queue.`)
			.setFields(...fields);

		await interaction.editReply({ embeds: [embed] });
	} catch (error) {
		console.error(error);
	}
};

export default queue;
