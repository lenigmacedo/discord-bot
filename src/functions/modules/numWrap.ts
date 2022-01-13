/**
 * A very simple function that increments a number, but if too big, wraps back to the start.
 *
 * Useful for managing queue systems, where you want to go back to the start of the queue when you get to the end.
 */
export function numWrap(initial: number, amount: number, max: number) {
	return (initial + amount) % max;
}
