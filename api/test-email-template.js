// api/test-email-template.js - Test email template generation
export default async function handler(req, res) {
  try {
    // Clear cache and load fresh
    delete require.cache[require.resolve('../enhanced-bot.js')];
    const { EnhancedAINewsBot } = require('../enhanced-bot.js');
    
    const bot = new EnhancedAINewsBot();
    bot.allNews = [
      { title: "Test AI News", source: "Test", category: "tech", language: "en" }
    ];
    
    // Generate the HTML and extract the summary section
    const htmlContent = bot.generateEnhancedHTML();
    const summaryStart = htmlContent.indexOf('📊 Today\'s Summary');
    const summaryEnd = htmlContent.indexOf('</div>', summaryStart + 100);
    const summarySection = htmlContent.substring(summaryStart, summaryEnd);
    
    const hasFlags = summarySection.includes('🇺🇸 🇫🇷 🇩🇪 🇹🇷 🇳🇱');
    const hasOldText = summarySection.includes('from 5 languages');
    
    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      deploymentTime: Date.now(),
      hasCountryFlags: hasFlags,
      hasOldText: hasOldText,
      summarySection: summarySection,
      proof: hasFlags ? "✅ FLAGS WORKING!" : "❌ FLAGS NOT FOUND",
      flagsFound: hasFlags ? "🇺🇸 🇫🇷 🇩🇪 🇹🇷 🇳🇱" : "None"
    });
    
  } catch (error) {
    return res.status(500).json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}