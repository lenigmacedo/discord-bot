# Commands

This folder contains command definitions. When someone sends a slash command, the corresponding script in commands/modules will run.

All commands must implement the abstract class `BaseCommand` to ensure the new command definition meets all rules for it to be valid. Also ensure you do not export it as a default module. Each method is explained with a comment in BaseCommand.ts so you are 100% clear on how to get a new command running (I hope!)
