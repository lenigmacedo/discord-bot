import { createAudioResource } from '@discordjs/voice';
import { globals } from 'bot-config';
import { destroyConnectionOnIdle, safeJoinVoiceChannel } from 'bot-functions';
import { GuildMember } from 'discord.js';
import ytdl from 'ytdl-core-discord';
import { CommandHandler } from '../CommandHandler.types';

const play: CommandHandler = async interaction => {
	try {
		// The user who sent the command
		const guildMember = interaction.member;
		if (!interaction.guildId || !(guildMember instanceof GuildMember)) {
			return;
		}

		const voiceChannel = guildMember.voice.channel;
		if (!voiceChannel) {
			await interaction.reply('You must be connected for a voice channel for me to know where to join!');
			return;
		}

		const youtubeUrl = interaction.options.get('url', true).value;
		if (typeof youtubeUrl !== 'string') {
			interaction.reply('Invalid argument provided. This issue must be reported to the bot developer, as it is a configuration issue on our end.');
			return;
		}

		if (!ytdl.validateURL(youtubeUrl)) {
			interaction.reply('Invalid URL. I cannot play that video.');
			return;
		}
		await interaction.reply('Downloading YouTube video...');

		const details = await ytdl.getBasicInfo(youtubeUrl);
		const audioBitstream = await ytdl(youtubeUrl, { filter: 'audioonly' });
		const player = globals.audioPlayer;
		const connection = safeJoinVoiceChannel(interaction);
		if (!connection) {
			interaction.reply('I was unable to establish a connection to the voice channel!');
			return;
		}

		await interaction.editReply(`Downloaded! Now I am preparing to stream...`);
		const audioResource = createAudioResource(audioBitstream);
		connection.subscribe(player);

		await interaction.editReply(`Now playing \`${details.videoDetails.title}\` by \`${details.videoDetails.author.name}\``);
		player.play(audioResource);

		destroyConnectionOnIdle(player, connection);
	} catch (error) {
		console.error(error);
	}
};

export default play;
