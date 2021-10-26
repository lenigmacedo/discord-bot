import { Awaitable, Collection, MessageComponentInteraction } from 'discord.js';
import { ButtonHandler } from '../../buttons/ButtonHandler.types';

const handleButtonEvent: (collected: Collection<string, MessageComponentInteraction>, reason: string) => Awaitable<void> = async interaction => {
	const message = interaction.first();

	if (!message) {
		return;
	}

	const { customId } = message;
	const buttonHandlerModule = await import(`bot-buttons/modules/${customId}`);
	const handler: ButtonHandler = buttonHandlerModule.default;
	handler(message);
};

export default handleButtonEvent;
