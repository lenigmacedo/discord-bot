import { DiscordGatewayAdapterCreator, joinVoiceChannel } from '@discordjs/voice';
import { config, ResponseEmojis } from 'bot-config';
import {
	CollectorFilter,
	CommandInteraction,
	GuildMember,
	InteractionReplyOptions,
	Message,
	MessageComponentInteraction,
	PermissionString
} from 'discord.js';
import path from 'path';

export class CommandInteractionHelper {
	protected interaction: CommandInteraction;
	protected invoked: Date; // A Date instance representing when this command was run.

	/**
	 * A toolbox for making interactions between the bot and the user easier.
	 *
	 * TIPS:
	 * - The methods in this class will throw if there is any problem. This is a way of halting the execution of the command.
	 * - Use the "oops" method in a catch block to inform the user of the error message and
	 */
	constructor(interaction: CommandInteraction) {
		this.interaction = interaction;
		this.invoked = new Date();
	}

	/**
	 * Initialise this instance by gathering the command handler and telling the Discord API the response has been received.
	 * @param ephemeral Hide the interactions and self-hide after a period of time.
	 */
	async init(ephemeral = true) {
		if (this.commandName) {
			await this.interaction.deferReply({ ephemeral });

			return this;
		}

		throw new Error('Unable to retrieve command name.');
	}

	get commandInteraction() {
		return this.interaction;
	}

	/**
	 * Get the Discord server this command was run in.
	 * This method will throw if a guild cannot be found.
	 */
	get guild() {
		if (this.interaction.guild) {
			return this.interaction.guild;
		}

		throw Error('This command can only be run in a server.');
	}

	/**
	 * Get the author of the slash command.
	 */
	get guildMember() {
		if (this.interaction.member instanceof GuildMember) {
			return this.interaction.member;
		}

		throw Error('Unable to retrieve guild member.');
	}

	get commandName() {
		if (this.interaction.isCommand()) {
			return this.interaction.commandName;
		}

		throw Error('Unable to fetch command name.');
	}

	/**
	 * Get the voice channel instance.
	 */
	get voiceChannel() {
		return this.guildMember.voice.channel;
	}

	/**
	 * Get the voice channel instance.
	 *
	 * WARNING: This method will throw an error if the requirements are not met. Otherwise, use voiceChannel instead!
	 */
	enforceVoiceChannel() {
		if (!this.voiceChannel) throw Error('You must be connected to a voice channel to continue.');
	}

	/**
	 * Prepend an emoji to the message.
	 * @param message The message to send.
	 * @param type The enum for the emoji.
	 */
	followUpEmoji(message: string | InteractionReplyOptions, type?: ResponseEmojis) {
		if (typeof message === 'string') {
			return this.interaction.followUp(`${type}  ${message}`);
		}

		message.content = `${type}  ${message.content}`;

		return this.interaction.followUp(message);
	}

	/**
	 * Edit the message with an emoji prepended to the message.
	 * @param message The message to send.
	 * @param type The enum for the emoji.
	 */
	editWithEmoji(message: string | InteractionReplyOptions, type: ResponseEmojis) {
		if (typeof message === 'string') {
			return this.interaction.editReply(`${type}  ${message}`);
		}

		message.content = `${type}  ${message.content}`;

		return this.interaction.editReply(message);
	}

	/**
	 * Join a Discord voice channel. Will throw if a user is not connected to one.
	 * @param id The channel ID (optional, connects to the one the user is connected to by default).
	 * @returns New voice connection instance.
	 */
	joinVoiceChannel(id?: string) {
		const adapterCreator = this.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator;

		if (!this.voiceChannel?.id) {
			throw Error('Voice channel ID could not be found.');
		}

		const connectionOptions = {
			guildId: this.guild.id,
			channelId: id || this.voiceChannel.id,
			adapterCreator
		};

		return joinVoiceChannel(connectionOptions);
	}

	/**
	 * Take an array of permissions, and find out if the user is authorised.
	 * @param requiredPermissions An array of Discord standard permissions.
	 */
	checkPermissions(requiredPermissions: PermissionString[]) {
		if (!(this.commandInteraction.member instanceof GuildMember)) return false;

		const permissions = this.commandInteraction.member.permissions.toArray();
		const foundPermissions = requiredPermissions.filter(required => permissions.includes(required));

		return foundPermissions.length === requiredPermissions.length;
	}

	/**
	 * Take an array of permissions, and find out if the user is authorised.
	 *
	 * WARNING: This method throws an error if the user is not authorised! Otherwise, use checkPermissions() instead.
	 * @param requiredPermissions An array of Discord standard permissions.
	 */
	enforcePermissions(requiredPermissions: PermissionString[]) {
		if (!this.checkPermissions(requiredPermissions)) {
			throw Error('You do not have permission to execute this command.');
		}
	}

	/**
	 * This method handles the events for interactive components from a bot's reply. This includes buttons and drop-down menus.
	 * It does some handy things for you:
	 *
	 * - Removes any event listeners after a certain period of time and deletes the components. The duration of this is defined in the config.
	 * - Prevents other people from interacting with the message you sent.
	 * - Runs the function exported in the 'componenthandlers' folder named the same as the component ID if the above criteria is met.
	 *
	 * @param msgWithComponents The bot's reply, i.e., the message you want to handle.
	 */
	componentInteractionHandler(msgWithComponents: Awaited<ReturnType<CommandInteraction['editReply']>>) {
		if (!(msgWithComponents instanceof Message) || !msgWithComponents.components.length) return;

		// This filter checks that the person who is interacting with the message is the one who sent the original message.
		const filter: CollectorFilter<[MessageComponentInteraction]> = messageComponentInteraction => {
			return messageComponentInteraction.user.id === this.commandInteraction.member?.user.id;
		};

		const collector = msgWithComponents.createMessageComponentCollector({
			max: 1,
			time: config.searchExpiryMilliseconds,
			filter
		});

		collector.on('end', async collected => {
			const message = collected.first();

			if (!message) {
				this.commandInteraction.editReply({ components: [] });
				return;
			}

			const handlersLocation = path.resolve('src', 'commands', 'componenthandlers', 'modules');
			const handlerModule = await import(`${handlersLocation}/${message.customId}`);
			handlerModule.default(message, this.commandInteraction);
		});
	}
}
