import { SlashCommandBuilder } from '@discordjs/builders';
import { UserInteraction, YouTubeVideo } from 'bot-classes';
import { YtdlVideoInfoResolved } from 'bot-classes/modules/YouTubeVideo';
import { globals, ResponseEmojis } from 'bot-config';
import { initComponentInteractionHandler } from 'bot-functions';
import { CommandInteraction, Message, MessageActionRow, MessageSelectMenu, MessageSelectOptionData } from 'discord.js';
import { BaseCommand } from '../BaseCommand';

export default class Search implements BaseCommand {
	constructor(public commandInteraction: CommandInteraction) {}

	register() {
		return new SlashCommandBuilder()
			.setName('search')
			.setDescription('Search YouTube for videos and use an interactive dropdown to select a result.')
			.addStringOption(option => option.setName('search-query').setDescription('The video you would like to search for.').setRequired(true));
	}

	async runner() {
		const handler = await new UserInteraction(this.commandInteraction).init();

		try {
			handler.voiceChannel;

			await handler.editWithEmoji('Searching YouTube. Please wait...', ResponseEmojis.Loading);
			const searchQuery = handler.commandInteraction.options.getString('search-query', true);
			const searchResult = await YouTubeVideo.searchForUrls(searchQuery);

			if (!searchResult.length) {
				await handler.editWithEmoji(
					'I could not find any results for that search query. Try searching for something less specific?',
					ResponseEmojis.Info
				);
				return;
			}

			const unresolvedVideoDetails = searchResult.map(url => YouTubeVideo.fromUrl(url).info());
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

			const botMessage = await handler.editWithEmoji({ content: 'I found some results!', components: [actionRow] }, ResponseEmojis.Success);

			if (!(botMessage instanceof Message)) return;

			initComponentInteractionHandler(botMessage, handler.commandInteraction);
		} catch (error: any) {
			await handler.oops(error);
		}
	}
}
