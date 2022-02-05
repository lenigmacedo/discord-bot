import { numWrap } from '..';

describe('numWrap function (wrapping numbers from a defined range)', () => {
	it('Expected usage, not to wrap', () => {
		const wrapped = numWrap(1, 2, 3);

		expect(wrapped).toBe(0);
	});

	it('Expected usage, will wrap', () => {
		const wrapped = numWrap(1, 400, 3);

		expect(wrapped).toBe(2);
	});
});
