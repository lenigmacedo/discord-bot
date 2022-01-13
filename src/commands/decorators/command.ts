import { CmdRequirementError, CommandInteractionHelper } from 'bot-classes';
import { config, ResponseEmojis } from 'bot-config';
import { CommandInteraction, PermissionString } from 'discord.js';

/**
 * This decorator does some very handy things, it:
 *
 * - Wraps the command in a try/catch block to prevent most errors from crashing the process.
 * 	- Please use CmdRequirementError class when throwing errors to do with user-related faults. This will reduce console error pollution.
 * - Sorts out permissions.
 * - Lets you define "must-haves" before the command is even run.
 * - Will automatically invoke subcommands if found in this object. The name of the subcommand must match the name of the method in this object.
 * 	- Of course, reserved JavaScript keywords cannot be used. :( You might need to get creative.
 * - Can help you out with permissions.
 * By default a user must have speak permissions to interact with the bot but that can be overridden.
 */
export function command(options: CommandOptions = {}) {
	// target = The class itself.
	// propertyName = The string representaion of the method name.
	// descriptor = Properties that relate to the method this decorator is attached to.
	return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
		const method = descriptor.value;

		descriptor.value = async (commandInteraction: CommandInteraction) => {
			const {
				requires = config.minimumDefaultPermissions as PermissionString[],
				ephemeral = true,
				enforceVoiceConnection = false,
				enforceGuild = true,
				runnerSubcommandName = ''
			} = options;

			const handler = await new CommandInteractionHelper(commandInteraction).init(ephemeral);

			try {
				// All checks below will throw if criteria is not met.
				if (enforceVoiceConnection) handler.voiceChannel;
				if (enforceGuild) handler.guild;
				if (requires) handler.checkPermissions(requires);

				const subcommand = handler.commandInteraction.options.getSubcommand(false);
				if (subcommand && runnerSubcommandName !== subcommand) {
					return await target[subcommand].call(target, handler);
				}

				return await method.call(target, handler);
			} catch (error: any) {
				if (error instanceof CmdRequirementError) {
					const trimmedMessage = error?.message?.substring(0, 1500);
					const message = error.message ? trimmedMessage : 'There was a problem executing your request. The reason is unknown.';
					await handler.respondWithEmoji(message, ResponseEmojis.Danger);
				} else {
					console.error(error);
					await handler.respondWithEmoji(
						'There was a critical error whilst handling your request. Please report this to your admin.',
						ResponseEmojis.Danger
					);
				}
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
	 *
	 * Default value is `true`.
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

	/**
	 * In Discord, you can either have subcommands or not.
	 *
	 * This means that if your command implements subcommands, this option lets you specify the subcommand
	 * to take place of this runner.
	 *
	 * With the way the commands system works, which is auto-invoke the method in this class via subcommand name,
	 * it would mean that the runner will never run because it doesn't represent a subcommand, only a normal command.
	 * Once a subcommand has been implemented, the root command is not an option for users.
	 * This is because the methods of the command class are automatically executed by subcommand name.
	 */
	runnerSubcommandName?: string;
}
