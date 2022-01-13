import { AudioPlayer, AudioResource, VoiceConnection } from '@discordjs/voice';
import { CommandInteractionHelper } from 'bot-classes';

export interface BaseAudioInterface {
	/**
	 * Based off of a queue index number, get an item in the queue.
	 */
	getItemId(index: number): Promise<string | null>;

	/**
	 * Get the player instance
	 */
	get player(): AudioPlayer;

	/**
	 * Is the bot busy playing something?
	 */
	get busy(): boolean;

	/**
	 * A runner method that resolves to true when the track is finished, and null when there is no more audio resources to play.
	 */
	runner(handler: CommandInteractionHelper): Promise<void>;

	/**
	 * Get the voice connection.
	 */
	get connection(): VoiceConnection | null;

	/**
	 * Set the voice connection.
	 * Setting this value to null deletes the connection.
	 */
	setConnection(voiceConnection: VoiceConnection): void;

	/**
	 * Get the current audio resource for this bot.
	 */
	get currentAudioResource(): AudioResource | null;

	/**
	 * Emit a fake audio finish event to be used to simulate a track finishing. Useful for skipping.
	 */
	emitAudioFinish(): boolean;
}
