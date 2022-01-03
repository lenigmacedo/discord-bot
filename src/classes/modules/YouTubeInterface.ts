import {
	AudioPlayer,
	AudioPlayerIdleState,
	AudioPlayerPlayingState,
	AudioPlayerState,
	AudioPlayerStatus,
	AudioResource,
	createAudioPlayer,
	VoiceConnection
} from '@discordjs/voice';
import { QueueManager } from 'bot-classes';
import { config, globals } from 'bot-config';
import { Guild } from 'discord.js';
import { BaseAudioInterface } from '../BaseAudioInterface';
import YouTubeVideo from './YouTubeVideo';

export default class YouTubeInterface implements BaseAudioInterface {
	private audioPlayer: AudioPlayer;
	private audioVolume: number;
	private voiceConnection?: VoiceConnection;
	private currentResource?: AudioResource | null;
	private looped = false;
	queue: QueueManager;

	/**
	 * An easy toolbox for managing YouTube audio for this bot.
	 */
	constructor(guild: Guild) {
		this.audioPlayer = createAudioPlayer();
		this.audioVolume = config.audioVolume;
		this.queue = QueueManager.fromGuild(guild, 'youtube');
	}

	/**
	 * Get the YouTube-based queue instance for a given guild. Will try to get one that already exists, but will create a new one if not.
	 * @param guild The guild to get the instance for.
	 */
	static fromGuild(guild: Guild) {
		if (!globals.youtubePlayers.has(guild.id)) {
			globals.youtubePlayers.set(guild.id, new YouTubeInterface(guild));
		}

		return globals.youtubePlayers.get(guild.id) as YouTubeInterface;
	}

	/**
	 * Set a connection instance to the guild.
	 * @param connection Connection to set.
	 */
	setConnection(connection: VoiceConnection) {
		this.voiceConnection = connection;
		this.voiceConnection.subscribe(this.player);
	}

	/**
	 * Open the database connection.
	 */
	async open() {
		await this.queue.open();
	}

	/**
	 * Close the database connection.
	 */
	async close() {
		this.queue.close();
	}

	/**
	 * Get the connection instance associated with this guild.
	 */
	get connection() {
		return this.voiceConnection || null;
	}

	/**
	 * Get the video ID or String from its index.
	 * @param queueItemIndex The queue item index.
	 */
	getItemId(index = 0) {
		return this.queue.get(index);
	}

	/**
	 * Get the player instance associated with this guild.
	 */
	get player() {
		return this.audioPlayer;
	}

	/**
	 * Is the bot playing audio in thie guild?
	 */
	get busy() {
		const connection = this.connection;
		if (!connection?.state.status) return false;
		if (connection?.state.status !== 'destroyed') return true;
		return false;
	}

	/**
	 * What should this player do when the audio has finished?
	 * By default it removes the current audio track. But if looped is set to true, it will re-add the track to the end of the queue.
	 * @param byError Did the player encounter an error? If so, this will delete the video and ignore re-adding it if the player is looped.
	 */
	private async handleFinish(byError = false) {
		if (this.looped && !byError) {
			const currentVideo = await this.queue.first();

			if (!currentVideo) return;

			await this.queue.add(currentVideo);
		}

		await this.queue.deleteFirst();
	}

	/**
	 * Start the execution of the queue by joining the bot and playing audio.
	 * To use this, await this method in a while loop. Will resolve true to indicate finish, and null to stop.
	 */
	runner(): Promise<true | null> {
		return new Promise(async resolve => {
			try {
				const player = this.player;
				const videoId = await this.queue.first(); // Video ID
				const queueLength = await this.queue.length();

				if (!videoId || !queueLength) {
					resolve(null);
					return;
				}

				const youtubeVideo = YouTubeVideo.fromId(videoId);
				const audioResource = await youtubeVideo.download();

				const onIdleCallback = async (oldState: AudioPlayerState, newState: AudioPlayerState) => {
					if (oldState.status === 'playing' && newState.status === 'idle') {
						player.removeListener('stateChange', onIdleCallback);
						await this.handleFinish();
						resolve(true);
					}
				};

				player.on('stateChange', onIdleCallback);

				if (!audioResource) {
					console.error('Audio playback skipped due to no audio resource being detected.');
					player.removeListener('stateChange', onIdleCallback);
					await this.handleFinish(true);
					resolve(true);
					return;
				}

				this.currentResource = audioResource;
				this.currentResource.volume?.setVolume(this.audioVolume);
				player.play(this.currentResource);

				// Ytdl core sometimes does not reliably download the audio data, so this handles the error.
				player.once('error', async () => {
					console.error('Audio playback skipped due to invalid stream data!');
					await this.handleFinish(true);
					player.removeListener('stateChange', onIdleCallback);
					resolve(true);
				});
			} catch (error) {
				console.error(error);
				await this.handleFinish(true);
				resolve(true);
			}
		});
	}

	/**
	 * Set if this player should loop the playlist.
	 * All this does is let the runner know that instead of deleting the video after play, just re-add it to the end of the queue.
	 */
	set loop(option: boolean) {
		this.looped = option;
	}

	/**
	 * Is the player looping the playlist?
	 */
	get isLooped() {
		return this.looped;
	}

	/**
	 * Destroy the connection instance associated with this guild
	 */
	deleteConnection() {
		this.currentResource = null;
		const destroyed = this.connection?.state.status === 'destroyed';

		if (this.connection instanceof VoiceConnection && !destroyed) {
			this.connection.disconnect();
			this.connection.destroy();
			return true;
		}

		return null;
	}

	/**
	 * Get the current audio resource
	 */
	get currentAudioResource() {
		return this.currentResource || null;
	}

	/**
	 * Set the audible volume of the bot.
	 * @param volume Volume between 0 and 100
	 */
	setVolume(volume: number): boolean {
		try {
			if (volume < 0 || volume > 100) {
				return false;
			}

			this.audioVolume = volume / 100; // 0 is mute, 1 is max volume.
			const currentAudioResource = this.currentAudioResource;

			if (currentAudioResource) {
				currentAudioResource.volume?.setVolume(this.audioVolume);
			}

			return true;
		} catch (error) {
			return false;
		}
	}

	/**
	 * The current volume level for this instance.
	 */
	get volume() {
		return this.audioVolume * 100;
	}

	/**
	 * Emit the exact event that will happen when the bot gets to the end of its current audio track. Useful for skipping.
	 */
	emitAudioFinish() {
		const currentAudioResource = this.currentAudioResource;
		const player = this.player;
		if (!(currentAudioResource instanceof AudioResource)) return null;

		const oldState: AudioPlayerPlayingState = {
			status: AudioPlayerStatus.Playing,
			playbackDuration: currentAudioResource.playbackDuration,
			missedFrames: 0,
			resource: currentAudioResource,
			onStreamError: console.error
		};

		const newState: AudioPlayerIdleState = {
			status: AudioPlayerStatus.Idle
		};

		player.emit('stateChange', oldState, newState);
		return true;
	}
}
