import { AudioInterface } from 'bot-classes';
import { safeJoinVoiceChannel } from 'bot-functions';
import { GuildMember } from 'discord.js';
import { CommandHandler } from '../CommandHandler.types';

const start: CommandHandler = async interaction => {
	const guildMember = interaction.member;

	if (!interaction?.guild?.id || !(guildMember instanceof GuildMember)) {
		return;
	}

	const voiceChannel = guildMember.voice.channel;

	if (!voiceChannel) {
		await interaction.reply('You must be connected to a voice channel for me to know where to join!');
		return;
	}

	const audioInterface = AudioInterface.getInterfaceForGuild(interaction.guild);

	const queue = await audioInterface.queueGetMultiple();

	if (!queue.length) {
		await interaction.reply('The queue is empty.');
		return;
	}

	if (audioInterface.isBusy()) {
		interaction.reply('I am busy!');
		return;
	}

	await interaction.reply('Preparing to play...');

	audioInterface.setConnection(safeJoinVoiceChannel(interaction));

	await interaction.editReply('I am now playing the queue.');

	while (await audioInterface.queueRunner());

	audioInterface.deleteConnection();
};

export default start;
