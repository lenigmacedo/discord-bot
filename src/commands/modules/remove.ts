import { YouTubeInterface } from 'bot-classes';
import { getCommandIntraction } from 'bot-functions';
import { CommandHandler } from '../CommandHandler.types';

const remove: CommandHandler = async initialInteraction => {
	try {
		const commandInteraction = getCommandIntraction(initialInteraction);

		if (!commandInteraction) {
			return;
		}

		const { interaction, guild, guildMember } = commandInteraction;
		await interaction.deferReply();

		if (!guildMember.voice.channel) {
			await interaction.editReply('🚨 You must be connected to a voice channel for me to modify the queue!');
			return;
		}

		const audioInterface = YouTubeInterface.getInterfaceForGuild(guild);
		const itemToDeleteIndex = interaction.options.getInteger('item-number', true);
		const removedDetails = await audioInterface.getItemInfo(itemToDeleteIndex - 1);

		if (!removedDetails) {
			interaction.editReply('🚨 Unable to identify the queue item. Did you specify the right number?');
			return;
		}

		const removed = await audioInterface.queue.queueDelete(itemToDeleteIndex - 1);

		if (removed) {
			await interaction.editReply(`✅ Removed \`${removedDetails.videoDetails.title}\`.`);
		} else {
			await interaction.editReply('🚨 There was a problem removing the item.');
		}
	} catch (error) {
		console.error(error);
	}
};

export default remove;
