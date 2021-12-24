import { AudioPlayer, AudioResource, VoiceConnection } from '@discordjs/voice';

export abstract class BaseAudioInterface {
	constructor() {}

	/**
	 * Based off of a queue index number, get an item in the queue.
	 */
	abstract getItemInfo(queueItemIndex: number): Promise<any | null>;

	/**
	 * Get the player instance
	 */
	abstract get player(): AudioPlayer;

	/**
	 * Is the bot busy playing something?
	 */
	abstract getBusyStatus(): boolean;

	/**
	 * A runner method that resolves to true when the track is finished, and null when there is no more audio resources to play.
	 */
	abstract queueRunner(): Promise<true | null>;

	/**
	 * Set the connection for this instance.
	 */
	abstract setConnection(connection: VoiceConnection): void;

	/**
	 * Delete the connection.
	 */
	abstract deleteConnection(): true | null;

	/**
	 * Get this instance's connection.
	 */
	abstract getConnection(): VoiceConnection | null;

	/**
	 * Get the current audio resource for this bot.
	 */
	abstract getCurrentAudioResource(): AudioResource | null;

	/**
	 * Download the audio resource
	 */
	abstract download(queueItemIndex: number): Promise<AudioResource | null>;

	/**
	 * Emit a fake audio finish event to be used to simulate a track finishing. Useful for skipping.
	 */
	abstract emitAudioFinish(): true | null;

	/**
	 * Get the video details for this instance.
	 */
	abstract getDetails(url: string): Promise<any | null>;
}
