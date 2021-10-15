import { DiscordGatewayAdapterCreator, getVoiceConnection, joinVoiceChannel } from '@discordjs/voice';
import { GuildMember, Interaction } from 'discord.js';

/**
 * safeJoinVoiceChannel will try to join a voice channel from a given interaction if a connection does not already exist.
 * It ensures you're not unnecessarily creating new voice connections when one has already been established.
 */
export default function resolveConnection(interaction: Interaction) {
	try {
		if (!(interaction?.member instanceof GuildMember)) {
			throw TypeError('Interaction instance does not have an instance of GuildMember.');
		}

		if (!interaction?.guild || !interaction?.member?.voice?.channel) {
			throw TypeError('Interaction instance does not have a valid Guild instance or VoiceChannel / StageChannel instance.');
		}

		const potentialVoiceConnection = getVoiceConnection(interaction.guild.id);
		if (potentialVoiceConnection) return potentialVoiceConnection;

		const adapterCreator = interaction.guild.voiceAdapterCreator;
		if (!adapterCreator) {
			throw TypeError('Unable to retrieve an instance of DiscordGatewayAdapterCreator to create a connection to a voice channel.');
		}

		const connectionOptions = {
			guildId: interaction.guild.id,
			channelId: interaction.member.voice.channel.id,
			adapterCreator: interaction.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator
		};

		return joinVoiceChannel(connectionOptions);
	} catch (error) {
		console.error(error);
		return null;
	}
}
