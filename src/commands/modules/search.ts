import { YouTubeInterface, YtdlVideoInfoResolved } from 'bot-classes';
import { globals } from 'bot-config';
import { getCommandIntraction, getYouTubeUrls, initOneTimeUseComponentInteraction } from 'bot-functions';
import { Message, MessageActionRow, MessageSelectMenu, MessageSelectOptionData } from 'discord.js';
import { CommandHandler } from '../CommandHandler.types';

const search: CommandHandler = async initialInteraction => {
	try {
		const commandInteraction = getCommandIntraction(initialInteraction);

		if (!commandInteraction) {
			return;
		}

		const { interaction, guild, guildMember } = commandInteraction;
		await interaction.deferReply();

		if (!guildMember.voice.channel) {
			await interaction.reply('🚨 You must be connected to a voice channel for me to search!');
			return;
		}

		await interaction.reply({ content: '🔃 Searching YouTube. Please wait...', ephemeral: true });
		const searchQuery = interaction.options.getString('search-query', true);
		const searchResult = await getYouTubeUrls(searchQuery);

		if (!searchResult.length) {
			await interaction.editReply('ℹ️ I could not find any results for that search query. Try searching for something less specific?');
			return;
		}

		const audioInterface = YouTubeInterface.getInterfaceForGuild(guild);
		const unresolvedVideoDetails = searchResult.map(url => audioInterface.getDetails(url));
		const resolvedVideoDetails = await Promise.all(unresolvedVideoDetails);
		const filteredVideoDetails = resolvedVideoDetails.filter(Boolean) as YtdlVideoInfoResolved[];

		const selectOptions = filteredVideoDetails.map((details, index) => {
			const option: MessageSelectOptionData = {
				label: (() => {
					const position = index + 1;
					const { title } = details.videoDetails;
					const reply = `${position}) ${title}`;
					return reply.substring(0, 100);
				})(),
				description: (() => {
					const { author, viewCount } = details.videoDetails;
					const reply = `By ${author.name} | ${globals.numberToLocale.format(+viewCount)} views.`;
					return reply.substring(0, 100);
				})(),
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
