export abstract class YouTubeBase {
	private uri: URL;

	/**
	 * This half-abstract class aids the implementation of new YouTube features for code consistency.
	 * @param url The resource URL. Can be a playlist, video, or something else.
	 */
	constructor(url: string) {
		this.uri = new URL(url);
	}

	/**
	 * Gets the ID of the resource.
	 * Should throw if one cannot be found or that the ID is invalid.
	 */
	abstract get id(): string;

	/**
	 * Gets the resource URL.
	 */
	get url() {
		return this.uri.toString();
	}

	/**
	 * Returns the URL instance, containing useful methods to work with URLs.
	 */
	get urlInstance() {
		return this.uri;
	}
}
