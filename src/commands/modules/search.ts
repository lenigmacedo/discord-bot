import { findYouTubeUrls, getVideoDetails, YtdlVideoInfoResolved } from 'bot-functions';
import handleMessageComponentEvent from 'bot-functions/modules/handleMessageComponentEvent';
import {
	CollectorFilter,
	GuildMember,
	Message,
	MessageActionRow,
	MessageComponentInteraction,
	MessageSelectMenu,
	MessageSelectOptionData
} from 'discord.js';
import { CommandHandler } from '../CommandHandler.types';

const search: CommandHandler = async interaction => {
	try {
		const guildMember = interaction.member;

		if (!interaction?.guild?.id || !(guildMember instanceof GuildMember)) {
			return;
		}

		const voiceChannel = guildMember.voice.channel;

		if (!voiceChannel) {
			await interaction.reply('You must be connected to a voice channel for me to search!');
			return;
		}

		await interaction.reply({ content: 'Searching YouTube...', ephemeral: true });
		const searchQuery = interaction.options.getString('search-query', true);
		const searchResult = await findYouTubeUrls(searchQuery);

		if (!searchResult.length) {
			await interaction.editReply('I could not find any results for that search query. Try searching for something less specific?');
			return;
		}

		const videoDetails = (await Promise.all(searchResult.map(url => getVideoDetails(url)))).filter(Boolean) as YtdlVideoInfoResolved[];

		const selectOptions = videoDetails.map((details, index) => {
			const option: MessageSelectOptionData = {
				label: `${index + 1}) ${details.videoDetails.title}`.substring(0, 100),
				description: details.videoDetails.description?.substring(0, 100) || '',
				value: details.videoDetails.video_url
			};
			return option;
		});

		const actionRow = new MessageActionRow().addComponents(
			new MessageSelectMenu().setCustomId('search-video-selection').setPlaceholder('Select a video').addOptions(selectOptions)
		);

		const botMessage = await interaction.editReply({ content: 'I found something!', components: [actionRow] });

		if (!(botMessage instanceof Message)) return;

		const filter: CollectorFilter<[MessageComponentInteraction]> = messageComponentInteraction => {
			if (messageComponentInteraction.user.id === interaction.member?.user.id) return true;
			return false;
		};

		const collector = botMessage.createMessageComponentCollector({
			max: 1,
			filter
		});

		collector.on('end', handleMessageComponentEvent);
	} catch (error) {
		console.error(error);
	}
};

export default search;
