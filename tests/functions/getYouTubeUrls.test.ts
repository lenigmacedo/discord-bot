import config from 'bot-config';
import { getYouTubeUrls } from 'bot-functions';

const resultLength = config.paginateMaxLength;

describe('Search urls: definitely has results', () => {
	test('Test a search query that definitely has results', async () => {
		expect(await getYouTubeUrls('rick astley')).toHaveLength(resultLength);
	});

	test('Test a search query that definitely has results', async () => {
		expect(await getYouTubeUrls('rick astley')).toBeInstanceOf(Array);
	});

	test('Test a search query that definitely has results', async () => {
		const results = await getYouTubeUrls('rick astley');
		expect(results.find(result => typeof result !== 'string')).toBe(undefined);
	});
});

describe('Search urls: Invalid search query', () => {
	test('Test a search query with no results', async () => {
		expect(await getYouTubeUrls('alsiugdaspiugdpusaugdpiuyasgdpuyasgfpduygaspdiyugaspiudgfapsiugdpasiugdpasug')).toStrictEqual([]);
	});

	test('Search query with null', async () => {
		//@ts-ignore
		expect(await getYouTubeUrls(null)).toStrictEqual([]);
	});

	test('Search query with null', async () => {
		//@ts-ignore
		expect(await getYouTubeUrls(false)).toStrictEqual([]);
	});

	test('Search query with empty array', async () => {
		//@ts-ignore
		expect(await getYouTubeUrls([])).toStrictEqual([]);
	});
});
