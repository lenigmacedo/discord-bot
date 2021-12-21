import { YouTubeInterface, YtdlVideoInfoResolved } from 'bot-classes';
import config from 'bot-config';
import { getCommandIntraction } from 'bot-functions';
import { ColorResolvable, CommandInteraction, EmbedFieldData, Guild, Message, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { CommandHandler } from '../CommandHandler.types';

const queue: CommandHandler = async initialInteraction => {
	try {
		const interactiveQueue = new InteractiveQueue(initialInteraction);
		const initialMessage = await interactiveQueue.runInitialResponse();
		if (!(initialMessage instanceof Message)) return;
		interactiveQueue.registerButtonInteractionLogic(initialMessage);
	} catch (error) {
		console.error(error);
	}
};

class InteractiveQueue {
	interaction: CommandInteraction;
	guild: Guild;
	audioInterface: YouTubeInterface;
	page: number;
	pageCount: number;

	constructor(initialInteraction: CommandInteraction) {
		this.page = 1;
		this.pageCount = 1;

		const commandInteraction = getCommandIntraction(initialInteraction);
		if (!commandInteraction) throw TypeError('Command interaction for /queue is not performed in a Discord server and was cancelled.'); // The "getCommandInteraction" function should handle this.

		this.interaction = commandInteraction.interaction;
		this.guild = commandInteraction.guild;
		this.audioInterface = YouTubeInterface.getInterfaceForGuild(this.guild);
	}

	async runInitialResponse() {
		const ephemeral = this.interaction.options.getBoolean('hide-in-chat') || false;
		await this.interaction.deferReply({ ephemeral });
		const initialQueueLength = await this.audioInterface.queue.queueLength();

		if (!initialQueueLength) {
			await this.interaction.editReply('ℹ️ Queue is empty.');
			return false;
		}

		this.page = this.interaction.options.getInteger('page') || 1;
		this.pageCount = Math.ceil(initialQueueLength / config.paginateMaxLength);

		// Make sure that the user has defined a page within the right range and modify the value if not.
		if (this.page > this.pageCount) this.page = this.pageCount;
		else if (this.page < 1) this.page = 1;

		const components = this.createButtonsComponent();
		const embedFields = await this.getPageEmbedFieldData();
		const embeds = await this.getPageMessageEmbed(embedFields);
		const botMessage = await this.interaction.editReply({ embeds: [embeds], components });

		return botMessage;
	}

	async registerButtonInteractionLogic(interactableMessage: Message) {
		const collector = interactableMessage.createMessageComponentCollector({
			time: config.queueButtonExpiryMilliseconds // Expires for memory reasons.
		});

		// This removes the buttons when the buttons expire as they no longer work.
		collector.on('end', async () => {
			await this.interaction.editReply({ components: [] });
		});

		collector.on('collect', async collected => {
			const newQueueLength = await this.audioInterface.queue.queueLength();
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
			const newEmbedFields = await this.getPageEmbedFieldData();
			const newEmbeds = await this.getPageMessageEmbed(newEmbedFields);
			await this.interaction.editReply({ embeds: [newEmbeds], components });
		});
	}

	async getPageMessageEmbed(embedFields: EmbedFieldData[]) {
		const queueLength = (await this.audioInterface?.queue.queueLength()) || 0;

		return new MessageEmbed()
			.setColor(config.embedSuccess as ColorResolvable)
			.setTitle(`📃 Current Queue`)
			.setDescription(
				`There ${queueLength === 1 ? 'is' : 'are'} ${queueLength} item${queueLength === 1 ? '' : 's'} in the queue.\nPage ${this.page}/${
					this.pageCount
				}`
			)
			.setFields(...embedFields);
	}

	createButtonsComponent() {
		const prevButton = new MessageButton().setCustomId('queue-navigate-prev').setLabel('<< Prev').setStyle('PRIMARY');
		const nextButton = new MessageButton().setCustomId('queue-navigate-next').setLabel('Next >>').setStyle('PRIMARY');
		const firstPageButton = new MessageButton().setCustomId('queue-navigate-start').setLabel('First page').setStyle('PRIMARY');
		const lastPageButton = new MessageButton().setCustomId('queue-navigate-last').setLabel('Last page').setStyle('PRIMARY');
		const buttons = new MessageActionRow();

		if (this.page > 2) buttons.addComponents(firstPageButton);
		if (this.page > 1) buttons.addComponents(prevButton);
		if (this.page < this.pageCount) buttons.addComponents(nextButton);
		if (this.page < this.pageCount - 1) buttons.addComponents(lastPageButton);

		const components = buttons.components.length ? [buttons] : undefined;
		return components;
	}

	async getPageEmbedFieldData() {
		const queue = await this.audioInterface.queue.queueGetMultiple(this.page);
		const videoDetailPromiseArray = queue.map(url => this.audioInterface?.getDetails(url));
		const videoDetails = (await Promise.all(videoDetailPromiseArray)) as YtdlVideoInfoResolved[];

		const embedFields: EmbedFieldData[] = videoDetails.map((videoDetails, index) => {
			const itemNumberOffset = (this.page - 1) * config.paginateMaxLength;
			const itemNumber = index + 1 + itemNumberOffset;
			const videoDetailsObj = videoDetails?.videoDetails;

			if (!videoDetailsObj?.title || !videoDetailsObj.description) {
				return {
					name: `${itemNumber}) 🚨 FAILED`,
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
}

export default queue;
