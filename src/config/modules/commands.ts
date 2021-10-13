import { SlashCommandBuilder } from '@discordjs/builders';

const commands = [
	new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!'),
	new SlashCommandBuilder().setName('play').setDescription('Play an audio clip!')
];

export default commands.map(builder => builder.toJSON());
