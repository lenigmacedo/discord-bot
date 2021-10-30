import { getVideoDetails, getYouTubeUrls, initOneTimeUseComponentInteraction, YtdlVideoInfoResolved } from 'bot-functions';
import { GuildMember, Message, MessageActionRow, MessageSelectMenu, MessageSelectOptionData } from 'discord.js';
import { CommandHandler } from '../CommandHandler.types';

const search: CommandHandler = async interaction => {
	try {
		const guildMember = interaction.member;

		if (!interaction?.guild?.id || !(guildMember instanceof GuildMember)) {
			return;
		}

		const voiceChannel = guildMember.voice.channel;

		if (!voiceChannel) {
			await interaction.reply('🚨 You must be connected to a voice channel for me to search!');
			return;
		}

		await interaction.reply({ content: '🔃 Searching YouTube please wait...', ephemeral: true });
		const searchQuery = interaction.options.getString('search-query', true);
		const searchResult = await getYouTubeUrls(searchQuery);

		if (!searchResult.length) {
			await interaction.editReply('ℹ️ I could not find any results for that search query. Try searching for something less specific?');
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

		const botMessage = await interaction.editReply({ content: '✅ I found some results!', components: [actionRow] });

		if (!(botMessage instanceof Message)) return;

		initOneTimeUseComponentInteraction(botMessage, interaction);
	} catch (error) {
		console.error(error);
	}
};

export default search;
