# Commands

This folder contains command definitions. When someone sends a slash command, the corresponding script in commands/modules will run.

Make sure that you have registered the new slash command in config/modules/commands.ts first, then create a new file in commands/modules that matches the name of the command exactly. The bot will automatically use the new file you have created.

Then, export a default function and give it the "CommandHandler" type to make sure it is set up properly.
