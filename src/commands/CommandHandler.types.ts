import { CommandInteraction } from 'discord.js';

export type CommandHandler = (event: CommandInteraction) => void;
