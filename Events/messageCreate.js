module.exports = {
  name: 'messageCreate',
  
  async execute(message, client) {
    if (message.author.bot || !message.content.startsWith(client.config.prefix)) return;
    
    const args = message.content.slice(client.config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    
    const command = client.commands.get(commandName) || 
                   client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    
    if (!command) return;
    
    try {
      if (command.permissions) {
        if (!message.member.permissions.has(command.permissions)) {
          return message.reply(`❌ You don't have permission to use this command! Required: \`${command.permissions}\``);
        }
      }
      
      if (command.ownerOnly && message.author.id !== client.config.ownerId) {
        return message.reply('❌ This command is only available to the bot owner!');
      }
      
      await command.execute(message, args, client);
      
    } catch (error) {
      console.error(`Error executing command ${commandName}:`, error);
      
      try {
        await message.reply('❌ There was an error executing this command!');
      } catch (replyError) {
        console.error('Error sending error message:', replyError);
      }
    }
  }
};