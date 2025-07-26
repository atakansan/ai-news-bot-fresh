// api/prove-flags.js - PROVE FLAGS WORK IN PRODUCTION
const fs = require('fs');
const path = require('path');

export default async function handler(req, res) {
  const timestamp = Date.now();
  console.log('🎯 PROVING FLAGS WORK - timestamp:', timestamp);
  
  try {
    // Force fresh load - multiple cache clearing techniques
    const botPath = path.resolve(__dirname, '..', 'enhanced-bot.js');
    delete require.cache[botPath];
    delete require.cache[require.resolve('../enhanced-bot.js')];
    
    // Clear ALL require cache
    Object.keys(require.cache).forEach(key => {
      if (key.includes('enhanced-bot')) {
        delete require.cache[key];
      }
    });
    
    const { EnhancedAINewsBot } = require('../enhanced-bot.js');
    
    const bot = new EnhancedAINewsBot();
    bot.allNews = [
      { title: "Test AI News 1", source: "TechCrunch", category: "global", language: "en" },
      { title: "Test IA Nouvelle", source: "ActuIA", category: "global", language: "fr" }, 
      { title: "Test Yapay Zeka", source: "Webrazzi", category: "startup", language: "tr" }
    ];
    
    // Generate HTML
    const htmlContent = bot.generateEnhancedHTML();
    
    // Extract key parts
    const hasFlags = htmlContent.includes('🇺🇸 🇫🇷 🇩🇪 🇹🇷 🇳🇱');
    const hasOldText = htmlContent.includes('from 5 languages');
    const summaryMatch = htmlContent.match(/Found <strong>\d+ AI news<\/strong> from ([^<]+)/);
    const flagsText = summaryMatch ? summaryMatch[1] : 'NOT FOUND';
    
    // Extract full summary section
    const summaryStart = htmlContent.indexOf('📊 Today\'s Summary');
    const summaryEnd = htmlContent.indexOf('</div>', summaryStart + 300);
    const summarySection = htmlContent.substring(summaryStart, summaryEnd);
    
    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      deploymentTime: timestamp,
      
      // PROOF RESULTS
      hasCountryFlags: hasFlags,
      hasOldText: hasOldText,
      flagsInEmail: flagsText,
      
      // PROOF DATA
      proof: {
        status: hasFlags && !hasOldText ? "✅ FLAGS WORKING!" : "❌ FLAGS NOT WORKING",
        flags: hasFlags ? "🇺🇸 🇫🇷 🇩🇪 🇹🇷 🇳🇱" : "❌ NOT FOUND",
        oldTextRemoved: !hasOldText ? "✅ YES" : "❌ STILL THERE"
      },
      
      // DETAILED EVIDENCE
      summarySection: summarySection,
      codeVersion: `v${timestamp}`,
      
      // FINAL VERDICT
      verdict: hasFlags && !hasOldText ? 
        "🎉 SUCCESS: Country flags are working in production!" : 
        "❌ FAILED: Flags still not working"
    });
    
  } catch (error) {
    console.error('❌ Prove flags error:', error);
    return res.status(500).json({ 
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}