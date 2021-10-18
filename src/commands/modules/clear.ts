import { AudioInterface } from 'bot-classes';
import config from 'bot-config';
import { GuildMember, Message, MessageReaction, PartialMessageReaction } from 'discord.js';
import { CommandHandler } from '../CommandHandler.types';

const clear: CommandHandler = async interaction => {
	const guildMember = interaction.member;

	if (!interaction?.guild?.id || !(guildMember instanceof GuildMember)) {
		return;
	}

	const voiceChannel = guildMember.voice.channel;

	if (!voiceChannel) {
		await interaction.reply('You must be connected to a voice channel for me to clear the queue!');
		return;
	}

	const audioInterface = AudioInterface.getInterfaceForGuild(interaction.guild);
	await interaction.reply('Preparing...');
	const botReply = await interaction.editReply('Are you sure you want to delete the ENTIRE queue?');
	if (!(botReply instanceof Message)) return;

	config.confirmOptions.forEach(react => {
		botReply.react(react);
	});

	const botClient = botReply.author.client;

	const listener = (reaction: MessageReaction | PartialMessageReaction) => {
		if (!(guildMember instanceof GuildMember)) return;
		// Check that the user that actually asked the question to the bot is the one reacting
		if (!reaction.users.cache.has(guildMember.user.id)) return;
		// Now check that the reaction is in relation to the question asked
		if (reaction.message.id !== botReply.id) return;
		const userReaction = reaction.emoji.toString();

		config.confirmOptions.forEach(async (configReaction, index) => {
			// Check the reaction is eligible for the question response
			if (userReaction !== configReaction) return;
			if (index === 0) {
				const deleted = await audioInterface.queueDelete();
				if (deleted) await interaction.editReply(`${userReaction} Queue has been purged.`);
				else await interaction.editReply('I could not delete the queue!');
			} else if (index === 1) {
				await interaction.editReply(`${userReaction} Queue deletion aborted.`);
			}

			botClient.removeListener('messageReactionAdd', listener);
		});
	};

	botClient.on('messageReactionAdd', listener);

	setTimeout(() => {
		botClient.removeListener('messageReactionAdd', listener), config.searchExpiryMilliseconds;
	}, config.searchExpiryMilliseconds);
};

export default clear;
