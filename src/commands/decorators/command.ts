import { ResponseEmojis } from 'bot-config';
import { CommandInteraction, GuildMember, PermissionString } from 'discord.js';

/**
 * This decorator wraps the command in a try/catch block to prevent most errors from crashing the process and sorts out permissions.
 * By default a user must have speak and read message history permissions to interact with the bot.
 *
 * @param target The class itself.
 * @param propertyName The string representaion of the method name.
 * @param descriptor Properties that relate to the method this decorator is attached to.
 */
export function command(options: CommandOptions = {}) {
	return function (target: any, methodName: any, descriptor: any) {
		const method: Function = descriptor.value;

		descriptor.value = async (commandInteraction: CommandInteraction) => {
			if (commandInteraction instanceof CommandInteraction && commandInteraction.member instanceof GuildMember) {
				try {
					const { requires = ['SPEAK', 'READ_MESSAGE_HISTORY'] } = options;
					const permissions = commandInteraction.member.permissions.toArray();
					const foundPermissions = requires.filter(required => permissions.includes(required));

					if (foundPermissions.length === requires.length) {
						return await method.call(target, commandInteraction);
					} else {
						await messageResponder(`${ResponseEmojis.Danger}  You are not permitted to run this command.`);
					}
				} catch (error: any) {
					const trimmedMessage = `${ResponseEmojis.Danger}  ${error?.message?.trim(1500)}`;
					await messageResponder(error.message ? trimmedMessage : 'There was a problem executing your request. The reason is unknown.');
				}
			} else {
				console.error('Invalid interaction type! It should be a command interaction in a guild.');
			}

			// A simple function that responds to messages. This is not part of a decorator signature!
			async function messageResponder(message: string) {
				commandInteraction.replied || commandInteraction.deferred
					? await commandInteraction.editReply(message)
					: await commandInteraction.reply(`${message}`);
			}
		};
	};
}

interface CommandOptions {
	requires?: PermissionString[];
}
