export class CmdRequirementError extends Error {
	/**
	 * This error is for when a user is trying to use a command when there is a reason they should not.
	 *
	 * This error is best used with a method covered under the @command decorator.
	 *
	 * E.g: User must be connected to a voice channel.
	 *
	 * @param message
	 */
	constructor(message: string) {
		super(message);
		this.name = this.constructor.name;
	}
}
