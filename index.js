const { Client, GatewayIntentBits, Collection } = require('discord.js');
const config = require('./config');
const { loadCommands } = require('./Handler/commandHandler');
const { loadEvents } = require('./Handler/eventHandler');

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// Create collections for commands
client.commands = new Collection();
client.slashCommands = new Collection();
client.config = config;

// Load commands and events
loadCommands(client);
loadEvents(client);

// Error handling
process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', error => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

// Login to Discord
client.login(config.token).catch(error => {
  console.error('Failed to login:', error);
  process.exit(1);
});