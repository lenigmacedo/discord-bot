import { ResponseEmojis } from 'bot-config';
import { CommandInteraction, Guild, GuildMember, InteractionReplyOptions } from 'discord.js';
import { CommandHandler } from '../../commands/CommandHandler.types';

/**
 * A toolbox for making interactions between the bot and the user easy.
 */
export default class Command {
	protected interaction: CommandInteraction;
	protected invoked: Date; // A Date instance representing when this command was run.
	protected handler?: CommandHandler;

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
			const commandModule = await import(`bot-commands/modules/${this.commandName}`);
			this.handler = commandModule.default;

			await this.interaction.deferReply({ ephemeral });

			return this;
		}

		throw new Error('Unable to retrieve command name.');
	}

	get commandInteraction() {
		return this.interaction;
	}

	get guild() {
		if (this.interaction.guild instanceof Guild) {
			return this.interaction.guild;
		}

		throw Error('This command can only be run in a Guild.');
	}

	get author() {
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
	 * Get the voice channel instance. Will throw an error if it does not exist.
	 */
	get voiceChannel() {
		if (this.author.voice?.channel) {
			return this.author.voice.channel;
		}

		throw Error('Must be connected to a voice channel to continue!');
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

	editWithEmoji(message: string | InteractionReplyOptions, type: ResponseEmojis) {
		if (typeof message === 'string') {
			return this.interaction.followUp(`${type}  ${message}`);
		}

		message.content = `${type}  ${message.content}`;

		return this.interaction.editReply(message);
	}
}
