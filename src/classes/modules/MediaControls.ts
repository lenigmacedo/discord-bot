import { CommandInteractionHelper } from 'bot-classes';
import { ResponseEmojis } from 'bot-config';
import {
	CacheType,
	CollectorFilter,
	Guild,
	InteractionCollector,
	Message,
	MessageActionRow,
	MessageButton,
	MessageComponentInteraction,
	MessageEmbed
} from 'discord.js';
import EventEmitter from 'events';
import { TypedEmitter } from 'tiny-typed-emitter';

export class MediaControls {
	private static instances = new Map<string, MediaControls>(); // One instance per guild.

	private handler: CommandInteractionHelper;
	private components?: MessageActionRow;
	private embeds: MessageEmbed | null = null;
	private eventEmitter = new EventEmitter() as ControlsEvents;
	private latestComponentCollector?: InteractionCollector<MessageComponentInteraction<CacheType>>;
	private contentFunction?: () => Promise<MediaControlsContent | null>;

	private constructor(handler: CommandInteractionHelper, externalEvents?: (getCurrentHandler: () => CommandInteractionHelper) => void) {
		this.handler = handler;
		externalEvents?.(() => this.getHandler());
	}

	/**
	 * This class powers an interactive media control center through a message.
	 * This method will return an existing instance if one already exists.
	 *
	 * @param guild The guild to create an instance for. Returns an existing instance if one already exists.
	 * @param handler The CommandInteractionHelper instance.
	 * @param externalEvents A function that you may use to register any long-term events. This function will run ONCE when this instance is constructed for the first time.
	 * @returns MediaControls
	 */
	static fromGuild(guild: Guild, handler: CommandInteractionHelper, externalEvents?: (getCurrentHandler: () => CommandInteractionHelper) => void) {
		if (!MediaControls.instances.has(guild.id)) {
			MediaControls.instances.set(guild.id, new this(handler, externalEvents));
		}

		const instance = MediaControls.instances.get(guild.id) as MediaControls;
		instance.updateHandler(handler);
		return instance;
	}

	get events() {
		return this.eventEmitter;
	}

	/**
	 * Clear all event lisneters for this guild.
	 *
	 * This will remove event pollution for a guild.
	 * Without this, event listeners for buttons and button actions will remain active.
	 * This is because event listeners for this instance persist between command invokations.
	 *
	 * Use this before you attach event listeners!
	 */
	clearEvents() {
		this.eventEmitter.removeAllListeners();
		this.latestComponentCollector?.removeAllListeners();
	}

	/**
	 * This is an important function that will be invoked to generate new pages as events happen.
	 *
	 * @returns null
	 */
	addContentFunction(contentFunction: ContentFunction) {
		this.contentFunction = async () => {
			return (await contentFunction()) || null;
		};
	}

	/**
	 * Refresh all messages with media controls assigned to them.
	 * This method will run everytime someone invokes a command or an event happens that requires the controls to be updated.
	 */
	async start() {
		this.components = this.createMediaControls();
		this.embeds = await this.createMessageEmbed();

		if (!this.embeds) {
			await this.handler.respondWithEmoji('There is nothing in the queue!', ResponseEmojis.Info);
			return;
		}

		const message = await this.handler.commandInteraction.editReply({
			embeds: [this.embeds],
			components: [this.components]
		});

		if (!(message instanceof Message)) return;

		const collectorFilter: CollectorFilter<MessageComponentInteraction[]> = async componentInteraction => {
			await componentInteraction.deferUpdate();
			return componentInteraction.user.id === this.handler.commandInteraction.user.id;
		};

		// As a new set of components and a new message is created for each interaction, max lets it expire after 1 use.
		this.latestComponentCollector = message
			.createMessageComponentCollector({
				filter: collectorFilter
			})
			.on('collect', async collected => {
				switch (collected.customId) {
					case 'resume':
						this.events.emit('resume', this);
						await this.refreshContent();
						break;
					case 'pause':
						this.events.emit('pause', this);
						await this.refreshContent();
						break;
					case 'skip':
						this.events.emit('next', this);
						await this.refreshContent();
						break;
					case 'stop':
						this.events.emit('stop', this);
						break;
				}
			});
	}

	/**
	 * Update content, this avoids creating new components and event listeners for no reason.
	 */
	async refreshContent() {
		this.embeds = await this.createMessageEmbed();
		const embeds = this.embeds ? [this.embeds] : undefined;

		if (!embeds) {
			await this.handler.respondWithEmoji({ content: 'The queue is now empty.', components: [], embeds: [] }, ResponseEmojis.Info);
			return;
		}

		await this.handler.commandInteraction.editReply({ embeds });
	}

	/**
	 * Reassign a new CommandInteractionHelper instance to this instance.
	 *
	 * @param handler The instance of CommandInteractionHelper.
	 */
	private updateHandler(handler: CommandInteractionHelper) {
		this.handler = handler;
	}

	/**
	 * Get the CommandInteractionHelper instance from this instance.
	 *
	 * @returns CommandInteractionHelper
	 */
	private getHandler() {
		return this.handler;
	}

	/**
	 * Create a message embed preset from the result of the contentFunction.
	 *
	 * @returns Promise<MessageEmbed | null>
	 */
	private async createMessageEmbed() {
		const content = await this.contentFunction?.();

		if (!content) return null;

		const { title, author, description, likes, thumbnailUrl, views } = content;

		return new MessageEmbed()
			.setTitle(title)
			.setDescription(description.substring(0, 200))
			.addField('Channel', author)
			.addField('Likes', likes)
			.addField('Views', views)
			.setThumbnail(thumbnailUrl);
	}

	private createMediaControls() {
		return new MessageActionRow().addComponents(
			new MessageButton().setCustomId('resume').setLabel('>').setStyle('SUCCESS'),
			new MessageButton().setCustomId('pause').setLabel('||').setStyle('SECONDARY'),
			new MessageButton().setCustomId('skip').setLabel('>>').setStyle('PRIMARY'),
			new MessageButton().setCustomId('stop').setLabel('[]').setStyle('DANGER')
		);
	}
}

type ControlsEvents = TypedEmitter<{
	next: (mediaControls: MediaControls) => void;
	stop: (mediaControls: MediaControls) => void;
	pause: (mediaControls: MediaControls) => void;
	resume: (mediaControls: MediaControls) => void;
}>;

type ContentFunction = () => Promise<MediaControlsContent | null>;

export type MediaControlsContent = {
	title: string;
	description: string;
	likes: string;
	views: string;
	author: string;
	thumbnailUrl: string;
};
