# Config

This folder contains the bot's config along with other variables that need accessing globally throughout the bot.

By default, 'config.ts' is exported. This file contains constants that must not change.

In config/modules you can find "commands.ts" and "globals.ts". Commands is where new slash commands are registered, and globals is where you can find variables that need global access and can be modified anytime at runtime (unlike config).
