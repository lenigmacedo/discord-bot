import { numClamp } from '..';

describe('numClamp function (clamp numbers to a certain range)', () => {
	it('Expected usage, numbers out of range', () => {
		const clamped = numClamp(10, 0, 5);

		expect(clamped).toBe(5);
	});

	it('Negative numbers', () => {
		const clamped = numClamp(-15, -5, -10);

		expect(clamped).toBe(-10);
	});

	it('Expected usage, number in range', () => {
		const clamped = numClamp(3, 0, 5);

		expect(clamped).toBe(3);
	});
});
