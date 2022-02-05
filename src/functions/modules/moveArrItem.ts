import { numClamp } from '..';

/**
 * Move an item in an array.
 * @param array The array you want to perform the operation on.
 * @param from Index (starting from 0) of the initial item position.
 * @param to Index (again, starting from 0) of the new position.
 * @returns A new altered array.
 */
export function moveArrItem<TArr>(array: TArr[], from: number, to: number) {
	from = numClamp(from, 0, array.length - 1);
	to = numClamp(to, 0, array.length - 1);

	const copiedArr: TArr[] = [...array];
	copiedArr.splice(to, 0, copiedArr.splice(from, 1)[0]);
	return copiedArr;
}
