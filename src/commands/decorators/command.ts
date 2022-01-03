import { UserInteraction } from 'bot-classes';
import { ResponseEmojis } from 'bot-config';
import { CommandInteraction, GuildMember, PermissionString } from 'discord.js';

/**
 * This decorator wraps the command in a try/catch block to prevent most errors from crashing the process and sorts out permissions.
 * By default a user must have speak and read message history permissions to interact with the bot.
 */
export function command(options: CommandOptions = {}) {
	// target = The class itself.
	// propertyName = The string representaion of the method name.
	// descriptor = Properties that relate to the method this decorator is attached to.
	return function (target: any, propertyName: any, descriptor: any) {
		const method: Function = descriptor.value;

		descriptor.value = async (commandInteraction: CommandInteraction) => {
			if (commandInteraction instanceof CommandInteraction && commandInteraction.member instanceof GuildMember) {
				const { requires = ['SPEAK', 'READ_MESSAGE_HISTORY'], ephemeral = true, enforceVoiceConnection = false } = options;
				const handler = await new UserInteraction(commandInteraction).init(ephemeral);

				try {
					const permissions = commandInteraction.member.permissions.toArray();
					const foundPermissions = requires.filter(required => permissions.includes(required));

					if (enforceVoiceConnection && !handler.voiceChannel) {
						handler.editWithEmoji('This command requires you to be connected to a voice channel.', ResponseEmojis.Danger);
						return;
					}

					if (foundPermissions.length === requires.length) return await method.call(target, handler);

					await handler.editWithEmoji('You are not permitted to run this command.', ResponseEmojis.Danger);
				} catch (error: any) {
					const trimmedMessage = error?.message?.trim(1500);
					const message = error.message ? trimmedMessage : 'There was a problem executing your request. The reason is unknown.';

					await handler.editWithEmoji(message, ResponseEmojis.Danger);
				}
			} else {
				console.error('Invalid interaction type! It should be a command interaction in a guild.');
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
	 * If true, the user must be connected to a voice channel to run the command.
	 */
	enforceVoiceConnection?: boolean;
}
