module.exports = {
  name: 'interactionCreate',
  
  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;
    
    const command = client.slashCommands.get(interaction.commandName);
    
    if (!command) {
      return interaction.reply({
        content: '❌ This command no longer exists!',
        ephemeral: true
      });
    }
    
    try {
      if (command.permissions) {
        if (!interaction.member.permissions.has(command.permissions)) {
          return interaction.reply({
            content: `❌ You don't have permission to use this command! Required: \`${command.permissions}\``,
            ephemeral: true
          });
        }
      }
      
      if (command.ownerOnly && interaction.user.id !== client.config.ownerId) {
        return interaction.reply({
          content: '❌ This command is only available to the bot owner!',
          ephemeral: true
        });
      }
      
      await command.execute(interaction, client);
      
    } catch (error) {
      console.error(`Error executing slash command ${interaction.commandName}:`, error);
      
      const errorMessage = '❌ There was an error executing this command!';
      
      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: errorMessage, ephemeral: true });
        } else {
          await interaction.reply({ content: errorMessage, ephemeral: true });
        }
      } catch (replyError) {
        console.error('Error sending error message:', replyError);
      }
    }
  }
};