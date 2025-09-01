const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('banner')
    .setDescription('Display a user\'s banner with format options')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user whose banner you want to see (mention or ID)')
        .setRequired(false)
    ),
    
  async execute(interaction, client) {
    let targetUser = interaction.options.getUser('user');
    
    if (!targetUser) {
      targetUser = interaction.user;
    }

    try {
      targetUser = await client.users.fetch(targetUser.id, { force: true });
    } catch (error) {
      return interaction.reply({
        content: '❌ Failed to fetch user data. Please try again.',
        ephemeral: true
      });
    }
    
    if (!targetUser.banner) {
      const noBannerEmbed = new EmbedBuilder()
        .setColor('#2F3136')
        .setTitle(`@${targetUser.tag} Banner`)
        .setDescription('❌ This user doesn\'t have a banner set.')
        .setTimestamp()
        .setFooter({ 
          text: `req by @${interaction.user.tag}`, 
          iconURL: interaction.user.displayAvatarURL({ extension: 'png', size: 64 })
        });
      
      return interaction.reply({ embeds: [noBannerEmbed] });
    }
    
    const hasAnimatedBanner = targetUser.banner && targetUser.banner.startsWith('a_');
    
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

    if (hasAnimatedBanner) {
      formatOptions.unshift({
        label: 'GIF',
        description: 'Animated GIF format',
        value: 'gif',
        emoji: '🎬'
      });
    }

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('banner-format-select')
      .setPlaceholder('Choose banner format...')
      .addOptions(formatOptions);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    const embed = new EmbedBuilder()
      .setColor('#2F3136') 
      .setTitle(`@${targetUser.tag} Banner`)
      .setURL(targetUser.bannerURL({ dynamic: true, size: 512 }))
      .setImage(targetUser.bannerURL({ extension: 'png', size: 512 }))
      .setDescription(`[Download Banner](${targetUser.bannerURL({ extension: 'png', size: 512 })})`)
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
        .setTitle(`${formatEmojis[selectedFormat]} @${targetUser.tag} Banner`)
        .setURL(targetUser.bannerURL({ dynamic: true, size: 512 }))
        .setImage(targetUser.bannerURL({ 
          extension: selectedFormat, 
          size: 512,
          forceStatic: selectedFormat !== 'gif'
        }))
        .setDescription(`[Download ${selectedFormat.toUpperCase()} Banner](${targetUser.bannerURL({ 
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
        .setCustomId('banner-format-select')
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
        .setCustomId('banner-format-select')
        .setPlaceholder(`🔒`)
        .addOptions(formatOptions)
        .setDisabled(true);

      const disabledRow = new ActionRowBuilder().addComponents(disabledSelectMenu);

      try {
        await response.edit({ components: [disabledRow] });
      } catch (error) {
        console.log(`error in banner command with select menu: ${error}`)
      }
    });
  }
};