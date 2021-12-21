import { AudioPlayer, AudioResource, VoiceConnection } from '@discordjs/voice';

/**
 * Ensure a new audio interface class (e.g. in the future we may want SoundCloudInterface, VimeoInterface etc.) has these methods to be fully implementable.
 */
export interface InterfaceDefinition {
	/**
	 * Based off of a queue index number, get an item in the queue.
	 */
	getItemInfo(queueItemIndex: number): Promise<any | null>;

	/**
	 * Get the player instance
	 */
	getPlayer(): AudioPlayer;

	/**
	 * Is the bot busy playing something?
	 */
	getBusyStatus(): boolean;

	/**
	 * A runner method that resolves to true when the track is finished, and null when there is no more audio resources to play.
	 */
	queueRunner(): Promise<true | null>;

	/**
	 * Set the connection for this instance.
	 */
	setConnection(connection: VoiceConnection): void;

	/**
	 * Delete the connection.
	 */
	deleteConnection(): true | null;

	/**
	 * Get this instance's connection.
	 */
	getConnection(): VoiceConnection | null;

	/**
	 * Get the current audio resource for this bot.
	 */
	getCurrentAudioResource(): AudioResource | null;

	/**
	 * Download the audio resource
	 */
	download(queueItemIndex: number): Promise<AudioResource | null>;

	/**
	 * Emit a fake audio finish event to be used to simulate a track finishing. Useful for skipping.
	 */
	emitAudioFinish(): true | null;

	/**
	 * Get the video details for this instance.
	 */
	getDetails(url: string): Promise<any | null>;
}
