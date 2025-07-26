// test-flags-local.js - Prove flags are working locally and should work in production
const { EnhancedAINewsBot } = require('./enhanced-bot.js');

async function testFlags() {
  console.log('🧪 Testing Country Flags Implementation...\n');
  
  const bot = new EnhancedAINewsBot();
  
  // Add some test news to generate template
  bot.allNews = [
    { title: "ChatGPT Update", source: "TechCrunch", category: "global", language: "en" },
    { title: "IA Nouvelle", source: "ActuIA", category: "global", language: "fr" },
    { title: "Yapay Zeka Gelişmesi", source: "Webrazzi", category: "startup", language: "tr" }
  ];
  
  // Generate the HTML template
  const htmlContent = bot.generateEnhancedHTML();
  
  // Extract the summary section
  const summaryStart = htmlContent.indexOf('📊 Today\'s Summary');
  const summaryEnd = htmlContent.indexOf('</div>', summaryStart + 200);
  const summarySection = htmlContent.substring(summaryStart, summaryEnd);
  
  console.log('📋 SUMMARY SECTION:');
  console.log('-------------------');
  console.log(summarySection);
  console.log('-------------------\n');
  
  const hasFlags = summarySection.includes('🇺🇸 🇫🇷 🇩🇪 🇹🇷 🇳🇱');
  const hasOldText = summarySection.includes('from 5 languages');
  const versionTimestamp = summarySection.includes('(v');
  
  console.log('🔍 TEST RESULTS:');
  console.log(`✅ Country Flags Present: ${hasFlags ? 'YES ✅' : 'NO ❌'}`);
  console.log(`❌ Old "5 languages" Text: ${hasOldText ? 'YES ❌' : 'NO ✅'}`);
  console.log(`🕐 Version Timestamp: ${versionTimestamp ? 'YES ✅' : 'NO ❌'}`);
  
  if (hasFlags) {
    console.log('\n🎉 PROOF: FLAGS ARE WORKING!');
    console.log('The same code is deployed to production, so flags should appear in emails.');
  } else {
    console.log('\n❌ ERROR: Flags not found in template');
  }
  
  return { hasFlags, hasOldText, versionTimestamp };
}

testFlags().catch(console.error);