import config from 'bot-config';

const ready = () => {
	console.log(`Bot logged in!`);
	console.log(`Environment: ${config.environment}`);
	console.log(`Redis connected on port ${config.redisPort} with hostname "${config.redisHost}".`);
};

export default ready;
