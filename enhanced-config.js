// enhanced-config.js - ENHANCED AI NEWS BOT SETTINGS
module.exports = {
  // Email ayarları
  email: {
    user: process.env.EMAIL_USER || 'atakansan2012@gmail.com',
    pass: process.env.EMAIL_PASS || 'jwzuwacigxctzmjv', 
    to: ['atakan_san@yahoo.com', 'atakansan2012@gmail.com', 'bredariol@bredariol.be', 'atillasan@icloud.com'], // Separate emails to each
    cc: null
  },
  
  // AI Özet Ayarları
  aiSummary: {
    enabled: false,  // ⭐ AI özetleri KAPATILDI
    maxArticlesToSummarize: 5, // En önemli 5 haberi özetle
    summaryLength: 'short', // short, medium, long
    includeKeywords: true,
    includeSentiment: true
  },
  
  // Gelişmiş Haber Siteleri
  sites: [
    {
      name: 'Webrazzi AI',
      url: 'https://webrazzi.com/kategori/yapay-zeka/',
      titleSelector: '.post-title a, .entry-title a, h2 a, h3 a, .title a',
      linkSelector: '.post-title a, .entry-title a, h2 a, h3 a, .title a',
      priority: 'high',
      category: 'startup',
      language: 'tr'
    },
    {
      name: 'ShiftDelete AI',
      url: 'https://shiftdelete.net/yapay-zeka',
      titleSelector: '.td-module-title a, .entry-title a',
      linkSelector: '.td-module-title a, .entry-title a',
      priority: 'high',
      category: 'tech',
      language: 'tr'
    },
    {
      name: 'Webtekno AI',
      url: 'https://www.webtekno.com/yapay-zeka',
      titleSelector: '.headline__blocks__header a, h3.headline__title a, article[data-id] h3 a',
      linkSelector: '.headline__blocks__header a, h3.headline__title a, article[data-id] h3 a',
      priority: 'medium',
      category: 'tech',
      language: 'tr'
    },
    {
      name: 'TechCrunch AI',
      url: 'https://techcrunch.com/category/artificial-intelligence/',
      titleSelector: '.post-block__title__link, h2 a, h3 a',
      linkSelector: '.post-block__title__link, h2 a, h3 a',
      priority: 'high',
      category: 'global',
      language: 'en'
    },
    {
      name: 'VentureBeat AI',
      url: 'https://venturebeat.com/ai/',
      titleSelector: '.ArticleListing__title-link, h2 a, h3 a',
      linkSelector: '.ArticleListing__title-link, h2 a, h3 a',
      priority: 'medium',
      category: 'global',
      language: 'en'
    },
    // GEÇİCİ DEVRE DIŞI: 404 hatası veriyor
    // {
    //   name: 'Tamindir AI',
    //   url: 'https://www.tamindir.com/blog/etiket/yapay-zeka/',
    //   titleSelector: 'h2 a, h3 a, .post-title a, .entry-title a',
    //   linkSelector: 'h2 a, h3 a, .post-title a, .entry-title a',
    //   priority: 'medium',
    //   category: 'tech'
    // },
    {
      name: 'Log AI',
      url: 'https://log.com.tr/etiket/yapay-zeka/',
      titleSelector: 'h2 a, h3 a, .post-title a, .entry-title a',
      linkSelector: 'h2 a, h3 a, .post-title a, .entry-title a',
      priority: 'medium',
      category: 'tech',
      language: 'tr'
    },
    // GEÇİCİ DEVRE DIŞI: 404 hatası veriyor
    // {
    //   name: 'DonanımHaber AI',
    //   url: 'https://www.donanimhaber.com/kategori/yapay-zeka',
    //   titleSelector: 'h2 a, h3 a, .post-title a, .title a',
    //   linkSelector: 'h2 a, h3 a, .post-title a, .title a',
    //   priority: 'medium',
    //   category: 'tech'
    // },
    {
      name: 'ActuIA 🇫🇷',
      url: 'https://www.actuia.com',
      titleSelector: '.post-title a, .entry-title a, h2 a, h3 a, .article-title a',
      linkSelector: '.post-title a, .entry-title a, h2 a, h3 a, .article-title a',
      priority: 'high',
      category: 'global',
      language: 'fr'
    },
    {
      name: 'JDN Intelligence Artificielle 🇫🇷',
      url: 'https://www.journaldunet.com/intelligence-artificielle/',
      titleSelector: '.manchette-titre a, .titre-liste a, h2 a, h3 a',
      linkSelector: '.manchette-titre a, .titre-liste a, h2 a, h3 a',
      priority: 'high',
      category: 'global',
      language: 'fr'
    },
    {
      name: 'Bright.nl AI 🇳🇱',
      url: 'https://www.bright.nl/onderwerpen/AI',
      titleSelector: '.article-title a, .post-title a, h2 a, h3 a, .entry-title a',
      linkSelector: '.article-title a, .post-title a, h2 a, h3 a, .entry-title a',
      priority: 'high',
      category: 'global',
      language: 'nl'
    },
    {
      name: 'AI Headliner 🇳🇱',
      url: 'https://ai.headliner.nl',
      titleSelector: '.headline a, .post-title a, h2 a, h3 a, .article-title a',
      linkSelector: '.headline a, .post-title a, h2 a, h3 a, .article-title a',
      priority: 'high',
      category: 'global',
      language: 'nl'
    },
    {
      name: 'All-AI.de 🇩🇪',
      url: 'https://all-ai.de',
      titleSelector: '.post-title a, .entry-title a, h2 a, h3 a, .article-title a',
      linkSelector: '.post-title a, .entry-title a, h2 a, h3 a, .article-title a',
      priority: 'high',
      category: 'global',
      language: 'de'
    }
  ],

  // Belgian News Sites - Bonus Section
  belgianSites: [
    {
      name: 'Brussels Times',
      url: 'https://www.brusselstimes.com/',
      titleSelector: 'h1 a, h2 a, h3 a, .entry-title a, .article-title a, .headline a',
      linkSelector: 'h1 a, h2 a, h3 a, .entry-title a, .article-title a, .headline a',
      priority: 'high',  
      category: 'belgian',
      language: 'en'
    }
  ],
  
  // Gelişmiş AI Anahtar Kelimeler
  aiKeywords: {
    primary: [
      'yapay zeka', 'artificial intelligence', 'AI', 'ChatGPT', 'Claude', 
      'Gemini', 'Bard', 'OpenAI', 'Anthropic', 'Google AI', 'Microsoft AI',
      'intelligence artificielle', 'IA', 'apprentissage automatique',
      'kunstmatige intelligentie', 'machinaal leren', 'AI-technologie',
      'künstliche intelligenz', 'KI', 'maschinelles lernen', 'AI-technologie'
    ],
    secondary: [
      'machine learning', 'deep learning', 'neural network', 'LLM',
      'large language model', 'GPT', 'transformer', 'bot', 'otomasyon',
      'computer vision', 'natural language', 'robotics',
      'apprentissage profond', 'réseau de neurones', 'algorithme', 'robotique'
    ],
    trending: [
      'GPT-4', 'GPT-5', 'Claude 3', 'Gemini Pro', 'Copilot', 'Sora',
      'Midjourney', 'DALL-E', 'Stable Diffusion', 'AutoGPT',
      'LLaMA', 'Mistral AI', 'Hugging Face'
    ]
  },
  
  // Scraping Ayarları
  scraping: {
    maxRetries: 3,
    retryDelay: 5000,
    timeout: 45000,
    waitTime: 8000,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    maxArticlesPerSite: 8,
    maxBelgianArticlesPerSite: 4, // Belgian sites limit
    minTitleLength: 20,
    maxTitleLength: 200
  },
  
  // Email Template Ayarları
  emailTemplate: {
    style: 'modern', // modern, classic, minimal
    includeImages: true,
    includeSocialShare: false,
    includeReadLater: true,
    showSourceLogos: true,
    darkMode: false
  },
  
  // Analitik Ayarları
  analytics: {
    trackTrends: true,
    identifyHotTopics: true,
    sentimentAnalysis: true,
    categoryDistribution: true,
    timeAnalysis: true
  },
  
  // Notification Ayarları
  notifications: {
    sendSummaryEmail: true,
    sendBreakingNews: false, // Acil haberler için ayrı mail
    minimumNewsCount: 5, // En az 5 haber yoksa mail gönderme
    includeWeeklyDigest: false
  }
};