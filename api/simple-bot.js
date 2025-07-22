// Vercel-friendly bot - No Puppeteer!
import axios from 'axios';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    console.log('🚀 SIMPLE AI News Bot başlıyor...');
    
    const news = [];
    
    // Sadece RSS/API based scraping
    const sites = [
      {
        name: 'TechCrunch AI RSS',
        url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
        type: 'rss'
      }
    ];
    
    for (const site of sites) {
      try {
        const response = await axios.get(site.url, {
          timeout: 8000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)'
          }
        });
        
        // Basic RSS parsing
        const items = response.data.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || [];
        
        items.slice(0, 5).forEach(item => {
          const titleMatch = item.match(/<title[^>]*><!\[CDATA\[(.*?)\]\]><\/title>/);
          const linkMatch = item.match(/<link[^>]*>(.*?)<\/link>/);
          
          if (titleMatch && linkMatch) {
            news.push({
              title: titleMatch[1],
              link: linkMatch[1],
              source: site.name
            });
          }
        });
        
        console.log(`✅ ${site.name}: ${items.length} haber bulundu`);
        
      } catch (error) {
        console.error(`❌ ${site.name} hatası:`, error.message);
      }
    }
    
    console.log(`📊 Toplam ${news.length} haber bulundu`);
    
    res.status(200).json({
      success: true,
      message: `🎉 ${news.length} haber bulundu!`,
      news: news,
      timestamp: new Date().toISOString(),
      boom: 'CHROME-FREE SCHAKALA!'
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