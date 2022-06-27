import { youtube } from '@googleapis/youtube';
import { YouTubeInterface } from '../../classes';
import { config } from '../../config';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import { Guild } from 'discord.js';
import { createClient } from 'redis';

/**
 * GLOBALS
 *
 * You should not need to touch these unless you are a developer. These values are services/stores the bot requires to function.
 */
export const globals = {
	redisClient: createClient({ url: `redis://${config.redisHost}:${config.redisPort}` }),
	numberToLocale: new Intl.NumberFormat(config.numberFormat),
	youtubeApi: youtube({ version: 'v3', auth: config.googleApiToken }),
	youtubePlayers: new Map<Guild['id'], YouTubeInterface>(),
	commandModules: new Map<string, any>() // Would be glad if someone could get a type that represents any class that implements a specific interface. I don't like using "any"!
};

globals.redisClient.connect();
