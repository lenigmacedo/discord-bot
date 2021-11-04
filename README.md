# Discord YouTube Bot 2 (beta)

This is the new Discord bot that will soon supersede the old v1 discord bot at https://github.com/jack3898/discord-youtube-bot.

A lot of music bots are private and proprietary (and lock features behind a paywall), and additionally, YouTube have been targeting large Discord bots for takedown. As this bot is open source, you can use it assured YouTube can't do anything to bring it down as you have the code on your own server and is not commercially available.

## Features

| Command   | What it does                                                               |
| --------- | -------------------------------------------------------------------------- |
| /play     | Play a video with a URL.                                                   |
| /pause    | Pause the current playing audio.                                           |
| /volume   | Set the audio playback volume of the bot.                                  |
| /resume   | Unpause the bot.                                                           |
| /enqueue  | Add a video to the queue.                                                  |
| /playlist | Bulk import a playlist into the queue.                                     |
| /queue    | Get a list of items in the queue.                                          |
| /start    | Start playing the queue whilst the bot is inactive.                        |
| /stop     | Stop the playing of audio and disconnect the bot.                          |
| /skip     | Skip the current item in the queue. Disconnects if the queue is empty.     |
| /search   | Search and pick a video to add to the queue using an interactive dropdown. |
| /clear    | Purge the queue of all of its contents.                                    |
| /remove   | With a queue number, remove a specific item from the queue.                |

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
3. Done!

## Plans

This bot is in continuous development, and is only in its beginning phase. It currently does not have any additional features over the previous bot so my first plan is to make that so.

Then I will continue to make the bot more versatile and powerful! Not yet sure what those features may be!

## Licensed under the GNU GPL v3

Discord YouTube Bot, an open source Discord YouTube Bot.
Copyright (C) 2021 Jack Wright

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.
