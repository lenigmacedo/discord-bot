import {
	AudioPlayer,
	AudioPlayerIdleState,
	AudioPlayerPlayingState,
	AudioPlayerState,
	AudioPlayerStatus,
	AudioResource,
	createAudioPlayer,
	VoiceConnection,
	VoiceConnectionStatus
} from '@discordjs/voice';
import { QueueManager, YouTubeVideo } from 'bot-classes';
import { config, globals } from 'bot-config';
import { Guild, GuildMember } from 'discord.js';
import { EventEmitter } from 'events';
import { TypedEmitter } from 'tiny-typed-emitter';
import { BaseAudioInterface } from '../BaseAudioInterface';

export class YouTubeInterface implements BaseAudioInterface {
	private audioPlayer: AudioPlayer;
	private audioVolume: number;
	private voiceConnection?: VoiceConnection;
	private currentResource?: AudioResource;
	private eventEmitter: YouTubeInterfaceEvents;
	private looped = false;
	queue: QueueManager;

	private constructor(guild: Guild, queueName = 'global') {
		this.audioPlayer = createAudioPlayer();
		this.audioVolume = config.audioVolume;
		this.queue = QueueManager.fromGuild(guild, ['youtube', queueName]);
		this.eventEmitter = new EventEmitter() as YouTubeInterfaceEvents;
	}

	/**
	 * Get the YouTube-based queue instance for a given guild. Will try to get one that already exists, but will create a new one if not.
	 * @param guild The guild to get the instance for.
	 */
	static fromGuild(guild: Guild, queueName?: string) {
		if (!globals.youtubePlayers.has(guild.id)) {
			globals.youtubePlayers.set(guild.id, new YouTubeInterface(guild, queueName));
		}

		return globals.youtubePlayers.get(guild.id) as YouTubeInterface;
	}

	/**
	 * This returns a queue with the scope being the user
	 * @param member
	 * @returns
	 */
	static fromGuildMember(member: GuildMember) {
		return this.fromGuild(member.guild, member.id);
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
	 * Trigger actions when events are fired.
	 */
	get events() {
		return this.eventEmitter;
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
		const status = this.voiceConnection?.state.status;
		const { Destroyed } = VoiceConnectionStatus;

		return !!status && status !== Destroyed;
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
		this.events.emit('next');
	}

	/**
	 * Start the execution of the queue by joining the bot and playing audio.
	 * To use this, await this method in a while loop. Will resolve true to indicate finish, and null to stop.
	 */
	runner(): Promise<true | null> {
		// The async promise executor is warranted, because the resolving of this promise is a big delayed task and the code will look very ugly without async.
		/* eslint-disable no-async-promise-executor */
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

				this.events.on('stop', () => {
					player.removeAllListeners();
					this.events.removeAllListeners();
				});
			} catch (error) {
				console.error(error);
				await this.handleFinish(true);
				resolve(true);
			}
		});
		/* eslint-enable no-async-promise-executor */
	}

	/**
	 * Pause the player.
	 *
	 * @returns true if the player was successfully paused, otherwise false.
	 */
	pause() {
		const paused = this.player.pause(true);

		if (paused && this.player.state.status === 'paused') {
			this.events.emit('pause');
		}

		return paused;
	}

	/**
	 * Resume the player
	 *
	 * @returns true if the player was successfully unpaused, otherwise false.
	 */
	resume() {
		const resumed = this.player.unpause();

		if (resumed && this.player.state.status === 'playing') {
			this.events.emit('resume');
		}

		return resumed;
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
		this.currentResource = undefined;
		const destroyed = this.connection?.state.status === 'destroyed';

		if (this.connection instanceof VoiceConnection && !destroyed) {
			this.connection.disconnect();
			this.connection.destroy();
			this.events.emit('stop');
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

			this.events.emit('volumechange');

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

type YouTubeInterfaceEvents = TypedEmitter<{
	next: () => void;
	stop: () => void;
	pause: () => void;
	resume: () => void;
	volumechange: () => void;
}>;
