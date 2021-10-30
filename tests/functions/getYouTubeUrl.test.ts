import { getYouTubeUrl } from 'bot-functions';

describe('Get video url with ids', () => {
	test('Get video id: valid id', () => {
		expect(getYouTubeUrl('IJDvjTRuCWo')).toEqual('https://www.youtube.com/watch?v=IJDvjTRuCWo');
	});

	test('Get video id: invalid id', () => {
		expect(getYouTubeUrl('hellothisisinvalid')).toBe(null);
	});

	test('Get video id: invalid id', () => {
		expect(getYouTubeUrl('thisisinval')).toEqual('https://www.youtube.com/watch?v=thisisinval');
	});
});

describe('Get video id with urls', () => {
	test('Get video id: valid url', () => {
		expect(getYouTubeUrl('https://www.youtube.com/watch?v=IJDvjTRuCWo')).toEqual('https://www.youtube.com/watch?v=IJDvjTRuCWo');
	});

	test('Get video id: invalid url', () => {
		expect(getYouTubeUrl('https://duckduckgo.com/')).toBe(null);
	});

	test('Get video id: invalid url type', () => {
		// @ts-ignore
		expect(getYouTubeUrl(false)).toBe(null);
	});
});
