# Component Handlers

This folder contains component handlers found in bot messages. For example, a dropdown menu or button. A handler is the script you want to perform when a message component interaction occurs.

To create a new component handler make sure that the name of the handler in componenthandlers/modules exactly matches the component's "setCustomId" property. Then, you can call "initOneTimeUseComponentInteraction" in your command definition, which will register your new handler for one-time use and have checks in place to ensure the author of the original message is the one using the interaction.
