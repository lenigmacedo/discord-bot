import config from 'bot-config';
import { findYouTubeUrls } from 'bot-functions';

const resultLength = config.paginateMaxLength;

/**
 * VALID SEARCH QUERY
 */

test('Test a search query that definitely has results', async () => {
	expect(await findYouTubeUrls('rick astley')).toHaveLength(resultLength);
});

test('Test a search query that definitely has results', async () => {
	expect(await findYouTubeUrls('rick astley')).toBeInstanceOf(Array);
});

test('Test a search query that definitely has results', async () => {
	const results = await findYouTubeUrls('rick astley');
	expect(results.find(result => typeof result !== 'string')).toBe(undefined);
});

/**
 * INVALID SEARCH QUERY
 */

test('Test a search query with no results', async () => {
	expect(await findYouTubeUrls('alsiugdaspiugdpusaugdpiuyasgdpuyasgfpduygaspdiyugaspiudgfapsiugdpasiugdpasug')).toStrictEqual([]);
});

test('Search query with null', async () => {
	//@ts-ignore
	expect(await findYouTubeUrls(null)).toStrictEqual([]);
});

test('Search query with null', async () => {
	//@ts-ignore
	expect(await findYouTubeUrls(false)).toStrictEqual([]);
});

test('Search query with empty array', async () => {
	//@ts-ignore
	expect(await findYouTubeUrls([])).toStrictEqual([]);
});
