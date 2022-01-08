import { CommandInteractionHelper } from 'bot-classes';
import { ColourScheme, config } from 'bot-config';
import { numClamp } from 'bot-functions';
import { ColorResolvable, Message, MessageActionRow, MessageButton, MessageButtonStyleResolvable, MessageEmbed } from 'discord.js';

export class QueueReader {
	private title: (page: number, pageCount: number, itemCount: number) => string;
	private caption: (page: number, pageCount: number, itemCount: number) => string;

	private pageBuilder: (page: number) => Promise<QueueReaderItems[]>;
	private getQueueLength: () => Promise<number>;

	private handler: CommandInteractionHelper;
	private pageCount = 0;
	private itemCount = 0;
	private page = 0;

	private firstColour: MessageButtonStyleResolvable;
	private prevColour: MessageButtonStyleResolvable;
	private nextColour: MessageButtonStyleResolvable;
	private lastColour: MessageButtonStyleResolvable;
	private firstLabel: string;
	private nextLabel: string;
	private prevLabel: string;
	private lastLabel: string;

	private components?: MessageActionRow[];
	private embed: MessageEmbed;

	/**
	 * A useful class that generates a paginated list!
	 *
	 * It uses Discord button components for page navigation.
	 *
	 * @param options
	 */
	constructor(options: QueueReaderOptions) {
		this.title = options.title;
		this.caption = options.caption;
		this.handler = options.handler;
		this.page = options.page;
		this.pageCount = 0;
		this.itemCount = 0;
		this.pageBuilder = options.pageBuilder;
		this.getQueueLength = options.getQueueLength;

		this.firstColour = options.firstColour || 'SUCCESS';
		this.prevColour = options.prevColour || 'PRIMARY';
		this.nextColour = options.nextColour || 'PRIMARY';
		this.lastColour = options.lastColour || 'SUCCESS';
		this.firstLabel = '1';
		this.nextLabel = options.nextLabel || '>>';
		this.prevLabel = options.prevLabel || '<<';
		this.lastLabel = '1';

		this.components;
		this.embed = new MessageEmbed();
	}

	/**
	 * Refresh the page count as the queue length changes.
	 */
	private async refreshCounts() {
		const queueLength = await this.getQueueLength();

		this.pageCount = Math.ceil(queueLength / config.paginateMaxLength);
		this.page = numClamp(this.page, 1, this.pageCount);
		this.lastLabel = this.pageCount.toString();
		this.itemCount = queueLength;
	}

	/**
	 * Create Discord message button components.
	 * This will take the context of the page count, and current page to determine which buttons should appear.
	 * For example, page 1 wouldn't need to display a previous button component.
	 */
	private async refreshComponents() {
		const prevButton = new MessageButton().setCustomId('queue-navigate-prev').setLabel(this.prevLabel).setStyle(this.prevColour);
		const nextButton = new MessageButton().setCustomId('queue-navigate-next').setLabel(this.nextLabel).setStyle(this.nextColour);
		const firstPageButton = new MessageButton().setCustomId('queue-navigate-start').setLabel(this.firstLabel).setStyle(this.firstColour);
		const lastPageButton = new MessageButton().setCustomId('queue-navigate-last').setLabel(this.lastLabel).setStyle(this.lastColour);

		const components = new MessageActionRow();

		if (this.page > 2) components.addComponents(firstPageButton);
		if (this.page > 1) components.addComponents(prevButton);
		if (this.page < this.pageCount) components.addComponents(nextButton);
		if (this.page < this.pageCount - 1) components.addComponents(lastPageButton);

		this.components = components.components.length ? [components] : undefined;
	}

	/**
	 * Using a pre-written page builder function, generate the list that will be displayed in the reader.
	 * This does not create any interactive components, just content.
	 */
	private async refreshEmbed() {
		const builtPage = await this.pageBuilder(this.page);

		this.embed = new MessageEmbed()
			.setColor(ColourScheme.Success as ColorResolvable)
			.setTitle(this.title(this.page, this.pageCount, this.itemCount))
			.setDescription(this.caption(this.page, this.pageCount, this.itemCount))
			.setFields(...builtPage);
	}

	async run(initialMessage = 'Fetching the items...') {
		const { commandInteraction } = this.handler;
		if (!commandInteraction.deferred && !commandInteraction.replied) await commandInteraction.deferReply();

		const botReply = await commandInteraction.editReply(initialMessage);

		if (!(botReply instanceof Message)) return;

		const collector = botReply.createMessageComponentCollector({
			time: config.queueButtonExpiryMilliseconds // Expires for memory reasons.
		});

		// This removes the buttons when the buttons expire as they no longer work.
		collector.on('end', async () => {
			await commandInteraction.editReply({ components: [] });
		});

		collector.on('collect', async collected => {
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

			await collected.deferUpdate(); // Without this, the interaction will show as failed for the user.
			await this.sendMessage();
		});

		await this.sendMessage();
	}

	private async sendMessage() {
		await this.refreshCounts();
		await this.refreshComponents();
		await this.refreshEmbed();

		await this.handler.commandInteraction.editReply({
			content: null,
			embeds: [this.embed],
			components: this.components
		});
	}
}

type QueueReaderItems = {
	name: string;
	value: string;
};

type QueueReaderOptions = {
	/**
	 * A function that must return a string.
	 * It being a function allows you to create dynamic titles using the three supplied values:
	 *
	 * - Page
	 * - Page count
	 * - Item count
	 */
	title: (page?: number, pageCount?: number, itemCount?: number) => string;

	/**
	 * A function that must return a string.
	 * It being a function allows you to create dynamic titles using the three supplied values:
	 *
	 * - Page
	 * - Page count
	 * - Item count
	 */
	caption: (page?: number, pageCount?: number, itemCount?: number) => string;

	/**
	 * An instance of CommandInteractionHelper, provided in bot-classes.
	 */
	handler: CommandInteractionHelper;

	/**
	 * What initial page should the queue reader start at?
	 * Will auto-clamp if the page length it too small or too big.
	 */
	page: number;

	/**
	 * This function will be used to generate pages. This will be repeatedly invoked as the user navigates backwards and forwards.
	 */
	pageBuilder: (page: number) => Promise<QueueReaderItems[]>;

	/**
	 * This function will be used to identify the queue length. This will be repeatedly invoked as the user navigates backwards and forwards.
	 * The queue may change as items are played, so simply passing in a number is not adequate.
	 */
	getQueueLength: () => Promise<number>;

	/**
	 * Label for the button that navigates the user to the first page.
	 */
	firstLabel?: string;

	/**
	 * Label for the button that navigates the user to the last page.
	 */
	lastLabel?: string;

	/**
	 * Label for the button that navigates the user to the previous page.
	 */
	prevLabel?: string;

	/**
	 * Label for the button that navigates the user to the next page.
	 */
	nextLabel?: string;

	/**
	 * Colour of the button that navigates the user to the first page.
	 */
	firstColour?: MessageButtonStyleResolvable;

	/**
	 * Colour of the button that navigates the user to the last page.
	 */
	lastColour?: MessageButtonStyleResolvable;

	/**
	 * Colour of the button that navigates the user to the previous page.
	 */
	prevColour?: MessageButtonStyleResolvable;

	/**
	 * Colour of the button that navigates the user to the next page.
	 */
	nextColour?: MessageButtonStyleResolvable;
};
