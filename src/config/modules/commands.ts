import { SlashCommandBuilder } from '@discordjs/builders';

const commands = [
	new SlashCommandBuilder()
		.setName('play')
		.setDescription('If the bot is not busy, you can play something. Then it will continue the queue.')
		.addStringOption(option => option.setName('youtube-url').setDescription('The YouTube video URL.').setRequired(true)),
	new SlashCommandBuilder().setName('pause').setDescription('Pause the bot from playing audio.'),
	new SlashCommandBuilder().setName('resume').setDescription('Resume the bot if it is paused.'),
	new SlashCommandBuilder().setName('queue').setDescription('Get a list of all the items in the queue.'),
	new SlashCommandBuilder().setName('start').setDescription('Start the queue if the bot is not already playing.'),
	new SlashCommandBuilder()
		.setName('enqueue')
		.setDescription('Add a YouTube video to the end of the queue.')
		.addStringOption(option => option.setName('youtube-url').setDescription('The YouTube video URL.').setRequired(true)),
	new SlashCommandBuilder().setName('stop').setDescription('Stop the bot from playing?')
];

export default commands.map(builder => builder.toJSON());
