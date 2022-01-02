import { ResponseEmojis } from 'bot-config';
import { CommandInteraction } from 'discord.js';

/**
 * Catch any errors that happen in the BaseCommand runner method and reply to the user saying there was a problem with the error message.
 * @param target The class itself.
 * @param propertyName The string representaion of the method name.
 * @param descriptor Properties that relate to the method this decorator is attached to.
 */
export function catchable(target: any, methodName: any, descriptor: any) {
	const method: Function = descriptor.value;

	descriptor.value = async (commandInteraction: CommandInteraction) => {
		if (commandInteraction instanceof CommandInteraction) {
			try {
				return await method.call(target, commandInteraction);
			} catch (error: any) {
				const trimmedMessage = `${ResponseEmojis.Danger}  ${error?.message?.trim(1500)}`;
				const message = error.message ? trimmedMessage : 'There was a problem executing your request. The reason is unknown.';
				commandInteraction.replied || commandInteraction.deferred
					? await commandInteraction.editReply(message)
					: await commandInteraction.reply(`${message}`);
			}
		} else {
			console.error('Invalid interaction type! It should be a command interaction.');
		}
	};
}
