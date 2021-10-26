import { MessageComponentInteraction } from 'discord.js';

export type ButtonHandler = (event: MessageComponentInteraction) => void;
