import { SlashCommandBuilder } from '@discordjs/builders';

const commands = [
	new SlashCommandBuilder()
		.setName('play')
		.setDescription('Play an audio clip! If the bot is already playing something this command will not take priority.')
		.addStringOption(option => option.setName('youtube-url').setDescription('The YouTube video URL.').setRequired(true)),
	new SlashCommandBuilder().setName('pause').setDescription('Pause the bot from playing audio.'),
	new SlashCommandBuilder().setName('resume').setDescription('Resume the bot if it is paused.'),
	new SlashCommandBuilder()
		.setName('queue')
		.setDescription('Get a list of all the items in the queue.')
		.addBooleanOption(option => option.setName('run-now').setDescription("If the bot isn't currently playing, start playing the queue now?")),
	new SlashCommandBuilder()
		.setName('enqueue')
		.setDescription('Add a YouTube video to the end of the queue.')
		.addStringOption(option => option.setName('youtube-url').setDescription('The YouTube video URL.').setRequired(true))
];

export default commands.map(builder => builder.toJSON());
