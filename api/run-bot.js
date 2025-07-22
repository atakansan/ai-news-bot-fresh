// Vercel API Endpoint - AI News Bot Runner
const { EnhancedAINewsBot } = require('../enhanced-bot.js');

// Vercel ortam değişkenini ayarla
process.env.VERCEL = '1';

// Vercel function timeout'unu artır (150 saniye)
export const maxDuration = 150;

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Sadece POST isteklerine izin ver (güvenlik için)
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    console.log('🚀 AI News Bot API çalıştırılıyor...');
    console.log('🌍 Vercel ortamında çalışıyor');
    
    // Production modunda mail gönderimi için TEST_MODE'u kapat
    // Sadece hızlı test için TEST_MODE aktif et
    // process.env.TEST_MODE = 'true';
    
    const bot = new EnhancedAINewsBot();
    await bot.init();
    
    res.status(200).json({
      success: true,
      message: '🎉 AI News Bot başarıyla çalıştı!',
      timestamp: new Date().toISOString(),
      newsCount: bot.allNews.length,
      analytics: bot.analytics,
      boom: 'SCHAKALA!'
    });
    
  } catch (error) {
    console.error('❌ Bot API hatası:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      boom: 'ERROR SCHAKALA!'
    });
  }
}