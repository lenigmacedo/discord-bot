import { SlashCommandBuilder } from '@discordjs/builders';
import { CmdRequirementError, CommandInteractionHelper, YouTubeVideo } from 'bot-classes';
import { YtdlVideoInfoResolved } from 'bot-classes/modules/YouTubeVideo';
import { globals, ResponseEmojis } from 'bot-config';
import { MessageActionRow, MessageSelectMenu, MessageSelectOptionData } from 'discord.js';
import { BaseCommand } from '../BaseCommand';
import { command } from '../decorators/command';

export default class Search implements BaseCommand {
	register() {
		return new SlashCommandBuilder()
			.setName('search')
			.setDescription('Search YouTube for videos and use an interactive dropdown to select a result.')
			.addStringOption(option => option.setName('search-query').setDescription('The video you would like to search for.').setRequired(true));
	}

	@command({
		enforceVoiceConnection: true
	})
	async runner(handler: CommandInteractionHelper) {
		await handler.respondWithEmoji('Searching YouTube. Please wait...', ResponseEmojis.Loading);

		const searchQuery = handler.commandInteraction.options.getString('search-query', true);
		const searchResult = await YouTubeVideo.searchForUrls(searchQuery);

		if (!searchResult.length) throw new CmdRequirementError('I could not find any results for that search query.');

		const unresolvedVideoDetails = searchResult.map(url => YouTubeVideo.fromUrl(url).info());
		const resolvedVideoDetails = await Promise.all(unresolvedVideoDetails);
		const filteredVideoDetails = resolvedVideoDetails.filter(Boolean) as YtdlVideoInfoResolved[];

		const selectOptions = filteredVideoDetails.map((details, index) => {
			const label = () => {
				const position = index + 1;
				const { title } = details.videoDetails;
				const reply = `${position}) ${title}`;
				return reply.substring(0, 100);
			};

			const description = () => {
				const { author, viewCount } = details.videoDetails;
				const reply = `By ${author.name} | ${globals.numberToLocale.format(+viewCount)} views.`;
				return reply.substring(0, 100);
			};

			const option: MessageSelectOptionData = {
				label: label(),
				description: description(),
				value: details.videoDetails.video_url
			};
			return option;
		});

		const actionRow = new MessageActionRow().addComponents(
			new MessageSelectMenu().setCustomId('search-video-selection').setPlaceholder('Select a video').addOptions(selectOptions)
		);

		const botMessage = await handler.respondWithEmoji({ content: 'I found some results!', components: [actionRow] }, ResponseEmojis.Success);

		handler.componentInteractionHandler(botMessage);
	}
}
