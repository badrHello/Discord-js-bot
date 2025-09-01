require('dotenv').config();

// Validate required environment variables
if (!process.env.BOT_TOKEN || process.env.BOT_TOKEN === 'your_actual_bot_token_here') {
  console.error('❌ BOT_TOKEN is not set in .env file!');
  console.error('Please add your Discord bot token to the .env file');
  process.exit(1);
}

if (!process.env.CLIENT_ID || process.env.CLIENT_ID === 'your_actual_client_id_here') {
  console.error('❌ CLIENT_ID is not set in .env file');
  console.error('Please add your Discord application client ID to the .env file');
  process.exit(1);
}
module.exports = {
  // Bot Configuration
  token: process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE',
  clientId: process.env.CLIENT_ID || 'YOUR_CLIENT_ID_HERE',
  guildId: process.env.GUILD_ID || 'YOUR_GUILD_ID_HERE', // Optional: for guild-specific commands
  
  // Bot Settings
  prefix: process.env.PREFIX || '!',
  
  // Colors (for embeds)
  colors: {
    primary: '#5865F2',
    success: '#57F287',
    warning: '#FEE75C',
    error: '#ED4245',
    info: '#5865F2'
  },
  // Bot Owner ID
  ownerId: process.env.OWNER_ID || '',
  
  // Development Mode
  development: process.env.DEVELOPMENT === 'true'
};