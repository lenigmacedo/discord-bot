import { YouTubeInterface } from 'bot-classes';
import { getCommandIntraction, getYouTubeUrls, safeJoinVoiceChannel } from 'bot-functions';
import { CommandHandler } from '../CommandHandler.types';

const play: CommandHandler = async initialInteraction => {
	try {
		const commandInteraction = getCommandIntraction(initialInteraction);

		if (!commandInteraction) {
			return;
		}

		const { interaction, guild, guildMember } = commandInteraction;
		await interaction.deferReply();
		const voiceChannel = guildMember.voice.channel;

		if (!voiceChannel) {
			await interaction.editReply('🚨 You must be connected to a voice channel for me to play something!');
			return;
		}

		const queryOrUrl = interaction.options.getString('url-or-query', true);
		const audioInterface = YouTubeInterface.getInterfaceForGuild(guild);

		if (audioInterface.getBusyStatus()) {
			await interaction.editReply('🚨 I am busy!');
			return;
		}

		let prepended = await audioInterface.queue.queuePrepend(queryOrUrl);
		let url = '';

		if (!prepended) {
			console.log('Query not URL, trying a search...');
			const urls = await getYouTubeUrls(queryOrUrl, 1);
			url = urls[0];
			prepended = await audioInterface.queue.queuePrepend(url);

			if (!prepended) {
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
		const videoDetails = await audioInterface.getDetails(url);
		if (videoDetails) await interaction.editReply(`🔊 Playing \`${videoDetails?.videoDetails.title}\`.`);
		else await interaction.editReply('🚨 Unable to play the video. It might be private, age restricted or something else. It will be skipped.');
		while (await audioInterface.queueRunner());
		audioInterface.deleteConnection();
	} catch (error) {
		console.error(error);
	}
};

export default play;
