const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('user')
    .setDescription('Get information about a user')
    .addStringOption(option =>
      option.setName('target')
        .setDescription('The user to get information about (mention, username, or user ID)')
        .setRequired(false)
    ),

  async execute(interaction, client) {
    let target;
    const targetInput = interaction.options.getString('target');

    if (targetInput) {
      // Try to get user by ID first
      if (/^\d{17,19}$/.test(targetInput)) {
        try {
          target = await client.users.fetch(targetInput);
        } catch (error) {
          return await interaction.reply({
            content: '❌ User not found with that ID.',
            ephemeral: true
          });
        }
      }
      // Try to extract user ID from mention
      else if (targetInput.startsWith('<@') && targetInput.endsWith('>')) {
        const userId = targetInput.slice(2, -1).replace('!', '');
        try {
          target = await client.users.fetch(userId);
        } catch (error) {
          return await interaction.reply({
            content: '❌ User not found.',
            ephemeral: true
          });
        }
      }
      // Try to find by username
      else {
        const guild = interaction.guild;
        const members = await guild.members.fetch();
        const foundMember = members.find(member =>
          member.user.username.toLowerCase() === targetInput.toLowerCase() ||
          member.user.tag.toLowerCase() === targetInput.toLowerCase()
        );

        if (foundMember) {
          target = foundMember.user;
        } else {
          return await interaction.reply({
            content: '❌ User not found with that username.',
            ephemeral: true
          });
        }
      }
    } else {
      target = interaction.user;
    }

    // Calculate account age
    const accountAge = Math.floor((Date.now() - target.createdTimestamp) / (1000 * 60 * 60 * 24));
    const accountCreatedDate = new Date(target.createdTimestamp);
    const formattedAccountDate = `${accountCreatedDate.getDate()}/${accountCreatedDate.getMonth() + 1}/${accountCreatedDate.getFullYear()}`;

    // Create the embed
    const embed = new EmbedBuilder()
      .setColor(client.config?.colors?.info || '#0099ff')
      .setTitle(`👤 User Information`)
      .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 256 }))
      .addFields(
        { name: '📝 Username', value: target.tag, inline: true },
        { name: '🆔 User ID', value: target.id, inline: true },
        { name: '⏲ Account Created', value: `\`${formattedAccountDate}\`\n**${accountAge} days ago**`, inline: true }
      );

    // Check if user is a member of the guild
    const member = interaction.guild.members.cache.get(target.id);
    if (member) {
      const joinedDaysAgo = Math.floor((Date.now() - member.joinedTimestamp) / (1000 * 60 * 60 * 24));
      const joinDate = new Date(member.joinedTimestamp);
      const formattedJoinDate = `${joinDate.getDate()}/${joinDate.getMonth() + 1}/${joinDate.getFullYear()}`;

      embed.addFields(
        { name: '📥 Joined Server', value: `\`${formattedJoinDate}\`\n**${joinedDaysAgo} days ago**`, inline: true },
        { name: '🎭 Roles', value: member.roles.cache.size > 1 ? member.roles.cache.filter(role => role.id !== interaction.guild.id).map(role => role.toString()).join(', ').slice(0, 1024) : 'No roles', inline: false }
      );
    } else {
      embed.addFields(
        { name: '📥 Server Status', value: 'Not a member of this server', inline: false }
      );
    }

    embed.setTimestamp()
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL()
      });

    await interaction.reply({ embeds: [embed] });
  }
};