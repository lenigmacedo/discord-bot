import { SlashCommandBuilder } from '@discordjs/builders';
import { UserInteraction, YouTubeInterface, YtdlVideoInfoResolved } from 'bot-classes';
import config, { ColourScheme, ResponseEmojis } from 'bot-config';
import { ColorResolvable, CommandInteraction, EmbedFieldData, Message, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { BaseCommand } from '../BaseCommand';

export default class Queue implements BaseCommand {
	commandInteraction: CommandInteraction;
	page: number = 0;
	pageCount: number = 0;

	constructor(commandInteraction: CommandInteraction) {
		this.commandInteraction = commandInteraction;
	}

	register() {
		return new SlashCommandBuilder()
			.setName('queue')
			.setDescription('Get a list of all the items in the queue.')
			.addIntegerOption(option => option.setName('page').setDescription('Page number for if your queue is really long!'))
			.addBooleanOption(option => option.setName('hide-in-chat').setDescription('Want no one to tamper with your queue? Set this to true.'));
	}

	async runner() {
		const ephemeral = this.commandInteraction.options.getBoolean('hide-in-chat') || false;
		const handler = await new UserInteraction(this.commandInteraction).init(ephemeral);

		try {
			const youtubeInterface = YouTubeInterface.getInterfaceForGuild(handler.guild);
			const queueLength = await youtubeInterface.queue.queueLength();

			if (!queueLength) {
				handler.editWithEmoji('The queue is currently empty.', ResponseEmojis.Info);
				return;
			}

			this.page = this.commandInteraction.options.getInteger('page') || 1;
			this.pageCount = Math.ceil(queueLength / config.paginateMaxLength);

			// Clamp user's defined page argument
			if (this.page > this.pageCount) this.page = this.pageCount;
			else if (this.page < 1) this.page = 1;

			const components = this.createButtonsComponent();
			const embedFields = await this.getPageEmbedFieldData(youtubeInterface);
			const embeds = await this.getPageMessageEmbed(embedFields, queueLength);
			const botMessage = await handler.commandInteraction.editReply({ embeds: [embeds], components });

			if (botMessage instanceof Message) {
				this.registerButtonInteractionLogic(botMessage, handler);
			} else {
				throw Error('Problem with button interaction. Try this command again.');
			}
		} catch (error: any) {
			handler.editWithEmoji(error.message, ResponseEmojis.Danger);
			console.error(error);
		}
	}

	/**
	 * Create Discord message buttons. This method is useful because it shows and hides buttons dynamically depending on where they are in the queue.
	 */
	createButtonsComponent() {
		const prevButton = new MessageButton().setCustomId('queue-navigate-prev').setLabel('<<').setStyle('PRIMARY');
		const nextButton = new MessageButton().setCustomId('queue-navigate-next').setLabel('>>').setStyle('PRIMARY');
		const firstPageButton = new MessageButton().setCustomId('queue-navigate-start').setLabel('1').setStyle('PRIMARY');
		const lastPageButton = new MessageButton().setCustomId('queue-navigate-last').setLabel(`${this.pageCount}`).setStyle('PRIMARY');
		const buttons = new MessageActionRow();

		if (this.page > 2) buttons.addComponents(firstPageButton);
		if (this.page > 1) buttons.addComponents(prevButton);
		if (this.page < this.pageCount) buttons.addComponents(nextButton);
		if (this.page < this.pageCount - 1) buttons.addComponents(lastPageButton);

		const components = buttons.components.length ? [buttons] : undefined;
		return components;
	}

	/**
	 * A function that takes a list of queue items via a YouTube interface, and returns a list of Discord fields for use in an embed.
	 * @param youtubeInterface The YouTube interface instance.
	 */
	async getPageEmbedFieldData(youtubeInterface: YouTubeInterface) {
		const queue = await youtubeInterface.queue.queueGetMultiple(this.page);
		const videoDetailPromiseArray = queue.map(url => youtubeInterface?.getDetails(url));
		const videoDetails = (await Promise.all(videoDetailPromiseArray)) as YtdlVideoInfoResolved[];

		const embedFields: EmbedFieldData[] = videoDetails.map((videoDetails, index) => {
			const itemNumberOffset = (this.page - 1) * config.paginateMaxLength;
			const itemNumber = index + 1 + itemNumberOffset;
			const videoDetailsObj = videoDetails?.videoDetails;

			if (!videoDetailsObj?.title || !videoDetailsObj.description) {
				return {
					name: `${itemNumber}) ${ResponseEmojis.Danger} FAILED`,
					value: `Video private or age restricted or something else.`
				};
			}

			return {
				name: `${itemNumber}) ${videoDetailsObj.title.substring(0, 100)}`,
				value: `By \`${videoDetailsObj.author.name}\`.\n>> ${videoDetailsObj.video_url}`
			};
		});

		return embedFields;
	}

	/**
	 * A simple function that will provide you with a Discord Embed styled specifically for displaying a queue.
	 * Please use the return from this.getPageEmbedFieldData() first!
	 * @param embedFields A list of discord embed fields containing video information.
	 * @param queueLength The length of the current queue by items.
	 */
	async getPageMessageEmbed(embedFields: EmbedFieldData[], queueLength: number) {
		return new MessageEmbed()
			.setColor(ColourScheme.Success as ColorResolvable)
			.setTitle(`${ResponseEmojis.Scroll} Current Queue`)
			.setDescription(
				`There ${queueLength === 1 ? 'is' : 'are'} ${queueLength} item${queueLength === 1 ? '' : 's'} in the queue.\nPage ${this.page}/${
					this.pageCount
				}`
			)
			.setFields(...embedFields);
	}

	/**
	 * This method will take a bot's reply, and the original interaction to allow the interactive buttons to work.
	 * @param botMessage An instance returned from a bot reply.
	 * @param handler The Command instance with a valid commandInteraction instance applied to it.
	 */
	async registerButtonInteractionLogic(botMessage: Message, handler: UserInteraction) {
		const collector = botMessage.createMessageComponentCollector({
			time: config.queueButtonExpiryMilliseconds // Expires for memory reasons.
		});

		// This removes the buttons when the buttons expire as they no longer work.
		collector.on('end', async () => {
			await handler.commandInteraction.editReply({ components: [] });
		});

		collector.on('collect', async collected => {
			const youtubeInterface = YouTubeInterface.getInterfaceForGuild(handler.guild);
			const newQueueLength = await youtubeInterface.queue.queueLength();
			this.pageCount = Math.ceil(newQueueLength / config.paginateMaxLength);

			switch (collected.customId) {
				case 'queue-navigate-next':
					this.page++;
					break;
				case 'queue-navigate-prev':
					this.page--;
					break;
				case 'queue-navigate-start':
					this.page = 1;
					break;
				case 'queue-navigate-last':
					this.page = this.pageCount;
					break;
			}

			if (this.page > this.pageCount) this.page = this.pageCount;
			else if (this.page < 1) this.page = 1;

			collected.deferUpdate(); // Without this, the interaction will show as failed for the user.
			const components = this.createButtonsComponent();
			const newEmbedFields = await this.getPageEmbedFieldData(youtubeInterface);
			const newEmbeds = await this.getPageMessageEmbed(newEmbedFields, newQueueLength);
			await handler.commandInteraction.editReply({ embeds: [newEmbeds], components });
		});
	}
}
