import { createAudioPlayer, createAudioResource, DiscordGatewayAdapterCreator, joinVoiceChannel } from '@discordjs/voice';
import { globals } from 'bot-config';
import { GuildMember } from 'discord.js';
import ytdl from 'ytdl-core-discord';
import { CommandHandler } from '../CommandHandler.types';

const player = createAudioPlayer();

const play: CommandHandler = async interaction => {
	if (!interaction.guildId || !(interaction.member instanceof GuildMember)) return;

	// The user who sent the command
	const guildMember = interaction.member;
	const voiceChannel = guildMember.voice.channel;

	if (!voiceChannel) {
		await interaction.reply('You must be connected for a voice channel for me to know where to join!');
		return;
	}

	const adapterCreator = interaction.guild?.voiceAdapterCreator;
	if (!adapterCreator) return;

	const connectionOptions = {
		guildId: interaction.guildId,
		channelId: voiceChannel.id,
		adapterCreator: interaction.guild?.voiceAdapterCreator as DiscordGatewayAdapterCreator
	};

	const player = globals.audioPlayer;
	const connection = joinVoiceChannel(connectionOptions);
	const audioBitstream = await ytdl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'); // Never gonna give you up!
	const audioResource = createAudioResource(audioBitstream);
	connection.subscribe(player);

	player.play(audioResource);
	interaction.reply('I am playing some audio!');
};

export default play;
