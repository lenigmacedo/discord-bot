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
		const queueLength = await audioInterface.queueGetLength();

		if (!queueLength) {
			await interaction.editReply('ℹ️ Queue is empty.');
			return;
		}

		let page = interaction.options.getNumber('page') || 1;
		const pageCount = Math.ceil(queueLength / config.paginateMaxLength);

		if (page > pageCount) page = pageCount;
		else if (page < 1) page = 1;

		const queue = await audioInterface.queueGetMultiple(page);
		const videoDetailPromiseArray = queue.map(url => getVideoDetails(url));
		const videoDetails = (await Promise.all(videoDetailPromiseArray)) as YtdlVideoInfoResolved[];

		const fields: EmbedFieldData[] = videoDetails.map((videoDetails, index) => {
			const itemNumberOffset = (page - 1) * config.paginateMaxLength;
			const itemNumber = index + 1 + itemNumberOffset;
			const videoDetailsObj = videoDetails?.videoDetails;

			if (!videoDetailsObj?.title || !videoDetailsObj?.description) {
				return {
					name: `${itemNumber}) 🚨 FAILED`,
					value: `Video private or age restricted or something else.`
				};
			}

			return {
				name: `${itemNumber}) ${videoDetailsObj.title.substring(0, 100)}`,
				value: videoDetailsObj.description.substring(0, 200) + '...'
			};
		});

		const embed = new MessageEmbed()
			.setColor(config.embedSuccess as ColorResolvable)
			.setTitle(`📃 Current Queue`)
			.setDescription(
				`There ${queueLength === 1 ? 'is' : 'are'} ${queueLength} item${queueLength === 1 ? '' : 's'} in the queue.\nPage ${page}/${pageCount}`
			)
			.setFields(...fields);

		await interaction.editReply({ embeds: [embed] });
	} catch (error) {
		console.error(error);
	}
};

export default queue;
