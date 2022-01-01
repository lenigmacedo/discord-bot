import { YouTubeInterface, YouTubeVideo } from 'bot-classes';
import { ResponseEmojis } from 'bot-config';
import { Guild } from 'discord.js';
import { MessageComponentHandler } from '../MessageComponentHandler.types';

const searchVideoSelection: MessageComponentHandler = async interaction => {
	try {
		if (!(interaction.guild instanceof Guild)) {
			return;
		}

		if (!interaction.isSelectMenu()) {
			return;
		}

		const audioInterface = YouTubeInterface.fromGuild(interaction.guild);
		const value = interaction?.values[0];
		const youtubeVideo = YouTubeVideo.fromUrl(value);

		if (!value) {
			await interaction.reply(`${ResponseEmojis.Danger} I could not find the video from the selection. Try again?`);
		}

		const appended = await audioInterface.queue.add(youtubeVideo.id);

		if (appended) {
			await interaction.reply(`${ResponseEmojis.Success} I have added it to the queue!`);
		} else {
			await interaction.reply(`${ResponseEmojis.Danger} I was unable to add that video to the queue. Try again?`);
		}
	} catch (error) {
		console.error(error);
	}
};

export default searchVideoSelection;
