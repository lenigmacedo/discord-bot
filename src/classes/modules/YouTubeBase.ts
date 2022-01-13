import { CmdRequirementError } from '..';

export abstract class YouTubeBase {
	private uri: URL;

	/**
	 * A base class to help with the implementation of YouTube feature classes.
	 *
	 * @param url The YouTube resource URL related to the context of the derived class.
	 */
	constructor(url: string) {
		try {
			this.uri = new URL(url);
		} catch (error) {
			throw new CmdRequirementError('The URL for the YouTube resource is invalid.');
		}
	}

	/**
	 * Get the ID of the resource.
	 *
	 * @returns string
	 */
	abstract get id(): string;

	/**
	 * Gets the resource URL.
	 *
	 * @returns string
	 */
	get url() {
		return this.uri.toString();
	}

	/**
	 * Returns the URL instance, containing useful methods to work with URLs.
	 *
	 * @returns URL
	 */
	get urlInstance() {
		return this.uri;
	}
}
