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

1. Install Docker, Docker Compose and Git.
   1. Docker & Docker Compose
      1. For Windows and Mac this can be achieved with Docker Desktop: https://www.docker.com/products/docker-desktop.
      2. For Linux Debian run: `sudo apt update -y && sudo apt upgrade -y && sudo apt install docker.io`.
      3. As I can't give a guide for every distro, you may need to research the installation of Docker for yourself.
   2. Git
      1. For Windows, Max and Linux: https://git-scm.com/downloads
      2. For Linux Debian (CLI): `sudo apt update -y && sudo apt upgrade -y && sudo apt install git -y`
2. `cd` into a directory you want to place the project in.
3. Clone this repository using Git: `git clone https://github.com/jack3898/discord-youtube-bot-2`
4. Rename `.env-example` and call it `.env`.
5. In the .env file you created, fill in the following:

   1. `DISCORD_TOKEN` & `CLIENT_ID` - Which you can create at https://discord.com/developers.
      1. Make sure the bot has the following permissions:
         1. bot
         2. applications.commands
   2. `GOOGLE_API_TOKEN` - Which you can create in the Google Cloud platform https://console.cloud.google.com/apis/credentials.
      1. You also need to enable **YouTube Data API v3** in the Google Cloud platform.

6. Run `docker-compose up --build`. This will build the bot, and run it.
7. Verify that the bot runs with no errors.
8. If the bot runs well, press `CTRL`+`C` to cancel the running docker instances and re-run step 6 with the `--detach` flag included. This will run the containers as a service, allowing you to close any shell sessions you have open. If any of the containers crash, they will be automatically restarted.
9. Congratulations! It's deployed!

## How to update the bot

1. Pull the latest code from this repository with `git pull`. This will not override your .env file, but it should be a good idea to check that the .env-example file has not changed.
2. Rebuild the Docker containers with `docker-compose up --build --detach`.
3. Done!

## Plans

This bot is in continuous development, and is only in its beginning phase. It currently does not have any additional features over the previous bot so my first plan is to make that so.

Then I will continue to make the bot more versatile and powerful! Not yet sure what those features may be!

## License

Copyright (C) 2021 Jack Wright

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED “AS IS” AND ISC DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL ISC BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
