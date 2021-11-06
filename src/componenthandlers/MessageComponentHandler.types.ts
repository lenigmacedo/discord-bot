import { CommandInteraction, MessageComponentInteraction } from 'discord.js';

export type MessageComponentHandler = (event: MessageComponentInteraction, initialInteraction?: CommandInteraction) => void;
