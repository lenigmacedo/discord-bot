import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import { CmdRequirementError, CommandInteractionHelper, YouTubeInterface, YouTubeVideo } from '../../classes';
import { YtdlVideoInfoResolved } from '../../classes/modules/YouTubeVideo';
import { BaseCommand } from '../BaseCommand';
import { command } from '../decorators/command';
import Controls from './Controls';

export default class Play implements BaseCommand {
	register() {
		return new SlashCommandBuilder()
			.setName('play')
			.setDescription('If the bot is not busy, you can play something. Then it will continue the queue.')
			.addStringOption(option => option.setName('query').setDescription('A search query. First result from the search query will be used.'));
	}

	@command({
		ephemeral: false,
		enforceVoiceConnection: true,
		msgOnExpire: 'Controls has expired. Please use `/controls` to get get it back for another 15 minutes.'
	})
	async runner(handler: CommandInteractionHelper) {
		const query = handler.commandInteraction.options.getString('query');
		const youtubeInterface = YouTubeInterface.fromGuild(handler.guild);

		if (query) {
			const [video] = await YouTubeVideo.search(query, 1);

			if (!video?.id?.videoId) throw new CmdRequirementError('I could not find a video. Try something less specific?');

			const youtubeVideo = YouTubeVideo.fromId(video.id.videoId);

			const videoInfo = await youtubeVideo.info<YtdlVideoInfoResolved['videoDetails']>('.videoDetails').catch((e) => console.log(e, "erro"));
			const { title, video_url, likes, author, thumbnails, viewCount } = videoInfo || {};

			const content = {
				title: title || 'No URL',
				description: `${video_url || 'Video URL not found.'}`,
				likes: `${likes}` || '?',
				views: `${viewCount}` || '?',
				author: author?.name || '?',
				thumbnailUrl: thumbnails?.[3]?.url || 'No URL'
			};

			const message = await new MessageEmbed()
				.setTitle(`Vou tocar ${content.title} logo em breve`)
				.setDescription(content.description.substring(0, 200))
				.addField('Channel', content.author)
				.addField('Likes', content.likes)
				.addField('Views', content.views)
				.setThumbnail(content.thumbnailUrl);


			if (youtubeInterface.busy) {
				handler.commandInteraction.editReply({ embeds: [message] });
				await youtubeInterface.queue.add(youtubeVideo.id);
			} else {
				await youtubeInterface.queue.prepend(youtubeVideo.id);
				youtubeInterface.setPointer(1);
				await Controls.generateControls(handler, youtubeInterface);

				handler.status = 'SUCCESS';

				await youtubeInterface.runner(handler);
			}
		} else if (!youtubeInterface.busy) {
			youtubeInterface.setPointer(1);
			await Controls.generateControls(handler, youtubeInterface);

			handler.status = 'SUCCESS';

			await youtubeInterface.runner(handler);
		} else {
			throw new CmdRequirementError('I am busy!');
		}
	}
}
