# Discord YouTube Bot 2 (beta)

This is the new Discord bot that will soon supersede the old v1 discord bot at https://github.com/jack3898/discord-youtube-bot.

A lot of music bots are private and proprietary (and lock features behind a paywall), and additionally, YouTube have been targeting large Discord bots for takedown. As this bot is open source, you can use it assured YouTube can't do anything to bring it down as you have the code on your own server and is not commercially available.

## Features

| Command  | What it does                                                           |
| -------- | ---------------------------------------------------------------------- |
| /play    | Play a YouTube video with a URL                                        |
| /pause   | Pause the current playing audio.                                       |
| /resume  | Unpause the bot.                                                       |
| /enqueue | Add a YouTube video to the queue                                       |
| /queue   | Get a list of items in the queue.                                      |
| /start   | Start playing the queue whilst the bot is inactive.                    |
| /stop    | Stop the playing of audio and disconnect the bot.                      |
| /skip    | Skip the current item in the queue. Disconnects if the queue is empty. |
| /search  | Search YouTube and pick a video to add to the queue using reactions.   |
| /clear   | Purge the queue of all of its contents.                                |

TIP: Typing "/" in the Discord text channel will give you automatic suggestions of commands and will auto-complete options as you type the command!

## Try the demo bot
You can invite a demo bot to your server that I host free of charge. Do keep in mind that:
- I reserve the right to restart this bot at any time to apply updates so audio may suddenly cut out in the evenings (British time).
- This bot is not capable of running on hundreds of servers.
- It should be treated as a demo, and to not be used seriously. I encourage you to download the bot and host your own.

https://discord.com/api/oauth2/authorize?client_id=743546623421841456&permissions=2184301632&scope=bot%20applications.commands

## Technologies

This bot is proudly powered with Node.js, TypeScript & Redis.
It also uses the all-new Discord.js v13 library which leverages the latest Discord v9 bot API!
This means that many audio problems with the original bot have been fixed and the bot leverages **slash commands**!

- Node.js
- Discord.js v13
- Discord bot API v9
- TypeScript
- Redis (in-memory database for queue management)

## Setup for production

1. Install Docker, Docker Compose and Git for your own OS.
2. `cd` into a directory you want to place the project directory in.
3. Clone this repository using Git: `git clone https://github.com/jack3898/discord-youtube-bot-2`
4. Rename `.env-example` to `.env`.
5. In the empty .env, fill in the keys.

   1. `DISCORD_TOKEN` & `CLIENT_ID` - Which you can create/find https://discord.com/developers. This bot also requires the `applications.commands` permission otherwise you will not be able to use slash commands.
   2. `DEV_GUILD_ID` - For developers only. You do not need to fill this in if you are not a developer.
   3. `GOOGLE_API_TOKEN` - Which you can create in the Google Cloud platform https://console.cloud.google.com/apis/credentials.
      1. You also need to enable **YouTube Data API v3** in the Google Cloud platform.

6. Run `docker-compose up --build --detach`. This will build the bot, and run it.

## How to update the bot

1. Pull the latest code from this repository with `git pull`. This will not override your .env file, but it should be a good idea to check that the .env-example file has not changed.
2. Rebuild the Docker containers with `docker-compose up --build --detach`.
3. Done! Also, as this bot uses Redis all queues will be retained.

If you have any issues, try and backup your .env file, run `git reset --hard FETCH_HEAD` (which ensures your files match this GitHub repository exactly, like `git pull` but extreme), put your .env file back. Then run `docker compose up --build`.

## Plans

This bot is in continuous development, and is only in its beginning phase. It currently does not have any additional features over the previous bot so my first plan is to make that so.

Then I will continue to make the bot more versatile and powerful! Not yet sure what those features may be!

## License

Copyright (C) 2021 Jack Wright

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED “AS IS” AND ISC DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL ISC BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
