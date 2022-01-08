/**
 * A really simple function that shuffles an array. Returns a new array, and does not modify the original.
 * @param array The array you want to perform the operation on.
 */
export function shuffleArr<TArr>(array: TArr[]) {
	const newArr = [...array];

	for (let index = newArr.length - 1; index > 0; index--) {
		const randFromIndex = Math.floor(Math.random() * (index + 1));
		const arrItemByIndex = newArr[index];
		// I could use destructuring assignment, however, it is slower.
		newArr[index] = newArr[randFromIndex];
		newArr[randFromIndex] = arrItemByIndex;
	}

	return newArr;
}
