import { DiscordGatewayAdapterCreator, joinVoiceChannel } from '@discordjs/voice';
import { ColourScheme, config, ResponseEmojis } from 'bot-config';
import {
	CollectorFilter,
	CommandInteraction,
	Guild,
	GuildMember,
	InteractionReplyOptions,
	Message,
	MessageComponentInteraction,
	MessageEmbed,
	PermissionString,
	VoiceChannel
} from 'discord.js';
import path from 'path';
import { CmdRequirementError } from '..';

export class CommandInteractionHelper {
	protected interaction: CommandInteraction;
	protected invoked: Date; // A Date instance representing when this command was run.

	/**
	 * A helper class to make utilising the CommandInteraction instance a little easier.
	 *
	 * @param interaction The discord.js CommandInteraction instance.
	 */
	constructor(interaction: CommandInteraction) {
		this.interaction = interaction;
		this.invoked = new Date();
	}

	/**
	 * Initialise this instance by gathering the command handler and telling the Discord API the response has been received.
	 *
	 * @param ephemeral Hide the interactions and self-hide after a period of time.
	 * @returns Promise<CommandInteractionHelper>
	 */
	async init(ephemeral = true) {
		if (this.commandName) {
			await this.interaction.deferReply({ ephemeral });
			return this;
		}

		throw new CmdRequirementError('Unable to retrieve command name.');
	}

	/**
	 * Get the original command interaction instance associated with this helper.
	 *
	 * @returns CommandInteraction
	 */
	get commandInteraction() {
		return this.interaction;
	}

	/**
	 * Get the guild instance.
	 *
	 * @throws CmdRequirementError if a guild cannot be found.
	 * @returns Guild
	 */
	get guild() {
		if (this.interaction.guild instanceof Guild) {
			return this.interaction.guild;
		}

		throw new CmdRequirementError('This command can only be run in a server.');
	}

	/**
	 * Get the guild member.
	 *
	 * @throws CmdRequirementError if a guild member cannot be found.
	 * @returns GuildMember
	 */
	get guildMember() {
		if (this.interaction.member instanceof GuildMember) {
			return this.interaction.member;
		}

		throw new CmdRequirementError('Unable to retrieve guild member.');
	}

	/**
	 * Get the command name.
	 *
	 * @returns string A string representation of the command name.
	 */
	get commandName() {
		if (this.interaction.isCommand() && typeof this.interaction?.commandName === 'string') {
			return this.interaction.commandName;
		}

		throw new CmdRequirementError('Unable to fetch command name.');
	}

	/**
	 * Get the voice channel.
	 *
	 * @returns VoiceChannel
	 */
	get voiceChannel() {
		if (this.guildMember.voice.channel instanceof VoiceChannel) {
			return this.guildMember.voice.channel;
		}

		throw new CmdRequirementError('Unable to retrieve voice channel.');
	}

	/**
	 * A standard response embed message that looks nicer than a normal text message.
	 *
	 * Will remove any embeds with its own.
	 *
	 * @param message The message to send.
	 * @param type The enum for the emoji.
	 * @returns Promise<APIMessage | Message<boolean>>
	 */
	respondWithEmoji(message: string | InteractionReplyOptions, emoji: ResponseEmojis, type: 'followUp' | 'editReply' = 'editReply') {
		const messageObject: InteractionReplyOptions = typeof message === 'string' ? { content: message } : message;
		const { Danger, Success } = ColourScheme;
		const colour = emoji === ResponseEmojis.Danger ? Danger : Success;

		messageObject.embeds = [
			new MessageEmbed()
				.setTitle(emoji)
				.setDescription(messageObject.content || '')
				.setColor(colour)
		];

		messageObject.content = undefined; // Content is now in the above embed.

		return this.interaction[type]({ ...messageObject });
	}

	/**
	 * Join a Discord voice channel.
	 *
	 * @param id The channel ID (optional, auto-detects otherwise).
	 * @returns VoiceConnection
	 */
	joinVoiceChannel(id?: string) {
		const adapterCreator = this.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator;

		const connectionOptions = {
			guildId: this.guild.id,
			channelId: id || this.voiceChannel.id,
			adapterCreator
		};

		return joinVoiceChannel(connectionOptions);
	}

	/**
	 * Take an array of permissions, and find out if the user is authorised.
	 *
	 * @param requiredPermissions An array of Discord standard permissions.
	 * @throws CmdRequirementError if the user is not permitted.
	 */
	checkPermissions(requiredPermissions: PermissionString[]) {
		const permissions = this.guildMember.permissions.toArray();
		const foundPermissions = requiredPermissions.filter(required => permissions.includes(required));
		const permitted = foundPermissions.length === requiredPermissions.length;

		if (permitted) return true;

		throw new CmdRequirementError('You do not have permission to execute this command.');
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
	 * @todo This method is prone to event listener leaks. Needs fixing.
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
