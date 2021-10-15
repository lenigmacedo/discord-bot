import { AudioPlayerState, createAudioResource, DiscordGatewayAdapterCreator, getVoiceConnection, joinVoiceChannel } from '@discordjs/voice';
import { globals } from 'bot-config';
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

		const adapterCreator = interaction.guild?.voiceAdapterCreator;
		if (!adapterCreator) {
			interaction.reply('Unable to create or retrieve the voice adapter. I cannot play the video.');
			return;
		}

		const connectionOptions = {
			guildId: interaction.guildId,
			channelId: voiceChannel.id,
			adapterCreator: interaction.guild?.voiceAdapterCreator as DiscordGatewayAdapterCreator
		};

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
		const connection = getVoiceConnection(interaction.guildId) || joinVoiceChannel(connectionOptions);
		await interaction.editReply(`Downloaded! Now I am preparing to stream...`);

		const audioResource = createAudioResource(audioBitstream);
		connection.subscribe(player);

		await interaction.editReply(`Now playing \`${details.videoDetails.title}\` by \`${details.videoDetails.author.name}\``);
		player.play(audioResource);

		// When the criteria for this callback has been met, we must destroy it as an event listener otherwise
		// it will try to run an "outdated" callback which runs destroy on an old connection instance which is bad.
		// "player.once" could be used, but it will always destroy the event listener even if the critera was not met so it is not suitable.
		const onIdleCallback = (oldState: AudioPlayerState, newState: AudioPlayerState) => {
			if (oldState.status === 'playing' && newState.status === 'idle') {
				player.removeListener('stateChange', onIdleCallback);
				connection.destroy();
			}
		};
		player.on('stateChange', onIdleCallback);
	} catch (error) {
		console.error(error);
	}
};

export default play;
