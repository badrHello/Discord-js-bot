const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  emoji: "🆘",
  category: "utility",
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Display bot help information'),
    
  async execute(interaction, client) {
    const categoryInfo = new Map(); 
    
    
    const prefixCommandsPath = path.join(__dirname, '..', 'PrefixCommands');
    if (fs.existsSync(prefixCommandsPath)) {
      const prefixFiles = fs.readdirSync(prefixCommandsPath).filter(file => file.endsWith('.js'));
      for (const file of prefixFiles) {
        try {
          const command = require(path.join(prefixCommandsPath, file));
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
    
    const slashCommandsPath = path.join(__dirname, '..', 'SlashCommands');
    if (fs.existsSync(slashCommandsPath)) {
      const slashFiles = fs.readdirSync(slashCommandsPath).filter(file => file.endsWith('.js'));
      for (const file of slashFiles) {
        try {
          const command = require(path.join(slashCommandsPath, file));
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
      return interaction.reply({
        content: '❌ No commands with valid categories and emojis found.',
        ephemeral: true
      });
    }
    
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
        text: `Requested by ${interaction.user.tag}`, 
        iconURL: interaction.user.displayAvatarURL() 
      });
    
    const response = await interaction.reply({ 
      embeds: [embed], 
      components: [row] 
    });
    
    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 60000 // 1 minute timeout
    });
    
    collector.on('collect', async (selectInteraction) => {
      if (selectInteraction.user.id !== interaction.user.id) {
        return await selectInteraction.reply({
          content: '❌ You cannot use this select menu.',
          ephemeral: true
        });
      }
      
      const selectedCategory = selectInteraction.values[0];
      const categoryEmoji = categoryInfo.get(selectedCategory).emoji;
      
      const slashCommands = [];
      const prefixCommands = [];
      
      if (fs.existsSync(prefixCommandsPath)) {
        const prefixFiles = fs.readdirSync(prefixCommandsPath).filter(file => file.endsWith('.js'));
        for (const file of prefixFiles) {
          try {
            const command = require(path.join(prefixCommandsPath, file));
            if (command.category === selectedCategory && command.emoji && command.category) {
              prefixCommands.push(command);
            }
          } catch (error) {
            console.error(`Error loading prefix command ${file}:`, error);
          }
        }
      }
      
      if (fs.existsSync(slashCommandsPath)) {
        const slashFiles = fs.readdirSync(slashCommandsPath).filter(file => file.endsWith('.js'));
        for (const file of slashFiles) {
          try {
            const command = require(path.join(slashCommandsPath, file));
            if (command.category === selectedCategory && command.emoji && command.category) {
              slashCommands.push(command);
            }
          } catch (error) {
            console.error(`Error loading slash command ${file}:`, error);
          }
        }
      }
      
      const categoryEmbed = new EmbedBuilder()
        .setColor(client.config?.colors?.primary || '#0099ff')
        .setTitle(`${categoryEmoji} ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Commands`)
        .setThumbnail(client.user.displayAvatarURL())
        .setTimestamp()
        .setFooter({ 
          text: `Requested by ${interaction.user.tag}`, 
          iconURL: interaction.user.displayAvatarURL() 
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
      const disabledRow = new ActionRowBuilder()
        .addComponents(
          selectMenu.setDisabled(true).setPlaceholder('Menu expired - run /help again')
        );
      
      try {
        await response.edit({ components: [disabledRow] });
      } catch (error) {
        console.log(error)
      }
    });
  }
};
