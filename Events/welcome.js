const { Events, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');

module.exports = {
  name: Events.GuildMemberAdd,
  
  async execute(member) {
    try {
      const channelId = '';
      const channel = member.guild.channels.cache.get(channelId);
      
      if (!channel) return;

      const canvas = createCanvas(500, 190);
      const ctx = canvas.getContext('2d');

      const avatarURL = member.user.displayAvatarURL({ extension: 'png', size: 256 });
      const avatar = await loadImage(avatarURL);

      const avatarSize = 130;
      const avatarX = 77;
      const avatarY = 100;


      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX, avatarY, avatarSize / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avatar, avatarX - avatarSize / 2, avatarY - avatarSize / 2, avatarSize, avatarSize);
      ctx.restore();

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'left';
      const username = `${member.user.username}`;
      ctx.strokeText(username, 150, 129);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(username, 150, 129);

      const attachment = new AttachmentBuilder(canvas.toBuffer(), { 
        name: 'welcome.png' 
      });

      await channel.send({ 
        files: [attachment]
      });

      const welcomeMessage = `Welcome ${member}!\nInvited by ${member.guild.members.me}`;
      await channel.send(welcomeMessage);

    } catch (error) {
      console.error('Error in welcome event:', error);
    }
  }

};
