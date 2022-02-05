import { shuffleArr } from '..';

describe('shuffleArr function', () => {
	it('Expected usage', () => {
		const initialArr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		const shuffledArr = shuffleArr(initialArr);

		expect(shuffledArr).not.toStrictEqual(initialArr);
		expect(initialArr).toStrictEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]); // Ensuring shuffleArr isn't mutating the original array
		expect(shuffledArr).toHaveLength(10);
	});
});
