import { AudioPlayer, AudioResource, VoiceConnection } from '@discordjs/voice';

export abstract class BaseAudioInterface {
	/**
	 * Based off of a queue index number, get an item in the queue.
	 */
	abstract getItemId(index: number): Promise<string | null>;

	/**
	 * Get the player instance
	 */
	abstract get player(): AudioPlayer;

	/**
	 * Is the bot busy playing something?
	 */
	abstract get busy(): boolean;

	/**
	 * A runner method that resolves to true when the track is finished, and null when there is no more audio resources to play.
	 */
	abstract runner(): Promise<true | null>;

	/**
	 * Get the voice connection.
	 */
	abstract get connection(): VoiceConnection | null;

	/**
	 * Set the voice connection.
	 * Setting this value to null deletes the connection.
	 */
	abstract setConnection(voiceConnection: VoiceConnection): void;

	/**
	 * Get the current audio resource for this bot.
	 */
	abstract get currentAudioResource(): AudioResource | null;

	/**
	 * Emit a fake audio finish event to be used to simulate a track finishing. Useful for skipping.
	 */
	abstract emitAudioFinish(): true | null;
}
