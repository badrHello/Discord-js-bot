const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');

module.exports = {
  name: 'banner',
  description: 'Display a user\'s banner with format options',
  usage: 'banner [user mention/ID]',
  category: 'utility',
  
  async execute(message, args, client) {
    let targetUser;
    
    if (args.length > 0) {
      // Try to parse user mention or ID
      const userArg = args[0];
      const userIdMatch = userArg.match(/^(?:<@!?)?(\d+)>?$/);
      
      if (userIdMatch) {
        try {
          targetUser = await client.users.fetch(userIdMatch[1], { force: true });
        } catch (error) {
          return message.reply('❌ User not found. Please provide a valid user mention or ID.');
        }
      } else {
        return message.reply('❌ Invalid user format. Please mention a user or provide their ID.');
      }
    } else {
      try {
        targetUser = await client.users.fetch(message.author.id, { force: true });
      } catch (error) {
        return message.reply('❌ Failed to fetch user data. Please try again.');
      }
    }
    
    if (!targetUser.banner) {
      const noBannerEmbed = new EmbedBuilder()
        .setColor('#2F3136')
        .setTitle(`@${targetUser.tag} Banner`)
        .setDescription('❌ This user doesn\'t have a banner set.')
        .setTimestamp()
        .setFooter({ 
          text: `req by @${message.author.tag}`, 
          iconURL: message.author.displayAvatarURL({ extension: 'png', size: 64 })
        });
      
      return message.reply({ embeds: [noBannerEmbed] });
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
        text: `req by @${message.author.tag}`, 
        iconURL: message.author.displayAvatarURL({ extension: 'png', size: 64 })
      });
    
    const response = await message.reply({ 
      embeds: [embed], 
      components: [row]
    });

    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 300000 // 5 minutes
    });

    collector.on('collect', async (selectInteraction) => {
      if (selectInteraction.user.id !== message.author.id) {
        return selectInteraction.reply({
          content: 'Only the command user can use this menu!',
          ephemeral: true
        });
      }

      // Acknowledge the interaction first
      await selectInteraction.deferUpdate();

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
          text: `req by @${message.author.tag}`, 
          iconURL: message.author.displayAvatarURL({ extension: 'png', size: 64 })
        });

      const updatedSelectMenu = new StringSelectMenuBuilder()
        .setCustomId('banner-format-select')
        .setPlaceholder(`Current: ${selectedFormat.toUpperCase()}`)
        .addOptions(formatOptions);

      const updatedRow = new ActionRowBuilder().addComponents(updatedSelectMenu);

      try {
        await selectInteraction.editReply({
          embeds: [newEmbed],
          components: [updatedRow]
        });
      } catch (error) {
        // Fallback: edit the original message if interaction fails
        await response.edit({
          embeds: [newEmbed],
          components: [updatedRow]
        });
      }
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