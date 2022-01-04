import { CommandInteractionHelper } from 'bot-classes';
import { config, ResponseEmojis } from 'bot-config';
import { CommandInteraction, PermissionString } from 'discord.js';

/**
 * This decorator wraps the command in a try/catch block to prevent most errors from crashing the process and sorts out permissions.
 * By default a user must have speak and read message history permissions to interact with the bot.
 */
export function command(options: CommandOptions = {}) {
	// target = The class itself.
	// propertyName = The string representaion of the method name.
	// descriptor = Properties that relate to the method this decorator is attached to.
	return function (target: any, propertyName: any, descriptor: any) {
		const method = descriptor.value;

		descriptor.value = async (commandInteraction: CommandInteraction) => {
			const {
				requires = config.minimumDefaultPermissions as PermissionString[],
				ephemeral = true,
				enforceVoiceConnection = false,
				enforceGuild = true
			} = options;
			const handler = await new CommandInteractionHelper(commandInteraction).init(ephemeral);

			try {
				// All checks below will throw if criteria is not met.
				if (enforceVoiceConnection) handler.enforceVoiceChannel();
				if (enforceGuild) handler.guild;
				if (requires) handler.enforcePermissions(requires);

				return await method.call(target, handler);
			} catch (error: any) {
				const trimmedMessage = error?.message?.trim(1500);
				const message = error.message ? trimmedMessage : 'There was a problem executing your request. The reason is unknown.';

				await handler.editWithEmoji(message, ResponseEmojis.Danger);
			}
		};
	};
}

interface CommandOptions {
	/**
	 * Which Discord permissions must the user have to run this command? All permissions must be satisfied.
	 */
	requires?: PermissionString[];

	/**
	 * If true the command will only be shown to the command author and will self-delete after a certain period of time.
	 */
	ephemeral?: boolean;

	/**
	 * Is this command only run in a guild?
	 */
	enforceGuild?: boolean;

	/**
	 * If true, the user must be connected to a voice channel to run the command.
	 */
	enforceVoiceConnection?: boolean;
}
