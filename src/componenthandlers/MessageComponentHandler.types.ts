import { MessageComponentInteraction } from 'discord.js';

export type MessageComponentHandler = (event: MessageComponentInteraction) => void;
