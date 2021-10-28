import { AudioInterface } from 'bot-classes';
import { findYouTubeUrls, getVideoDetails, safeJoinVoiceChannel } from 'bot-functions';
import { GuildMember } from 'discord.js';
import { CommandHandler } from '../CommandHandler.types';

const play: CommandHandler = async interaction => {
	try {
		const guildMember = interaction.member;

		if (!interaction?.guild?.id || !(guildMember instanceof GuildMember)) {
			return;
		}

		await interaction.deferReply();

		const voiceChannel = guildMember.voice.channel;

		if (!voiceChannel) {
			await interaction.editReply('🚨 You must be connected to a voice channel!');
			return;
		}

		const queryOrUrl = interaction.options.getString('url-or-query', true);
		const audioInterface = AudioInterface.getInterfaceForGuild(interaction.guild);

		if (audioInterface.isBusy()) {
			await interaction.editReply('🚨 I am busy!');
			return;
		}

		let prepended = await audioInterface.queuePrepend(queryOrUrl);
		let url = '';

		if (!prepended) {
			const urls = await findYouTubeUrls(queryOrUrl, 1);
			url = urls[0];
			prepended = await audioInterface.queuePrepend(url);

			if (!prepended) {
				console.log('Query not URL, trying a search...');
				await interaction.editReply('🚨 I could not find a video. Try something less specific?');
				console.log('Search failed.');
				return;
			}
		} else {
			console.log('URL provided, using that.');
			url = queryOrUrl;
		}

		await interaction.editReply('🔃 Preparing to play...');
		audioInterface.setConnection(safeJoinVoiceChannel(interaction));
		const videoDetails = await getVideoDetails(url);
		await interaction.editReply(`🔊 Playing \`${videoDetails?.videoDetails.title}\`.`);
		while (await audioInterface.queueRunner());
		audioInterface.deleteConnection();
	} catch (error) {
		console.error(error);
	}
};

export default play;
