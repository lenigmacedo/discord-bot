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

		const page = interaction.options.getNumber('page') || 1;
		const pageIndex = page - 1;
		const pageCount = Math.ceil(queueLength / config.paginateMaxLength);

		if (page > pageCount) {
			await interaction.editReply(`🚨 Page number specified is larger than the amount of actual pages. Did you intend for page ${pageCount}?`);
			return;
		} else if (page < 1) {
			await interaction.editReply(`🚨 Page number must not be lower than 1.`);
			return;
		}

		const queue = await audioInterface.queueGetMultiple(config.paginateMaxLength, config.paginateMaxLength * pageIndex);
		const videoDetails = (await Promise.all(queue.map(url => getVideoDetails(url)))) as YtdlVideoInfoResolved[];

		if (videoDetails.length > config.paginateMaxLength) {
			videoDetails.length = config.paginateMaxLength;
		}

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
