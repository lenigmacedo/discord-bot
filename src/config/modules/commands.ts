import { SlashCommandBuilder } from '@discordjs/builders';

const commands = [
	new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!'),
	new SlashCommandBuilder()
		.setName('play')
		.setDescription('Play an audio clip!')
		.addStringOption(option => option.setName('url').setDescription('The YouTube video URL').setRequired(true))
];

export default commands.map(builder => builder.toJSON());
