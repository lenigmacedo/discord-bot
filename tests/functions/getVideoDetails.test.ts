import { getVideoDetails } from 'bot-functions';

const shortUrl = 'https://youtu.be/';
const longUrl = 'https://www.youtube.com/watch?v=';

/**
 * INVALID PARAMS
 */

test('Test false URL', async () => {
	expect(await getVideoDetails('https://google.com')).toBe(null);
});

test('Test false with v search param', async () => {
	expect(await getVideoDetails('https://google.com?v=VpXLX0xF2rM')).toBe(null);
});

test('Test blank', async () => {
	expect(await getVideoDetails('')).toBe(null);
});

test('Test bool', async () => {
	// @ts-ignore
	expect(await getVideoDetails(false)).toBe(null);
});

test('Test null', async () => {
	// @ts-ignore
	expect(await getVideoDetails(null)).toBe(null);
});

test('Test undefined', async () => {
	// @ts-ignore
	expect(await getVideoDetails()).toBe(null);
});

/**
 * PUBLIC VIDEO
 */

test('Test getting video details', async () => {
	expect(await getVideoDetails(longUrl + 'VpXLX0xF2rM')).toHaveProperty('videoDetails');
});

test('Test kids video via short URL', async () => {
	expect(await getVideoDetails(shortUrl + 'VpXLX0xF2rM')).toHaveProperty('videoDetails');
});

test('Test video ID', async () => {
	expect(await getVideoDetails('VpXLX0xF2rM')).toHaveProperty('videoDetails');
});

/**
 * INVALID ID
 */

test('Test getting video details with invalid id', async () => {
	expect(await getVideoDetails(longUrl + 'VpyLX0iF3rz')).toBe(null);
});

test('Test kids video via short URL with invalid id', async () => {
	expect(await getVideoDetails(shortUrl + 'VpyLX0iF3rz')).toBe(null);
});

test('Test video ID with invalid id', async () => {
	expect(await getVideoDetails('VpyLX0iF3rz')).toBe(null);
});

/**
 * KIDS VIDEOS
 */

test('Test kids video', async () => {
	expect(await getVideoDetails(longUrl + 'PcN4A9fixGA')).toHaveProperty('videoDetails');
});

test('Test kids video via short URL', async () => {
	expect(await getVideoDetails(shortUrl + 'PcN4A9fixGA')).toHaveProperty('videoDetails');
});

test('Test kids video via ID', async () => {
	expect(await getVideoDetails('PcN4A9fixGA')).toHaveProperty('videoDetails');
});

/**
 * AGE RESTRICTED VIDEO
 */

test('Test age restricted video', async () => {
	expect(await getVideoDetails(longUrl + 'IDzA-XehfAI')).toBe(null);
});

test('Test age restricted via short url', async () => {
	expect(await getVideoDetails(shortUrl + 'IDzA-XehfAI')).toBe(null);
});

test('Test age restricted via ID', async () => {
	expect(await getVideoDetails('IDzA-XehfAI')).toBe(null);
});
