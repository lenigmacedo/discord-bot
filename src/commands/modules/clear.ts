import { AudioInterface } from 'bot-classes';
import initOneTimeUseComponentInteraction from 'bot-functions/modules/initOneTimeUseComponentInteraction';
import { GuildMember, Message, MessageActionRow, MessageButton } from 'discord.js';
import { CommandHandler } from '../CommandHandler.types';

const clear: CommandHandler = async interaction => {
	try {
		const guildMember = interaction.member;

		if (!interaction?.guild?.id || !(guildMember instanceof GuildMember)) {
			return;
		}

		const voiceChannel = guildMember.voice.channel;

		if (!voiceChannel) {
			await interaction.reply('🚨 You must be connected to a voice channel for me to clear the queue!');
			return;
		}

		const audioInterface = AudioInterface.getInterfaceForGuild(interaction.guild);

		if ((await audioInterface.queueGetLength()) > 0) {
			const actionRow = new MessageActionRow().addComponents(
				new MessageButton().setCustomId('queue-clear-accept').setLabel('Delete!').setStyle('DANGER'),
				new MessageButton().setCustomId('queue-clear-decline').setLabel('Leave it!').setStyle('SUCCESS')
			);

			await interaction.deferReply({ ephemeral: true });
			const queueLength = await audioInterface.queueGetLength();

			const botMessage = await interaction.editReply({
				content: `ℹ️ Are you sure you want to delete the ENTIRE queue? ${queueLength} item(s) will be removed if you do!`,
				components: [actionRow]
			});

			if (!(botMessage instanceof Message)) {
				return;
			}

			initOneTimeUseComponentInteraction(botMessage, interaction);
		} else {
			await interaction.reply({ content: 'ℹ️ The queue seems to be empty.', ephemeral: true });
		}
	} catch (error) {
		console.error(error);
	}
};

export default clear;
