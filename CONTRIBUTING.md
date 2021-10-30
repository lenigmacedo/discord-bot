# Contributing

As of writing, I know this repository has only me working on it but this will come in handy for anyone who feels like contributing and for my own future reference.

This small guide will give you the do's of contributing. I don't know so much about the don'ts, I will review on a case-by-case basis.

## Do

- You must pad (adding empty line on both the top and bottom) to the following:
  - Blocks - `{}`.
  - **Multi-line** expressions - `()`.
  - **Multi-line** chained method calls - `method1().method2().method3()` if not an array item (example of such exception is in `/src/config/modules/commands.ts`).
- Everything else needs to not be spaced at all.
- Follow the rules in the .prettierrc.yml file. If you use Prettier, this file should work automatically. If your config ignores this config, I will not merge your PR.
- All variables EXCEPT Redis methods should be camelCased. Redis methods should be capitalised.

## Getting started

Ensure `DEV_GUILD_ID` is set in conjunction with the other mandatory environment variables in the ".env" file.

Ensure you have an Redis database running with the default port. The best way to do this is to spin up a basic Docker container.

You can run the development bot with `npm run dev`.

## TIP

If you use VSCode, then this repository comes with a debugger configuration for you to use.

The debugger tool lets you freeze code (even with async operations) to analyse the state of the bot, and add custom logpoints to completely replace the need for `console.log` to debug. It's a massively underutilised feature and you won't regret it!

To get started press `F5`. Assuming you have set up your environment variables in the ".env" file, that's it. The bot will run in development mode and you don't even need to type `npm run dev` anymore! To see console logs, go to the built in "Debug console" instead of the terminal.
