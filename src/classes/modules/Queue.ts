import { AudioPlayer, createAudioPlayer, VoiceConnection } from '@discordjs/voice';
import { globals } from 'bot-config';
import { Guild } from 'discord.js';

export default class Queue {
	guild: Guild;
	player: AudioPlayer;
	connection?: VoiceConnection;

	constructor(guild: Guild) {
		this.guild = guild;
		this.player = createAudioPlayer();
	}

	/**
	 * Return the queue instance for this guild. Will contstruct a new one if one does not already exist.
	 */
	static getQueue(guild: Guild) {
		if (!globals.players.has(guild.id)) {
			globals.players.set(guild.id, new Queue(guild));
		}

		return globals.players.get(guild.id) as Queue;
	}

	getPlayer() {
		return this.player;
	}

	setConnection(connection: VoiceConnection) {
		this.connection = connection;
	}

	getConnection() {
		return this.connection;
	}
}
