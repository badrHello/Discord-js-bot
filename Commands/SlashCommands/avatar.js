const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Display a user\'s avatar with format options')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user whose avatar you want to see (mention or ID)')
        .setRequired(false)
    ),
    
  async execute(interaction, client) {
    let targetUser = interaction.options.getUser('user');
    
    if (!targetUser) {
      targetUser = interaction.user;
    }
    
    const hasAnimatedAvatar = targetUser.avatar && targetUser.avatar.startsWith('a_');
    
    const formatOptions = [
      {
        label: 'PNG',
        description: 'High quality PNG format',
        value: 'png',
        emoji: '🖼️'
      },
      {
        label: 'JPEG',
        description: 'Compressed JPEG format',
        value: 'jpeg',
        emoji: '📸'
      },
      {
        label: 'WebP',
        description: 'Modern WebP format',
        value: 'webp',
        emoji: '🌐'
      }
    ];

    if (hasAnimatedAvatar) {
      formatOptions.unshift({
        label: 'GIF',
        description: 'Animated GIF format',
        value: 'gif',
        emoji: '🎬'
      });
    }

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('avatar-format-select')
      .setPlaceholder('Choose avatar format...')
      .addOptions(formatOptions);

    const row = new ActionRowBuilder().addComponents(selectMenu);

  
    const embed = new EmbedBuilder()
      .setColor('#2F3136') 
      .setTitle(`@${targetUser.tag} Avatar`)
      .setURL(targetUser.displayAvatarURL({ dynamic: true, size: 512 }))
      .setImage(targetUser.displayAvatarURL({ extension: 'png', size: 512 }))
      .setDescription(`[Download Avatar](${targetUser.displayAvatarURL({ extension: 'png', size: 512 })})`)
      .setTimestamp()
      .setFooter({ 
        text: `req by @${interaction.user.tag}`, 
        iconURL: interaction.user.displayAvatarURL({ extension: 'png', size: 64 })
      });
    
    const response = await interaction.reply({ 
      embeds: [embed], 
      components: [row]
    });

    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 300000 // 5 minutes
    });

    collector.on('collect', async (selectInteraction) => {
      if (selectInteraction.user.id !== interaction.user.id) {
        return selectInteraction.reply({
          content: 'Only the command user can use this menu!',
          ephemeral: true
        });
      }

      const selectedFormat = selectInteraction.values[0];
      const formatEmojis = {
        gif: '🎬',
        png: '🖼️',
        jpeg: '📸',
        webp: '🌐'
      };

      const newEmbed = new EmbedBuilder()
        .setColor('#2F3136')
        .setTitle(`${formatEmojis[selectedFormat]} @${targetUser.tag} Avatar`)
        .setURL(targetUser.displayAvatarURL({ dynamic: true, size: 512 }))
        .setImage(targetUser.displayAvatarURL({ 
          extension: selectedFormat, 
          size: 512,
          forceStatic: selectedFormat !== 'gif'
        }))
        .setDescription(`[Download ${selectedFormat.toUpperCase()} Avatar](${targetUser.displayAvatarURL({ 
          extension: selectedFormat, 
          size: 512,
          forceStatic: selectedFormat !== 'gif'
        })})`)
        .setTimestamp()
        .setFooter({ 
          text: `req by @${interaction.user.tag}`, 
          iconURL: interaction.user.displayAvatarURL({ extension: 'png', size: 64 })
        });

      const updatedSelectMenu = new StringSelectMenuBuilder()
        .setCustomId('avatar-format-select')
        .setPlaceholder(`Current: ${selectedFormat.toUpperCase()}`)
        .addOptions(formatOptions);

      const updatedRow = new ActionRowBuilder().addComponents(updatedSelectMenu);

      await selectInteraction.update({
        embeds: [newEmbed],
        components: [updatedRow]
      });
    });

    collector.on('end', async () => {
      const disabledSelectMenu = new StringSelectMenuBuilder()
        .setCustomId('avatar-format-select')
        .setPlaceholder(`🔒`)
        .addOptions(formatOptions)
        .setDisabled(true);

      const disabledRow = new ActionRowBuilder().addComponents(disabledSelectMenu);

      try {
        await response.edit({ components: [disabledRow] });
      } catch (error) {
        console.log(`error in avatar command with select menu: ${error}`)
      }
    });
  }
};