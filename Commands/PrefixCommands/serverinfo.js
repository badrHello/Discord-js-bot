const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'serverinfo',
  description: 'Display information about the current server',
  usage: '!serverinfo',
  category: 'Information',
  aliases: ['server', 'guild'],
  
  async execute(message, args, client) {
    const guild = message.guild;
    
    if (!guild) {
      return message.reply('❌ This command can only be used in a server!');
    }
    
    const embed = new EmbedBuilder()
      .setColor(client.config.colors.info)
      .setTitle(`🏰 ${guild.name}`)
      .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
      .addFields(
        { name: '👑 Owner', value: `<@${guild.ownerId}>`, inline: true },
        { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true },
        { name: '🆔 Server ID', value: guild.id, inline: true },
        { name: '👥 Members', value: guild.memberCount.toString(), inline: true },
        { name: '📁 Channels', value: guild.channels.cache.size.toString(), inline: true },
        { name: '😊 Emojis', value: guild.emojis.cache.size.toString(), inline: true },
        { name: '🔒 Verification Level', value: guild.verificationLevel.toString(), inline: true },
        { name: '🚀 Boost Level', value: guild.premiumTier.toString(), inline: true },
        { name: '💎 Boost Count', value: guild.premiumSubscriptionCount?.toString() || '0', inline: true }
      )
      .setTimestamp()
      .setFooter({ 
        text: `Requested by ${message.author.tag}`, 
        iconURL: message.author.displayAvatarURL() 
      });
    
    if (guild.description) {
      embed.setDescription(guild.description);
    }
    
    message.reply({ embeds: [embed] });
  }
};