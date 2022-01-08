/**
 * Clamp a number to a minimum and maximum value.
 */
export function numClamp(number: number, minimum: number, maximum: number) {
	return Math.min(Math.max(number, minimum), maximum);
}
