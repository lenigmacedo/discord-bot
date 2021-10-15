import { AudioPlayer, AudioPlayerState, VoiceConnection } from '@discordjs/voice';

/**
 * This function will automatically destroy the voice connection for the bot if it goes idle.
 */
export default function destroyConnectionOnIdle(player: AudioPlayer, connection: VoiceConnection) {
	// When the criteria for this callback has been met, we must destroy it as an event listener otherwise
	// it will try to run an "outdated" callback which runs destroy on an old connection instance which is bad.
	// "player.once" could be used, but it will always destroy the event listener even if the critera was not met so it is not suitable.
	const onIdleCallback = (oldState: AudioPlayerState, newState: AudioPlayerState) => {
		if (oldState.status === 'playing' && newState.status === 'idle') {
			player.removeListener('stateChange', onIdleCallback);
			connection.destroy();
		}
	};
	player.on('stateChange', onIdleCallback);
}
