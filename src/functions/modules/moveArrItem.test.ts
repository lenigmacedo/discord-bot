import { moveArrItem } from '..';

describe('moveArr function (move array items)', () => {
	it('Expected usage', () => {
		const alteredArr = moveArrItem<string>(['1', '2', '3'], 2, 0);

		expect(alteredArr).toStrictEqual(['3', '1', '2']);
		expect(alteredArr).not.toStrictEqual(['3', '2', '1']);
		expect(alteredArr).toHaveLength(3);
	});

	it('Arguments out of range', () => {
		const alteredArr = moveArrItem<string>(['1', '2', '3'], 3, -1);

		expect(alteredArr).toStrictEqual(['3', '1', '2']); // Out of range values are clamped
		expect(alteredArr).not.toStrictEqual(['3', '2', '1']);
		expect(alteredArr).toHaveLength(3);
	});
});
