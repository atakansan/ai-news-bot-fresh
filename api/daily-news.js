// api/daily-news.js - Daily AI News at 5:00 AM & 5:00 PM CET
// Clear cache to force reload
delete require.cache[require.resolve('../enhanced-bot.js')];
const { EnhancedAINewsBot } = require('../enhanced-bot.js');

export default async function handler(req, res) {
  try {
    const now = new Date();
    const belgiumTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Brussels"}));
    const hour = belgiumTime.getHours();
    
    // Sabah mı akşam mı belirleme
    const isEvening = hour >= 15; // 15:00+ akşam
    const schedule = isEvening ? 'Evening 5:00 PM CET' : 'Morning 5:00 AM CET';
    const emoji = isEvening ? '🌆' : '🌅';
    
    console.log(`${emoji} ${schedule} AI News Bot starting at`, belgiumTime.toLocaleString());
    
    const bot = new EnhancedAINewsBot();
    await bot.init();
    
    const response = {
      success: true,
      timestamp: now.toISOString(),
      belgiumTime: belgiumTime.toLocaleString(),
      schedule: schedule,
      newsCount: bot.allNews ? bot.allNews.length : 0,
      message: `✅ ${schedule} AI News delivered! Found ${bot.allNews ? bot.allNews.length : 0} articles.`
    };
    
    console.log(`🎉 ${schedule} completed:`, response);
    return res.status(200).json(response);
    
  } catch (error) {
    console.error('❌ Daily news error:', error);
    return res.status(500).json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}// Rebuild trigger
