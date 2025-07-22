// api/evening-news.js - Evening AI News at 5:00 PM CET  
const { EnhancedAINewsBot } = require('../enhanced-bot.js');

export default async function handler(req, res) {
  // Sadece cron job'lardan gelen istekleri kabul et
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('🌆 Evening AI News Bot starting at', new Date().toLocaleString('en-US', {timeZone: 'Europe/Brussels'}));
    
    const bot = new EnhancedAINewsBot();
    await bot.init();
    
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      timezone: 'Europe/Brussels',
      schedule: 'Evening 5:00 PM CET',
      newsCount: bot.allNews ? bot.allNews.length : 0,
      message: `✅ Evening AI News delivered successfully! Found ${bot.allNews ? bot.allNews.length : 0} news articles.`
    };
    
    console.log('🎉 Evening news completed:', response);
    return res.status(200).json(response);
    
  } catch (error) {
    console.error('❌ Evening news error:', error);
    return res.status(500).json({ 
      error: error.message,
      timestamp: new Date().toISOString(),
      schedule: 'Evening 5:00 PM CET'
    });
  }
}