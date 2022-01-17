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
import { CommandInteractionHelper, QueueManager, YouTubeVideo } from 'bot-classes';
import { config, globals } from 'bot-config';
import { numClamp, numWrap } from 'bot-functions';
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
	private pointer = 1; // What the bot is playing or what it should play.
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
	 * This returns a queue with the scope being the user.
	 *
	 * @param member
	 * @returns YouTubeInterface an existing or new instance.
	 */
	static fromGuildMember(member: GuildMember) {
		return this.fromGuild(member.guild, member.id);
	}

	/**
	 * Set a connection instance to the guild.
	 *
	 * @param connection Connection to set.
	 */
	setConnection(connection: VoiceConnection) {
		this.voiceConnection = connection;
		this.voiceConnection.subscribe(this.player);
	}

	/**
	 * Get the item index the bot will or is currently playing.
	 *
	 * @returns number
	 */
	get currentPointer() {
		return this.pointer;
	}

	/**
	 * Set the pointer!
	 *
	 * @returns the new pointer.
	 */
	async setPointer(value: number) {
		const queueLength = await this.queue.length();
		const validatedPointer = numClamp(value, 1, queueLength);

		this.pointer = validatedPointer;

		return this.pointer;
	}

	/**
	 * The event instance for this instance.
	 *
	 * @returns YouTubeInterfaceEvents
	 */
	get events() {
		return this.eventEmitter;
	}

	/**
	 * Get the connection instance associated with this guild.
	 *
	 * @returns VoiceConnection | null
	 */
	get connection() {
		return this.voiceConnection || null;
	}

	/**
	 * Get the video ID.
	 *
	 * @param index The queue item index. By default it gets the item the pointer is set to.
	 */
	getItemId(index = this.pointer - 1) {
		return this.queue.get(index);
	}

	/**
	 * Get the player instance associated with this guild.
	 *
	 * @returns AudioPlayer
	 */
	get player() {
		return this.audioPlayer;
	}

	/**
	 * Is the bot playing audio in thie guild?
	 *
	 * @returns boolean true indicates busy, false indicates not busy.
	 */
	get busy() {
		const status = this.voiceConnection?.state.status;
		const { Destroyed } = VoiceConnectionStatus;

		return !!status && status !== Destroyed;
	}

	/**
	 * What should this player do when the audio has finished?
	 * By default it removes the current audio track. But if looped is set to true, it will re-add the track to the end of the queue.
	 */
	private async handleFinish() {
		const queueLength = await this.queue.length();

		if (this.isLooped) {
			this.pointer = numWrap(this.pointer, 1, queueLength);
			this.events.emit('next');
			return true;
		}

		if (this.pointer < queueLength) {
			this.pointer++;
			this.events.emit('next');
			return true;
		} else {
			this.pointer = 1;
		}

		this.events.emit('stop');
		return false;
	}

	/**
	 * Start the execution of the queue by joining the bot and playing audio.
	 * To use this, await this method in a while loop. Will resolve true to indicate finish, and null to stop.
	 */
	async runner(handler: CommandInteractionHelper) {
		if (this.busy) {
			console.error('A new runner was attempted to have been spawned whilst another runner was active. Aborted.');
			return;
		}

		this.setConnection(handler.joinVoiceChannel());

		// Resolves when the item has finished playing.
		while (
			/* eslint-disable no-async-promise-executor */
			await new Promise(async resolve => {
				try {
					const videoId = await this.queue.get(this.pointer - 1);

					this.player.removeAllListeners('error');
					this.player.removeAllListeners('stateChange');

					const youtubeVideo = YouTubeVideo.fromId(videoId);
					const audioResource = await youtubeVideo.download();

					if (!audioResource) throw Error('Could not resolve the audio resource from YouTube.');

					this.currentResource = audioResource;
					this.currentResource.volume?.setVolume(this.audioVolume);
					this.player.play(this.currentResource);

					this.player.once('error', () => {
						throw Error('Bad audio resource, cannot continue.');
					});

					this.player.on('stateChange', async (oldState: AudioPlayerState, newState: AudioPlayerState) => {
						if (oldState.status === 'playing' && newState.status === 'idle') {
							const toResolve = await this.handleFinish();
							resolve(toResolve);
						}
					});
				} catch (error) {
					console.error(error);
					this.events.emit('next');
					this.queue.delete(this.pointer - 1);
					resolve(true);
				}
			})
			/* eslint-enable no-async-promise-executor */
		);

		this.deleteConnection();
		this.events.emit('stop');

		return;
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
	 *
	 * @param option boolean
	 */
	set loop(option: boolean) {
		this.looped = option;
	}

	/**
	 * Is the player looping the playlist?
	 *
	 * @returns boolean true indicates yes, false inficates no.
	 */
	get isLooped() {
		return this.looped;
	}

	/**
	 * Destroy the connection instance associated with this guild.
	 *
	 * @returns boolean true indicates the connection has been deletes, false indicates it has not.
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

		return false;
	}

	/**
	 * Get the current audio resource.
	 *
	 * @returns AudioResource<unknown> | null
	 */
	get currentAudioResource() {
		return this.currentResource || null;
	}

	/**
	 * Set the audible volume of the bot.
	 *
	 * @param volume Volume between 0 and 100
	 * @returns boolean true indicates the operation was successful, false indicates otherwise.
	 */
	setVolume(volume: number) {
		try {
			const validatedVolume = numClamp(volume, 0, 100);

			this.audioVolume = validatedVolume / 100; // 0 is mute, 1 is max volume.

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
	 *
	 * @returns number percentage
	 */
	get volume() {
		return this.audioVolume * 100;
	}

	/**
	 * Emit the exact event that will happen when the bot gets to the end of its current audio track. Useful for skipping.
	 *
	 * @returns boolean true indicates the operation was successful, false indicates otherwise.
	 */
	emitAudioFinish() {
		const currentAudioResource = this.currentAudioResource;

		if (!(currentAudioResource instanceof AudioResource)) return false;

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

		this.player.emit('stateChange', oldState, newState);

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
