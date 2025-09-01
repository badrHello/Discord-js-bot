const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Display information about the current server'),
    
  async execute(interaction, client) {
    const guild = interaction.guild;
    
    if (!guild) {
      return interaction.reply({
        content: '❌ This command can only be used in a server!',
        ephemeral: true
      });
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
        text: `Requested by ${interaction.user.tag}`, 
        iconURL: interaction.user.displayAvatarURL() 
      });
    
    if (guild.description) {
      embed.setDescription(guild.description);
    }
    
    interaction.reply({ embeds: [embed] });
  }
};