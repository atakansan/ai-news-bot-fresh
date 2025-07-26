// api/send-test-email.js - SEND ACTUAL TEST EMAIL WITH FLAGS
export default async function handler(req, res) {
  const timestamp = Date.now();
  console.log('📧 SENDING TEST EMAIL - timestamp:', timestamp);
  
  try {
    // Force fresh load
    delete require.cache[require.resolve('../enhanced-bot.js')];
    const { EnhancedAINewsBot } = require('../enhanced-bot.js');
    
    const bot = new EnhancedAINewsBot();
    
    // Add some test news
    bot.allNews = [
      { title: "🧪 TEST: ChatGPT Gets Major Update", source: "TechCrunch", category: "global", language: "en", link: "https://techcrunch.com", priority: "high", aiScore: 95, scrapedAt: new Date().toISOString() },
      { title: "🧪 TEST: Nouvelle IA révolutionnaire", source: "ActuIA", category: "global", language: "fr", link: "https://actuia.com", priority: "high", aiScore: 90, scrapedAt: new Date().toISOString() },
      { title: "🧪 TEST: Yapay Zeka Sektöründe Büyük Gelişme", source: "Webrazzi", category: "startup", language: "tr", link: "https://webrazzi.com", priority: "high", aiScore: 85, scrapedAt: new Date().toISOString() }
    ];
    
    console.log('📧 Sending test email with flags...');
    
    // Override the test mode check
    const originalTestMode = process.env.TEST_MODE;
    delete process.env.TEST_MODE;
    
    await bot.sendEnhancedEmail();
    
    // Restore test mode
    if (originalTestMode) process.env.TEST_MODE = originalTestMode;
    
    // Also generate HTML to show what was sent
    const htmlContent = bot.generateEnhancedHTML();
    const hasFlags = htmlContent.includes('🇺🇸 🇫🇷 🇩🇪 🇹🇷 🇳🇱');
    
    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      message: "✅ TEST EMAIL SENT!",
      emailDetails: {
        recipientCount: Array.isArray(bot.allNews) ? bot.allNews.length : 0,
        newsCount: bot.allNews.length,
        hasFlags: hasFlags,
        subject: "Daily AI News Summary - " + new Date().toLocaleDateString('en-US')
      },
      proof: {
        flagsInEmail: hasFlags ? "🇺🇸 🇫🇷 🇩🇪 🇹🇷 🇳🇱" : "❌ NOT FOUND",
        testTimestamp: `v${timestamp}`
      },
      instructions: "Check your email inbox for the test email with country flags!"
    });
    
  } catch (error) {
    console.error('❌ Test email error:', error);
    return res.status(500).json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}