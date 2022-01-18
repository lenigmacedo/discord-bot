import { youtube } from '@googleapis/youtube';
import { YouTubeInterface } from 'bot-classes';
import { config } from 'bot-config';
import { Guild } from 'discord.js';
import { createClient } from 'redis';

/**
 * GLOBALS
 * Set values that should NOT be user changeable yet used throughout many parts of the code as reference.
 */
const globals = {
	redisClient: createClient({ url: `redis://${config.redisHost}:${config.redisPort}` }),
	numberToLocale: new Intl.NumberFormat(config.numberFormat),
	youtubeApi: youtube({ version: 'v3', auth: config.googleApiToken }),
	youtubePlayers: new Map<Guild['id'], YouTubeInterface>(),
	commandModules: new Map<string, any>() // Would be glad if someone could get a type that represents any class that implements a specific interface. I don't like using "any"!
};

globals.redisClient.connect();

export default globals;
