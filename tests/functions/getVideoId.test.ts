import { getYouTubeVideoId } from 'bot-functions';

describe('Get video id with ids', () => {
	test('Get video id: valid id', () => {
		expect(getYouTubeVideoId('IJDvjTRuCWo')).toEqual('IJDvjTRuCWo');
	});

	test('Get video id: invalid id', () => {
		expect(getYouTubeVideoId('hellothisisinvalid')).toBe(null);
	});

	test('Get video id: invalid id', () => {
		expect(getYouTubeVideoId('thisisinval')).toEqual('thisisinval');
	});
});

describe('Get video id with urls', () => {
	test('Get video id: valid url', () => {
		expect(getYouTubeVideoId('https://www.youtube.com/watch?v=IJDvjTRuCWo')).toEqual('IJDvjTRuCWo');
	});

	test('Get video id: invalid url', () => {
		expect(getYouTubeVideoId('https://duckduckgo.com/')).toBe(null);
	});

	test('Get video id: invalid url type', () => {
		// @ts-ignore
		expect(getYouTubeVideoId(false)).toBe(null);
	});
});
