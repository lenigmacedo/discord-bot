import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteractionHelper } from "../../classes";
import { BaseCommand } from "../BaseCommand";
import { command } from "../decorators/command";

export default class Say implements BaseCommand {

	register() {
		return new SlashCommandBuilder()
			.setName('say')
			.setDescription('Bot will say something')
			.addStringOption(option => option.setName('text').setRequired(true).setDescription('Text to say'));
	}


    @command({ ephemeral: false, enforceVoiceConnection: true})
	runner(handler: CommandInteractionHelper) {
		const text = handler.commandInteraction.options.getString('text');
		handler.commandInteraction.editReply(`${text}`);
	}
}
