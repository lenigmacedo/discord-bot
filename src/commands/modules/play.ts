import { AudioInterface } from 'bot-classes';
import { safeJoinVoiceChannel } from 'bot-functions';
import { GuildMember } from 'discord.js';
import { CommandHandler } from '../CommandHandler.types';

const play: CommandHandler = async interaction => {
	try {
		const guildMember = interaction.member;
		await interaction.reply('Going to play...');

		if (!interaction?.guild?.id || !(guildMember instanceof GuildMember)) {
			return;
		}

		const voiceChannel = guildMember.voice.channel;

		if (!voiceChannel) {
			await interaction.editReply('You must be connected to a voice channel for me to know where to join!');
			return;
		}

		const youtubeUrl = interaction.options.getString('youtube-url', true);
		const audioInterface = AudioInterface.getInterfaceForGuild(interaction.guild);

		if (audioInterface.isBusy()) {
			await interaction.editReply('I am busy!');
			return;
		}

		await interaction.editReply('Preparing to play...');
		audioInterface.setConnection(safeJoinVoiceChannel(interaction));
		await audioInterface.queuePrepend(youtubeUrl);
		await interaction.editReply('I am now playing audio.');
		while (await audioInterface.queueRunner());
		audioInterface.deleteConnection();
	} catch (error) {
		console.error(error);
	}
};

export default play;
