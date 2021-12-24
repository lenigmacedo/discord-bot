import { Command, YouTubeInterface, YtdlVideoInfoResolved } from 'bot-classes';
import { globals, ResponseEmojis } from 'bot-config';
import { getYouTubeUrls, initComponentInteractionHandler } from 'bot-functions';
import { CommandInteraction, Message, MessageActionRow, MessageSelectMenu, MessageSelectOptionData } from 'discord.js';
import { BaseCommand } from '../BaseCommand';

export class Search implements BaseCommand {
	constructor(public commandInteraction: CommandInteraction) {}

	async runner() {
		const handler = await new Command(this.commandInteraction).init();

		try {
			handler.voiceChannel;

			await handler.editWithEmoji('Searching YouTube. Please wait...', ResponseEmojis.Loading);
			const searchQuery = handler.commandInteraction.options.getString('search-query', true);
			const searchResult = await getYouTubeUrls(searchQuery);

			if (!searchResult.length) {
				await handler.editWithEmoji(
					'I could not find any results for that search query. Try searching for something less specific?',
					ResponseEmojis.Info
				);
				return;
			}

			const audioInterface = YouTubeInterface.getInterfaceForGuild(handler.guild);
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

			const botMessage = await handler.editWithEmoji({ content: 'I found some results!', components: [actionRow] }, ResponseEmojis.Success);

			if (!(botMessage instanceof Message)) return;

			initComponentInteractionHandler(botMessage, handler.commandInteraction);
		} catch (error: any) {
			handler.editWithEmoji(error.message, ResponseEmojis.Danger);
			console.error(error);
		}
	}
}
