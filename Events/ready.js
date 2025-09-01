const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  
  async execute(client) {
    console.log(`✅ ${client.user.tag} is now online!`);
    
    client.user.setActivity(`${client.config.prefix}help`, {
      type: ActivityType.Watching
    });
    
    if (client.slashCommands.size > 0) {
      try {
        console.log('🔄 Registering slash commands...');
        
        const commandsData = [];
        client.slashCommands.forEach(command => {
          commandsData.push(command.data.toJSON());
        });
        
        await client.application.commands.set(commandsData);
        console.log(`✅ Successfully registered ${commandsData.length} slash commands globally`);
      } catch (error) {
        console.error('❌ Error registering slash commands:', error);
      }
    }
  }
};