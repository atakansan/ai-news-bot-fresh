// Super Simple Test Bot
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    console.log('🚀 SUPER SIMPLE AI News Bot çalışıyor...');
    
    // Mock news data
    const mockNews = [
      {
        title: "ChatGPT'de Yeni Özellikler Duyuruldu",
        source: "TechCrunch",
        link: "https://techcrunch.com/ai"
      },
      {
        title: "Google Gemini Pro'da Major Update",
        source: "VentureBeat", 
        link: "https://venturebeat.com/ai"
      },
      {
        title: "Claude AI Yeni Dil Desteği",
        source: "Anthropic",
        link: "https://anthropic.com"
      }
    ];
    
    console.log(`📊 ${mockNews.length} mock haber hazırlandı`);
    
    res.status(200).json({
      success: true,
      message: `🎉 ${mockNews.length} AI haberi bulundu!`,
      news: mockNews,
      timestamp: new Date().toISOString(),
      boom: 'SUPER SIMPLE SCHAKALA!',
      nextSchedule: 'Her sabah 05:00',
      testMode: true
    });
    
  } catch (error) {
    console.error('❌ Bot hatası:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      boom: 'ERROR SCHAKALA!'
    });
  }
}