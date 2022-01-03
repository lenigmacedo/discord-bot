# Discord YouTube Bot 2 (beta)

This is the new Discord bot that supersedes the old v1 discord bot at https://github.com/jack3898/discord-youtube-bot.

A lot of music bots are private and proprietary (and lock features behind a paywall), and additionally, YouTube have been targeting large Discord bots for takedown. As this bot is open source, you can use it assured YouTube can't do anything to bring it down as you have the code on your own server and is not commercially available.

## Features

| Command   | What it does                                                                                    |
| --------- | ----------------------------------------------------------------------------------------------- |
| /play     | Play something straight away with a URL or search query.                                        |
| /pause    | Pause the current playing audio.                                                                |
| /resume   | Unpause the bot.                                                                                |
| /volume   | Set the audio playback volume of the bot. Affects all listeners.                                |
| /enqueue  | Add a video to the queue.                                                                       |
| /playlist | Bulk import a playlist into the queue.                                                          |
| /queue    | Get a list of items in the queue.                                                               |
| /shuffle  | Shuffle the queue.                                                                              |
| /move     | Move an item in the queue from its current position to a new one.                               |
| /clean    | Clean the queue by removing duplicates. The bot will tell you how many duplicates were removed. |
| /start    | Start playing the queue whilst the bot is inactive.                                             |
| /stop     | Stop the playing of audio and disconnect the bot.                                               |
| /skip     | Skip the current item in the queue. Disconnects if the queue is empty.                          |
| /search   | Search and pick a video to add to the queue using an interactive dropdown.                      |
| /clear    | Purge the queue of all of its contents.                                                         |
| /remove   | With a queue number, remove a specific item from the queue.                                     |
| /loop     | Loop the queue.                                                                                 |

TIP: Typing "/" in the Discord text channel will give you automatic suggestions of commands and will auto-complete options as you type the command!

## Technologies

This bot is proudly powered with Node.js, TypeScript & Redis.
It also uses the newest Discord.js v13 library which leverages the latest Discord v9 bot API!

- Node.js v16/v17
- Discord.js v13
- TypeScript
- Redis (using the new v4 npm library)

Because of Discord.js v13 using the very new Discord v9 API, the bot leverages **slash commands** and **interactive message components**!

Advantages of v13:

- `!help` is not needed. Typing "/" will give you a list of commands natively in Discord.
- Commands can be autocompleted and give you a description of each argument as you go.
- Discord type checks your arguments and enforces required arguments so its much harder to make a mistake typing a command.
- This bot has interactive buttons and dropdown lists! In the chat!
- No conflict with other bots that are also using slash commands. This bot will ALWAYS use a forward slash to initiate a command.

## Setup for production

1. Install Docker, Docker Compose and Git for your own OS. Linux is highly recommended as a platform to host this bot on. Windows (Server) will work, but you will be missing out on a lot of performance.
2. Navigate into a directory you want to place the project directory in using `cd`.
3. Clone this repository using Git: `git clone https://github.com/jack3898/discord-youtube-bot-2`.
4. Rename `.env-example` to `.env`.
   1. Note: Using .env is not a requirement. You can create environment variables in your system instead.
5. Fill in the requirements for the environment variables.

   1. `DISCORD_TOKEN` & `CLIENT_ID` - Which you can create/find https://discord.com/developers. This bot also requires the `applications.commands` permission otherwise you will not be able to use slash commands.
   2. `DEV_GUILD_ID` - For developers only. You do not need to fill this in if you are not a developer.
   3. `GOOGLE_API_TOKEN` - Which you can create in the Google Cloud platform https://console.cloud.google.com/apis/credentials.
      1. You also need to enable **YouTube Data API v3** in the Google Cloud platform.

6. Run `docker-compose up --build --detach`. This will build the bot, and run it.

## How to update the bot

1. Pull the latest code from this repository with `git pull`. This will not override your .env file, but it is a good idea to check the .env-example file to ensure you meet the latest environment variable requirements.
2. Rebuild the Docker containers with `docker-compose up --build`.
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
