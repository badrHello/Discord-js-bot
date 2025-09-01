const fs = require('fs');
const path = require('path');

function loadCommands(client) {
  const prefixCommandsPath = path.join(__dirname, '..', 'Commands', 'PrefixCommands');
  
  if (fs.existsSync(prefixCommandsPath)) {
    const prefixFiles = fs.readdirSync(prefixCommandsPath).filter(file => file.endsWith('.js'));
    
    console.log(`Loading ${prefixFiles.length} prefix commands...`);
    
    for (const file of prefixFiles) {
      const filePath = path.join(prefixCommandsPath, file);
      const command = require(filePath);
      
      if (command.name) {
        client.commands.set(command.name, command);
        console.log(`✓ Loaded prefix command: ${command.name}`);
      } else {
        console.log(`✗ Failed to load prefix command from ${file}: Missing name property`);
      }
    }
  }

  const slashCommandsPath = path.join(__dirname, '..', 'Commands', 'SlashCommands');
  
  if (fs.existsSync(slashCommandsPath)) {
    const slashFiles = fs.readdirSync(slashCommandsPath).filter(file => file.endsWith('.js'));
    
    console.log(`Loading ${slashFiles.length} slash commands...`);
    
    for (const file of slashFiles) {
      const filePath = path.join(slashCommandsPath, file);
      const command = require(filePath);
      
      if (command.data && command.execute) {
        client.slashCommands.set(command.data.name, command);
        console.log(`✓ Loaded slash command: ${command.data.name}`);
      } else {
        console.log(`✗ Failed to load slash command from ${file}: Missing data or execute property`);
      }
    }
  }
}

module.exports = { loadCommands };