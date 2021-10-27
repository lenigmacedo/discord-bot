import { AudioInterface } from 'bot-classes';
import { handleMessageComponentEvent } from 'bot-functions';
import { CollectorFilter, GuildMember, Message, MessageActionRow, MessageButton, MessageComponentInteraction } from 'discord.js';
import { CommandHandler } from '../CommandHandler.types';

const clear: CommandHandler = async interaction => {
	try {
		const guildMember = interaction.member;

		if (!interaction?.guild?.id || !(guildMember instanceof GuildMember)) {
			return;
		}

		const voiceChannel = guildMember.voice.channel;

		if (!voiceChannel) {
			await interaction.reply('You must be connected to a voice channel for me to clear the queue!');
			return;
		}

		const audioInterface = AudioInterface.getInterfaceForGuild(interaction.guild);

		if ((await audioInterface.queueGetLength()) > 0) {
			const actionRow = new MessageActionRow().addComponents(
				new MessageButton().setCustomId('queue-clear-accept').setLabel('Delete!').setStyle('DANGER'),
				new MessageButton().setCustomId('queue-clear-decline').setLabel('Leave it!').setStyle('SUCCESS')
			);

			// Unfortunately, this is used as an initial reply. Only "editReply" returns Promise<Message>. "reply" return Promise<void>
			await interaction.reply({ content: 'Loading...', ephemeral: true });
			const queueLength = await audioInterface.queueGetLength();

			const botMessage = await interaction.editReply({
				content: `Are you sure you want to delete the ENTIRE queue? ${queueLength} item(s) will be removed if you do!`,
				components: [actionRow]
			});

			if (!(botMessage instanceof Message)) return;

			const filter: CollectorFilter<[MessageComponentInteraction]> = messageComponentInteraction => {
				if (messageComponentInteraction.user.id === interaction.member?.user.id) return true;
				return false;
			};

			const collector = botMessage.createMessageComponentCollector({
				max: 1,
				filter
			});

			collector.on('end', handleMessageComponentEvent);
		} else {
			await interaction.reply({ content: 'The queue seems to be empty.', ephemeral: true });
		}
	} catch (error) {
		console.error(error);
	}
};

export default clear;
