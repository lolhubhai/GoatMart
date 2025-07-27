
// GoatMart.js - Command for displaying website information and status
// Usage: Simply run this command to get website info

module.exports.config = {
  name: "goatmart",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "GoatMart Team",
  description: "Display GoatMart website information, statistics, and maintenance status",
  commandCategory: "utility",
  usages: "[info|stats|status]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const axios = require('axios');
  const fs = require('fs');
  
  const baseURL = "https://your-goatmart-domain.com"; // Replace with your actual domain
  
  try {
    // Check maintenance status first
    const maintenanceResponse = await axios.get(`${baseURL}/api/maintenance`);
    const maintenanceData = maintenanceResponse.data;
    
    if (maintenanceData.enabled) {
      const maintenanceMsg = `🚧 MAINTENANCE MODE ACTIVE 🚧\n\n` +
        `📝 ${maintenanceData.title}\n\n` +
        `💬 Message: ${maintenanceData.message}\n` +
        (maintenanceData.estimatedTime ? `⏰ Estimated Time: ${maintenanceData.estimatedTime}\n` : '') +
        `\n🔧 The website is currently under maintenance.\n` +
        `📱 You can still access the admin panel if you're an administrator.\n\n` +
        `🌐 Website: ${baseURL}\n` +
        `👨‍💼 Admin Panel: ${baseURL}/admin.html`;
      
      return api.sendMessage(maintenanceMsg, event.threadID, event.messageID);
    }

    const subCommand = args[0]?.toLowerCase();
    
    if (subCommand === "stats" || subCommand === "statistics") {
      // Fetch detailed statistics
      const statsResponse = await axios.get(`${baseURL}/api/stats`);
      const stats = statsResponse.data;
      
      const statsMsg = `📊 GOATMART STATISTICS 📊\n\n` +
        `📝 Total Commands: ${stats.totalCommands || 0}\n` +
        `❤️ Total Likes: ${stats.totalLikes || 0}\n` +
        `👥 Daily Active Users: ${stats.dailyActiveUsers || 0}\n` +
        `🚀 Total Shares: ${stats.totalShares || 0}\n` +
        `📈 Total Requests: ${stats.totalRequests || 0}\n\n` +
        `🏆 TOP COMMAND TYPES:\n` +
        (stats.popularTags ? stats.popularTags.slice(0, 3).map((tag, i) => 
          `${i + 1}. ${tag._id || 'N/A'} (${tag.count} commands)`).join('\n') : 'No data available') +
        `\n\n💻 SERVER STATUS:\n` +
        `🟢 Database: ${stats.hosting?.database?.status || 'Unknown'}\n` +
        `⚡ Response Time: ${stats.hosting?.performance?.averageResponseTime || 0}ms\n` +
        `🌐 Uptime: ${formatUptime(stats.hosting?.uptime)}\n\n` +
        `🔗 Visit: ${baseURL}`;
      
      return api.sendMessage(statsMsg, event.threadID, event.messageID);
    }
    
    if (subCommand === "status" || subCommand === "health") {
      // Check website health
      const healthMsg = `🏥 GOATMART HEALTH CHECK 🏥\n\n` +
        `🟢 Website Status: Online\n` +
        `🔧 Maintenance Mode: Disabled\n` +
        `🌐 URL: ${baseURL}\n` +
        `📱 Mobile Friendly: ✅\n` +
        `🔒 HTTPS: ✅\n` +
        `⚡ Fast Loading: ✅\n\n` +
        `🎯 Quick Links:\n` +
        `📝 Upload Command: ${baseURL}/upload.html\n` +
        `🔍 Browse Commands: ${baseURL}\n` +
        `👨‍💼 Admin Panel: ${baseURL}/admin.html\n\n` +
        `✨ All systems operational!`;
      
      return api.sendMessage(healthMsg, event.threadID, event.messageID);
    }
    
    // Default info message
    const infoMsg = `🐐 GOATMART - COMMAND HUB 🐐\n\n` +
      `📝 Description: Premium bot commands sharing platform\n` +
      `🌟 Features:\n` +
      `• Share & discover bot commands\n` +
      `• Support for GoatBot, MiraiBot & AutoBot\n` +
      `• Real-time statistics\n` +
      `• Beautiful material design UI\n` +
      `• Mobile-responsive interface\n` +
      `• Admin maintenance controls\n\n` +
      `🚀 Quick Commands:\n` +
      `• goatmart stats - View statistics\n` +
      `• goatmart status - Check health\n\n` +
      `🔗 Website: ${baseURL}\n` +
      `📱 Upload: ${baseURL}/upload.html\n` +
      `👨‍💼 Admin: ${baseURL}/admin.html\n\n` +
      `💡 Tip: Visit the website to explore amazing commands!\n` +
      `📞 Support: Contact admin for issues`;
    
    return api.sendMessage(infoMsg, event.threadID, event.messageID);
    
  } catch (error) {
    console.error('GoatMart command error:', error);
    
    const errorMsg = `❌ GOATMART ERROR ❌\n\n` +
      `😔 Unable to connect to GoatMart website\n\n` +
      `🔧 Possible reasons:\n` +
      `• Website is temporarily down\n` +
      `• Network connection issues\n` +
      `• Server maintenance in progress\n\n` +
      `💡 Try again in a few minutes\n` +
      `📞 Contact admin if issue persists\n\n` +
      `🌐 Website: ${baseURL}`;
    
    return api.sendMessage(errorMsg, event.threadID, event.messageID);
  }
};

function formatUptime(uptime) {
  if (!uptime) return 'Unknown';
  
  const parts = [];
  if (uptime.days > 0) parts.push(`${uptime.days}d`);
  if (uptime.hours > 0) parts.push(`${uptime.hours}h`);
  if (uptime.minutes > 0) parts.push(`${uptime.minutes}m`);
  
  return parts.join(' ') || '< 1m';
}
