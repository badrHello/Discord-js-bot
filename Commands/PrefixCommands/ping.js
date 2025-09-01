const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'ping',
  description: 'Check the bot\'s ping',
  usage: '!ping',
  category: 'Utility',
  
  async execute(message, args, client) {
    const sent = await message.reply('🏓 Pinging...');
    
    const embed = new EmbedBuilder()
      .setColor(client.config.colors.success)
      .setTitle('🏓 Pong!')
      .addFields(
        { name: 'Bot Latency', value: `${sent.createdTimestamp - message.createdTimestamp}ms`, inline: true },
        { name: 'API Latency', value: `${Math.round(client.ws.ping)}ms`, inline: true }
      )
      .setTimestamp()
      .setFooter({ 
        text: `Requested by ${message.author.tag}`, 
        iconURL: message.author.displayAvatarURL() 
      });
    
    await sent.edit({ content: '', embeds: [embed] });
  }
};