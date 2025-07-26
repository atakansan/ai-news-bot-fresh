// api/test-flags.js - Test if production has the correct flags
export default async function handler(req, res) {
  const timestamp = Date.now();
  console.log('🔄 Testing flags at:', timestamp);
  
  try {
    // Clear cache and load fresh
    delete require.cache[require.resolve('../enhanced-bot.js')];
    const { EnhancedAINewsBot } = require('../enhanced-bot.js');
    
    const bot = new EnhancedAINewsBot();
    bot.allNews = []; // Empty array for test
    
    // Get the HTML content to check flags
    const htmlContent = bot.generateEnhancedHTML();
    const hasFlags = htmlContent.includes('🇺🇸 🇫🇷 🇩🇪 🇹🇷 🇳🇱');
    const hasOldText = htmlContent.includes('from 5 languages');
    
    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      hasCountryFlags: hasFlags,
      hasOldText: hasOldText,
      codeVersion: timestamp,
      flagsText: hasFlags ? "🇺🇸 🇫🇷 🇩🇪 🇹🇷 🇳🇱" : "NOT FOUND",
      htmlSnippet: htmlContent.substring(htmlContent.indexOf('Today\'s Summary'), htmlContent.indexOf('Today\'s Summary') + 200)
    });
    
  } catch (error) {
    console.error('❌ Test flags error:', error);
    return res.status(500).json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}