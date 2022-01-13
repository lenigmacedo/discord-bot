export class CmdRequirementError extends Error {
	/**
	 * Throw an error related to a problem processing a command.
	 *
	 * Notes:
	 * - When thrown under the @command decorator, the error message will be relayed to the user and there will be no console log.
	 * - When a normal error is thrown under the @command decorator, a generic pre-written message will be relayed to the user and there will be a console log.
	 *
	 * @param message The problem with the user's command.
	 */
	constructor(message: string) {
		super(message);
		this.name = this.constructor.name;
	}
}
