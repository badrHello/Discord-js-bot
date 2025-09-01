const { EmbedBuilder } = require('discord.js');
const os = require('os');

module.exports = {
  name: 'botinfo',
  description: 'Display bot information',
  usage: 'botinfo',
  category: 'utility',
  
  async execute(message, args, client) {
    // Calculate uptime
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor(uptime / 3600) % 24;
    const minutes = Math.floor(uptime / 60) % 60;
    const seconds = Math.floor(uptime) % 60;
    const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    
    // Memory usage
    const memUsage = process.memoryUsage();
    const memUsed = (memUsage.heapUsed / 1024 / 1024).toFixed(2);
    const memTotal = (memUsage.heapTotal / 1024 / 1024).toFixed(2);
    
    // System info
    const cpuUsage = process.cpuUsage();
    const platform = os.platform();
    const nodeVersion = process.version;
    const discordJsVersion = require('discord.js').version;
    
    // Calculate total users
    const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
    
    const embed = new EmbedBuilder()
      .setColor(client.config.colors.primary)
      .setTitle(`🤖 ${client.user.username} Information`)
      .setThumbnail(client.user.displayAvatarURL())
      .addFields(
        { name: '📊 Bot Statistics', value: `**Servers:** ${client.guilds.cache.size}\n**Users:** ${totalUsers.toLocaleString()}\n**Commands:** ${client.commands.size + client.slashCommands.size}`, inline: true },
        { name: '⏱️ Uptime', value: uptimeString, inline: true },
        { name: '💾 Memory Usage', value: `${memUsed} MB / ${memTotal} MB`, inline: true },
        { name: '🖥️ System Info', value: `**Platform:** ${platform}\n**Node.js:** ${nodeVersion}\n**Discord.js:** v${discordJsVersion}`, inline: true },
        { name: '📡 Connection', value: `**Ping:** ${client.ws.ping}ms\n**Status:** ${client.ws.status === 0 ? '🟢 Connected' : '🔴 Disconnected'}`, inline: true },
        { name: '🔧 Process Info', value: `**PID:** ${process.pid}\n**CPU Arch:** ${os.arch()}\n**CPU Cores:** ${os.cpus().length}`, inline: true }
      )
      .setTimestamp()
      .setFooter({ 
        text: `Requested by ${message.author.tag}`, 
        iconURL: message.author.displayAvatarURL() 
      });
    
    await message.reply({ embeds: [embed] });
  }
};