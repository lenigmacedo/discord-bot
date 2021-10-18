import { AudioInterface } from 'bot-classes';
import config from 'bot-config';
import { findYouTubeUrls, getVideoDetails, YtdlVideoInfoResolved } from 'bot-functions';
import { GuildMember, Message, MessageReaction, PartialMessageReaction, PartialUser, User } from 'discord.js';
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

		const audioInterface = AudioInterface.getInterfaceForGuild(interaction.guild);
		await interaction.reply('Searching YouTube...');
		const searchQuery = interaction.options.getString('search-query', true);
		const searchResult = await findYouTubeUrls(searchQuery);

		if (!searchResult.length) {
			await interaction.editReply('I could not find any results for that search query. Try searching for something less specific?');
			return;
		}

		const videoDetails = (await Promise.all(searchResult.map(url => getVideoDetails(url)))).filter(Boolean) as YtdlVideoInfoResolved[];

		const reply = `**Found ${searchResult.length} result(s):**\n${videoDetails
			.map(({ videoDetails }, index) => {
				const { title = 'Problem getting video details', viewCount } = videoDetails;
				if (!title || !parseInt(viewCount)) return 'Error getting video.';
				return `${index + 1}) \`${title}\`, \`${parseInt(viewCount).toLocaleString()}\` views`;
			})
			.join('\n')}\n*You have ${config.searchExpiryMilliseconds / 1000} seconds to make your pick!*`;

		const botReply = await interaction.editReply(reply);
		if (!(botReply instanceof Message)) return;

		await Promise.all(
			config.searchReactionOptions.map((react, index) => {
				// If only 1 result was found, why give the user the option to select the second option when it does not exist?
				if (index < searchResult.length) botReply.react(react);
			})
		);

		const botClient = botReply.author.client;

		const listener = (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => {
			if (!(guildMember instanceof GuildMember)) return;
			// Check that the user that actually asked the question to the bot is the one reacting
			if (!reaction.users.cache.has(guildMember.user.id)) return;
			// Now check that the reaction is in relation to the question asked
			if (reaction.message.id !== botReply.id) return;
			const userReaction = reaction.emoji.toString();

			config.searchReactionOptions.forEach(async (configReaction, index) => {
				// Check the reaction is eligible for the question response
				if (userReaction !== configReaction) return;
				const chosenVideoUrl = searchResult[index];
				const appended = await audioInterface.queueAppend(chosenVideoUrl);
				if (appended) await interaction.editReply('Thanks for choosing! It has been added to the queue.');
				else await interaction.editReply('I could not add the video to the queue! Try again?');
				botClient.removeListener('messageReactionAdd', listener);
			});
		};

		botClient.on('messageReactionAdd', listener);
		// This will clean up any timeouts that never cleared
		// This may be because the user never reacted or there was a problem
		setTimeout(() => {
			botClient.removeListener('messageReactionAdd', listener), config.searchExpiryMilliseconds;
		}, config.searchExpiryMilliseconds);
	} catch (error) {
		console.error(error);
	}
};

export default search;
