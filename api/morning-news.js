// api/morning-news.js - Morning AI News at 5:00 AM CET
const { EnhancedAINewsBot } = require('../enhanced-bot.js');

export default async function handler(req, res) {
  // Sadece cron job'lardan gelen istekleri kabul et
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('🌅 Morning AI News Bot starting at', new Date().toLocaleString('en-US', {timeZone: 'Europe/Brussels'}));
    
    const bot = new EnhancedAINewsBot();
    await bot.init();
    
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      timezone: 'Europe/Brussels',
      schedule: 'Morning 5:00 AM CET',
      newsCount: bot.allNews ? bot.allNews.length : 0,
      message: `✅ Morning AI News delivered successfully! Found ${bot.allNews ? bot.allNews.length : 0} news articles.`
    };
    
    console.log('🎉 Morning news completed:', response);
    return res.status(200).json(response);
    
  } catch (error) {
    console.error('❌ Morning news error:', error);
    return res.status(500).json({ 
      error: error.message,
      timestamp: new Date().toISOString(),
      schedule: 'Morning 5:00 AM CET'
    });
  }
}