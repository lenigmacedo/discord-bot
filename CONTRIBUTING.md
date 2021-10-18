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
