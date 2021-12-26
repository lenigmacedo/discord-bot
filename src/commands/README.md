# Commands

This folder contains command definitions. When someone sends a slash command, the corresponding script in commands/modules will run.

Make sure that you have registered the new slash command in config/modules/commands.ts first, then create a new file in commands/modules that matches the name of the command exactly. The bot will automatically use the new file you have created.

All commands must implement the abstract class `BaseCommand` to ensure the new UserInteraction definition meets all rules for it to be valid. Also ensure you do not export it as a default module.
