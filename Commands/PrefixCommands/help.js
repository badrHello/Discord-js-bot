const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'help',
  description: 'Display bot help information',
  usage: 'help',
  emoji: "🆘",
  category: 'utility',
  
  async execute(message, args, client) {
    // Get all categories from command files
    const categoryInfo = new Map(); // Store category info with emojis
    
    // Scan PrefixCommands folder
    const prefixCommandsPath = path.join(__dirname, '..', 'PrefixCommands');
    
    if (fs.existsSync(prefixCommandsPath)) {
      const prefixFiles = fs.readdirSync(prefixCommandsPath).filter(file => file.endsWith('.js'));
      for (const file of prefixFiles) {
        try {
          const command = require(path.join(prefixCommandsPath, file));
          // Only include commands that have both emoji and category
          if (command.category && command.emoji) {
            categoryInfo.set(command.category, {
              emoji: command.emoji,
              name: command.category
            });
          }
        } catch (error) {
          console.error(`Error loading prefix command ${file}:`, error);
        }
      }
    }
    
    // Scan SlashCommands folder
    const slashCommandsPath = path.join(__dirname, '..', 'SlashCommands');
    if (fs.existsSync(slashCommandsPath)) {
      const slashFiles = fs.readdirSync(slashCommandsPath).filter(file => file.endsWith('.js'));
      for (const file of slashFiles) {
        try {
          const command = require(path.join(slashCommandsPath, file));
          // Only include commands that have both emoji and category
          if (command.category && command.emoji) {
            if (!categoryInfo.has(command.category)) {
              categoryInfo.set(command.category, {
                emoji: command.emoji,
                name: command.category
              });
            }
          }
        } catch (error) {
          console.error(`Error loading slash command ${file}:`, error);
        }
      }
    }
    
    const categoryArray = Array.from(categoryInfo.keys()).sort();
    
    if (categoryArray.length === 0) {
      return message.reply('❌ No commands with valid categories and emojis found.');
    }
    
    // Create select menu options
    const selectOptions = categoryArray.map(category => {
      const info = categoryInfo.get(category);
      return {
        label: category.charAt(0).toUpperCase() + category.slice(1),
        value: category,
        description: `View ${category} commands`,
        emoji: info.emoji
      };
    });
    
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('help_category_select')
      .setPlaceholder('Choose a category to view commands')
      .addOptions(selectOptions);
    
    const row = new ActionRowBuilder().addComponents(selectMenu);
    
    // Create main help embed
    const embed = new EmbedBuilder()
      .setColor(client.config?.colors?.primary || '#0099ff')
      .setTitle(`🤖 ${client.user.username} Help`)
      .setThumbnail(client.user.displayAvatarURL())
      .setDescription('Welcome to the help menu! Use the select menu below to browse commands by category.')
      .addFields(
        { 
          name: '📊 Command Statistics', 
          value: `**Total Commands:** ${client.commands?.size || 0 + client.slashCommands?.size || 0}\n**Slash Commands:** ${client.slashCommands?.size || 0}\n**Prefix Commands:** ${client.commands?.size || 0}`, 
          inline: true 
        },
        { 
          name: '📂 Categories', 
          value: categoryArray.map(cat => `${categoryInfo.get(cat).emoji} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`).join('\n'), 
          inline: true 
        },
        { 
          name: '💡 How to Use', 
          value: 'Select a category from the dropdown menu below to view all commands in that category. The menu will show both slash commands (/) and prefix commands (!).', 
          inline: false 
        }
      )
      .setTimestamp()
      .setFooter({ 
        text: `Requested by ${message.author.tag}`, 
        iconURL: message.author.displayAvatarURL() 
      });
    
    const response = await message.reply({ 
      embeds: [embed], 
      components: [row] 
    });
    
    // Create collector for select menu interactions
    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 60000 // 1 minute timeout
    });
    
    collector.on('collect', async (selectInteraction) => {
      if (selectInteraction.user.id !== message.author.id) {
        return await selectInteraction.reply({
          content: '❌ You cannot use this select menu.',
          ephemeral: true
        });
      }
      
      const selectedCategory = selectInteraction.values[0];
      const categoryEmoji = categoryInfo.get(selectedCategory).emoji;
      
      // Get commands from selected category by scanning files
      const slashCommands = [];
      const prefixCommands = [];
      
      // Scan PrefixCommands folder for category
      if (fs.existsSync(prefixCommandsPath)) {
        const prefixFiles = fs.readdirSync(prefixCommandsPath).filter(file => file.endsWith('.js'));
        for (const file of prefixFiles) {
          try {
            const command = require(path.join(prefixCommandsPath, file));
            // Only include commands that have both emoji and category
            if (command.category === selectedCategory && command.emoji && command.category) {
              prefixCommands.push(command);
            }
          } catch (error) {
            console.error(`Error loading prefix command ${file}:`, error);
          }
        }
      }
      
      // Scan SlashCommands folder for category
      if (fs.existsSync(slashCommandsPath)) {
        const slashFiles = fs.readdirSync(slashCommandsPath).filter(file => file.endsWith('.js'));
        for (const file of slashFiles) {
          try {
            const command = require(path.join(slashCommandsPath, file));
            // Only include commands that have both emoji and category
            if (command.category === selectedCategory && command.emoji && command.category) {
              slashCommands.push(command);
            }
          } catch (error) {
            console.error(`Error loading slash command ${file}:`, error);
          }
        }
      }
      
      // Create category embed
      const categoryEmbed = new EmbedBuilder()
        .setColor(client.config?.colors?.primary || '#0099ff')
        .setTitle(`${categoryEmoji} ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Commands`)
        .setThumbnail(client.user.displayAvatarURL())
        .setTimestamp()
        .setFooter({ 
          text: `Requested by ${message.author.tag}`, 
          iconURL: message.author.displayAvatarURL() 
        });
      
      let description = '';
      
      if (slashCommands.length > 0) {
        description += '**Slash Commands**\n';
        slashCommands.forEach(command => {
          const commandName = command.data?.name || command.name;
          const commandDesc = command.data?.description || command.description;
          const commandEmoji = command.emoji;
          description += `\`/${commandName}\` - ${commandDesc}\n`;
        });
        description += '\n';
      }
      
      if (prefixCommands.length > 0) {
        description += '**Prefix Commands**\n';
        prefixCommands.forEach(command => {
          const commandEmoji = command.emoji;
          description += `\`!${command.name}\` - ${command.description}\n`;
        });
      }
      
      if (description === '') {
        description = 'No commands found in this category.';
      }
      
      categoryEmbed.setDescription(description);
      
      await selectInteraction.update({ 
        embeds: [categoryEmbed], 
        components: [row] 
      });
    });
    
    collector.on('end', async () => {
      // Disable the select menu after timeout
      const disabledRow = new ActionRowBuilder()
        .addComponents(
          selectMenu.setDisabled(true).setPlaceholder('Menu expired - run !help again')
        );
      
      try {
        await response.edit({ components: [disabledRow] });
      } catch (error) {
        // Ignore errors if message was deleted
      }
    });
  }
};