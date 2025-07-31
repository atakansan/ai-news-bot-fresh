// enhanced-bot.js - AI NEWS BOT v3.0 with AI Summaries & Enhanced Features
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const axios = require('axios');
const cheerio = require('cheerio');

// Axios ve Cheerio zaten yukarıda import edildi
// Puppeteer artık kullanılmıyor

// Enhanced configuration dosyasını kullan
const config = require('./enhanced-config.js');

class EnhancedAINewsBot {
  constructor() {
    this.allNews = [];
    this.belgianNews = []; // Belgian news separate array
    this.analytics = {
      totalArticles: 0,
      successfulScrapes: 0,
      failedScrapes: 0,
      categoryDistribution: {},
      trendingTopics: {},
      sentimentScores: []
    };
    this.startTime = new Date();
  }

  async init() {
    console.log('🚀 AI News Bot v3.0 başlatılıyor...');
    
    // Günlük çalışma kontrolü
    if (await this.hasRunToday()) {
      console.log('⏰ Bot bugün zaten çalıştı, çıkılıyor...');
      return;
    }

    try {
      await this.scrapeAllSites();
      // Belgian news scraping removed for stability
      await this.processAndAnalyze();
      await this.sendEnhancedEmail();
      await this.saveRunDate();
      
      console.log('✅ Bot başarıyla tamamlandı!');
      console.log(`📊 Toplam ${this.allNews.length} AI haber bulundu`);
      
    } catch (error) {
      console.error('❌ Bot hatası:', error);
      await this.sendErrorNotification(error);
    }
  }

  async hasRunToday() {
    // Test için her zaman false döndür
    return false;
    
    // Vercel'de dosya sistemi read-only olduğu için bu kontrolü devre dışı bırak
    if (process.env.VERCEL) {
      return false; // Her zaman çalışmasına izin ver
    }
    
    try {
      const lastRunFile = path.join(__dirname, 'last-run.txt');
      if (!fs.existsSync(lastRunFile)) return false;
      
      const lastRun = fs.readFileSync(lastRunFile, 'utf8').trim();
      const today = new Date().toDateString();
      
      return lastRun === today;
    } catch (error) {
      return false;
    }
  }

  async saveRunDate() {
    // Vercel'de dosya sistemi read-only olduğu için bu işlemi atla
    if (process.env.VERCEL) {
      console.log('📝 Vercel ortamında çalışıyor, dosya yazma atlandı');
      return;
    }
    
    const lastRunFile = path.join(__dirname, 'last-run.txt');
    fs.writeFileSync(lastRunFile, new Date().toDateString());
  }

  async scrapeAllSites() {
    console.log('🌐 AI Haber sitelerini tarayıp analiz ediliyor...');
    
    const sitesToScrape = process.env.TEST_MODE ? config.sites.slice(0, 2) : config.sites;
    
    for (const site of sitesToScrape) {
      console.log(`📄 ${site.name} taranıyor...`);
      await this.scrapeSiteWithRetry(site);
      
      // Siteler arası bekleme
      const delay = process.env.TEST_MODE ? 1000 : config.scraping.retryDelay;
      await this.sleep(delay);
    }
  }

  async scrapeBelgianSites() {
    console.log('🇧🇪 Belçika haber sitelerini taranıyor...');
    
    const belgianSites = process.env.TEST_MODE ? config.belgianSites.slice(0, 2) : config.belgianSites;
    
    for (const site of belgianSites) {
      console.log(`📄 ${site.name} (Belçika) taranıyor...`);
      await this.scrapeBelgianSiteWithRetry(site);
      
      // Siteler arası bekleme
      const delay = process.env.TEST_MODE ? 1000 : config.scraping.retryDelay;
      await this.sleep(delay);
    }
  }

  async scrapeSiteWithRetry(site, retryCount = 0) {
    try {
      // Axios ile HTML içeriğini al
      const response = await axios.get(site.url, {
        timeout: config.scraping.timeout,
        headers: {
          'User-Agent': config.scraping.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        }
      });

      // Cheerio ile HTML'i parse et
      const $ = cheerio.load(response.data);
      const articles = [];

      // Başlık ve link elementlerini al
      const titleElements = $(site.titleSelector);
      const linkElements = $(site.linkSelector);

      // Her bir elementi işle
      titleElements.each((index, titleEl) => {
        if (index >= config.scraping.maxArticlesPerSite) return false; // Limit'e ulaştıysa dur
        
        const title = $(titleEl).text().trim();
        
        // Link elementi - önce aynı index'teki link'i dene
        let link = '';
        if (index < linkElements.length) {
          const linkEl = linkElements.eq(index);
          link = linkEl.attr('href') || linkEl.find('a').first().attr('href') || '';
        }
        
        // Eğer link bulunamadıysa, title elementi içinde ara
        if (!link) {
          link = $(titleEl).find('a').first().attr('href') || 
                 $(titleEl).closest('a').attr('href') || 
                 $(titleEl).parent().find('a').first().attr('href') || '';
        }
        
        // Link'i tam URL'e çevir
        if (link && !link.startsWith('http')) {
          try {
            link = new URL(link, site.url).href;
          } catch (e) {
            link = '';
          }
        }
        
        // Geçerli haber kontrolü
        if (title && link && 
            title.length >= config.scraping.minTitleLength && 
            title.length <= config.scraping.maxTitleLength &&
            this.containsAIKeywords(title)) {
          
          articles.push({
            title,
            link,
            timestamp: new Date().toISOString()
          });
        }
      });

      // Siteye özgü bilgiler ekle
      const enhancedNews = articles.slice(0, config.scraping.maxArticlesPerSite).map(article => ({
        ...article,
        source: site.name,
        category: site.category,
        priority: site.priority,
        language: site.language,
        scrapedAt: new Date().toISOString(),
        aiScore: this.calculateAIRelevanceScore(article.title)
      }));

      this.allNews.push(...enhancedNews);
      this.analytics.successfulScrapes++;
      this.analytics.totalArticles += enhancedNews.length;
      
      // Kategori dağılımını güncelle
      this.analytics.categoryDistribution[site.category] = 
        (this.analytics.categoryDistribution[site.category] || 0) + enhancedNews.length;

      console.log(`✅ ${site.name}: ${enhancedNews.length} haber bulundu`);

    } catch (error) {
      console.error(`❌ ${site.name} hatası:`, error.message);
      this.analytics.failedScrapes++;
      
      if (retryCount < config.scraping.maxRetries) {
        console.log(`🔄 ${site.name} yeniden deneniyor... (${retryCount + 1}/${config.scraping.maxRetries})`);
        await this.sleep(config.scraping.retryDelay);
        return this.scrapeSiteWithRetry(site, retryCount + 1);
      }
    }
  }

  async scrapeBelgianSiteWithRetry(site, retryCount = 0) {
    try {
      // Axios ile HTML içeriğini al
      const response = await axios.get(site.url, {
        timeout: config.scraping.timeout,
        headers: {
          'User-Agent': config.scraping.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'fr-BE,fr;q=0.9,nl-BE,nl;q=0.8,en;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        }
      });

      // Cheerio ile HTML'i parse et
      const $ = cheerio.load(response.data);
      const articles = [];

      // Başlık ve link elementlerini al
      const titleElements = $(site.titleSelector);
      const linkElements = $(site.linkSelector);

      // Her bir elementi işle
      titleElements.each((index, titleEl) => {
        if (index >= config.scraping.maxBelgianArticlesPerSite) return false; // Limit'e ulaştıysa dur
        
        const title = $(titleEl).text().trim();
        
        // Link elementi - önce aynı index'teki link'i dene
        let link = '';
        if (index < linkElements.length) {
          const linkEl = linkElements.eq(index);
          link = linkEl.attr('href') || linkEl.find('a').first().attr('href') || '';
        }
        
        // Eğer link bulunamadıysa, title elementi içinde ara
        if (!link) {
          link = $(titleEl).find('a').first().attr('href') || 
                 $(titleEl).closest('a').attr('href') || 
                 $(titleEl).parent().find('a').first().attr('href') || '';
        }
        
        // Link'i tam URL'e çevir
        if (link && !link.startsWith('http')) {
          try {
            link = new URL(link, site.url).href;
          } catch (e) {
            link = '';
          }
        }
        
        // Geçerli haber kontrolü (AI keyword kontrolü yok, tüm haberler)
        if (title && link && 
            title.length >= config.scraping.minTitleLength && 
            title.length <= config.scraping.maxTitleLength) {
          
          articles.push({
            title,
            link,
            timestamp: new Date().toISOString()
          });
        }
      });

      // Siteye özgü bilgiler ekle
      const enhancedNews = articles.slice(0, config.scraping.maxBelgianArticlesPerSite).map(article => ({
        ...article,
        source: site.name,
        category: site.category,
        priority: site.priority,
        language: site.language,
        scrapedAt: new Date().toISOString()
      }));

      this.belgianNews.push(...enhancedNews);
      this.analytics.successfulScrapes++;
      
      console.log(`✅ ${site.name} (Belçika): ${enhancedNews.length} haber bulundu`);

    } catch (error) {
      console.error(`❌ ${site.name} (Belçika) hatası:`, error.message);
      this.analytics.failedScrapes++;
      
      if (retryCount < config.scraping.maxRetries) {
        console.log(`🔄 ${site.name} (Belçika) yeniden deneniyor... (${retryCount + 1}/${config.scraping.maxRetries})`);
        await this.sleep(config.scraping.retryDelay);
        return this.scrapeBelgianSiteWithRetry(site, retryCount + 1);
      }
    }
  }

  containsAIKeywords(title) {
    const titleLower = title.toLowerCase();
    return config.aiKeywords.primary.some(keyword => titleLower.includes(keyword.toLowerCase())) ||
           config.aiKeywords.secondary.some(keyword => titleLower.includes(keyword.toLowerCase())) ||
           config.aiKeywords.trending.some(keyword => titleLower.includes(keyword.toLowerCase()));
  }

  calculateAIRelevanceScore(title) {
    let score = 0;
    const titleLower = title.toLowerCase();
    
    // Primary keywords - yüksek puan
    config.aiKeywords.primary.forEach(keyword => {
      if (titleLower.includes(keyword.toLowerCase())) score += 10;
    });
    
    // Secondary keywords - orta puan  
    config.aiKeywords.secondary.forEach(keyword => {
      if (titleLower.includes(keyword.toLowerCase())) score += 5;
    });
    
    // Trending keywords - ekstra puan
    config.aiKeywords.trending.forEach(keyword => {
      if (titleLower.includes(keyword.toLowerCase())) score += 15;
    });
    
    return Math.min(score, 100); // Max 100 puan
  }

  async processAndAnalyze() {
    console.log('🧠 AI analizi ve işleme başlıyor...');
    
    // Duplikat temizleme (gelişmiş)
    this.allNews = this.removeDuplicatesAdvanced();
    
    // Dil bazında sıralama: EN>FR>NL>DE>TR
    this.allNews = this.sortByLanguagePriority();
    
    // Trending topics hesaplama
    this.calculateTrendingTopics();
    
    // En önemli haberleri AI ile özetle
    if (config.aiSummary.enabled) {
      await this.generateAISummaries();
    }
    
    console.log(`📊 İşleme tamamlandı: ${this.allNews.length} benzersiz haber`);
  }

  removeDuplicatesAdvanced() {
    const seen = new Map();
    return this.allNews.filter(article => {
      const titleWords = article.title.toLowerCase().split(' ');
      const keyWords = titleWords.filter(word => word.length > 3);
      const signature = keyWords.slice(0, 5).sort().join(' ');
      
      if (seen.has(signature)) {
        // Daha yüksek AI puanı olan versiyonu tut
        const existing = seen.get(signature);
        if (article.aiScore > existing.aiScore) {
          seen.set(signature, article);
          return true;
        }
        return false;
      }
      
      seen.set(signature, article);
      return true;
    });
  }

  sortByLanguagePriority() {
    // Dil öncelik sırası: EN>FR>NL>DE>TR
    const languagePriority = {
      'en': 1,
      'fr': 2, 
      'nl': 3,
      'de': 4,
      'tr': 5
    };

    return this.allNews.sort((a, b) => {
      const priorityA = languagePriority[a.language] || 999;
      const priorityB = languagePriority[b.language] || 999;
      
      // İlk önce dil önceliğine göre sırala
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // Aynı dildeyse AI puanına göre sırala
      return b.aiScore - a.aiScore;
    });
  }

  calculateTrendingTopics() {
    const topics = {};
    
    this.allNews.forEach(article => {
      // Title'dan önemli kelimeleri çıkar
      const words = article.title.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3);
      
      words.forEach(word => {
        if (config.aiKeywords.primary.some(kw => kw.toLowerCase().includes(word)) ||
            config.aiKeywords.trending.some(kw => kw.toLowerCase().includes(word))) {
          topics[word] = (topics[word] || 0) + 1;
        }
      });
    });
    
    // En popüler 10 topic
    this.analytics.trendingTopics = Object.entries(topics)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .reduce((obj, [word, count]) => {
        obj[word] = count;
        return obj;
      }, {});
  }

  async generateAISummaries() {
    console.log('📝 AI özetleri oluşturuluyor...');
    
    // En yüksek puanlı haberleri seç
    const topArticles = this.allNews
      .slice(0, config.aiSummary.maxArticlesToSummarize);
    
    for (const article of topArticles) {
      try {
        // Simüle edilmiş AI özet (gerçek API entegrasyonu için değiştirilebilir)
        article.aiSummary = this.generateSimpleAISummary(article);
        article.sentiment = this.analyzeSentiment(article.title);
        this.analytics.sentimentScores.push(article.sentiment);
        
        await this.sleep(1000); // Rate limiting
      } catch (error) {
        console.error('AI özet hatası:', error);
      }
    }
  }

  generateSimpleAISummary(article) {
    const title = article.title;
    const category = article.category;
    
    // Basit AI özet simülasyonu
    if (title.toLowerCase().includes('chatgpt') || title.toLowerCase().includes('openai')) {
      return `🤖 OpenAI ve ChatGPT ile ilgili ${category} kategorisinde önemli gelişme. Bu haber AI sektöründeki son trendleri yansıtıyor.`;
    } else if (title.toLowerCase().includes('google') || title.toLowerCase().includes('gemini')) {
      return `🔍 Google'ın AI teknolojilerindeki ilerlemesi. Gemini ve diğer Google AI ürünlerinde yenilikler.`;
    } else if (title.toLowerCase().includes('yapay zeka') || title.toLowerCase().includes('artificial intelligence')) {
      return `🧠 Yapay zeka alanında ${category} sektöründe dikkat çeken gelişme. AI teknolojilerinin pratik uygulamaları.`;
    } else {
      return `📈 AI ve teknoloji sektöründe ${category} kategorisinde güncel gelişme. Sektör trendlerini takip etmek için önemli haber.`;
    }
  }

  analyzeSentiment(title) {
    const positiveWords = ['yeni', 'geliştirildi', 'başarılı', 'artış', 'yenilik', 'breakthrough', 'success', 'improved'];
    const negativeWords = ['sorun', 'hata', 'düşüş', 'problem', 'error', 'issue', 'concern', 'risk'];
    
    let score = 0;
    const titleLower = title.toLowerCase();
    
    positiveWords.forEach(word => {
      if (titleLower.includes(word)) score += 1;
    });
    
    negativeWords.forEach(word => {
      if (titleLower.includes(word)) score -= 1;
    });
    
    if (score > 0) return 'positive';
    if (score < 0) return 'negative';
    return 'neutral';
  }

  async sendEnhancedEmail() {
    if (this.allNews.length < config.notifications.minimumNewsCount) {
      console.log(`📧 Yeterli haber yok (${this.allNews.length} < ${config.notifications.minimumNewsCount}), email gönderilmiyor.`);
      return;
    }
    
    // Test modunda sadece ilk 2 siteyi tara
    if (process.env.TEST_MODE) {
      console.log('📧 TEST MODU: Email gönderilmiyor, HTML önizlemesi...');
      const htmlContent = this.generateEnhancedHTML();
      console.log('HTML uzunluğu:', htmlContent.length, 'karakter');
      return;
    }

    console.log('📧 Gelişmiş email gönderiliyor...');
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.email.user,
        pass: config.email.pass
      }
    });

    const htmlContent = this.generateEnhancedHTML();
    const subject = this.generateDynamicSubject();

    try {
      // Array ise her email'e ayrı ayrı gönder
      if (Array.isArray(config.email.to)) {
        for (const recipient of config.email.to) {
          const mailOptions = {
            from: config.email.user,
            to: recipient,
            subject: subject,
            html: htmlContent
          };
          await transporter.sendMail(mailOptions);
          console.log(`✅ Email başarıyla gönderildi: ${recipient}`);
        }
      } else {
        // Tek email ise normal gönder
        const mailOptions = {
          from: config.email.user,
          to: config.email.to,
          cc: config.email.cc,
          subject: subject,
          html: htmlContent
        };
        await transporter.sendMail(mailOptions);
        console.log('✅ Email başarıyla gönderildi!');
      }
    } catch (error) {
      console.error('❌ Email gönderme hatası:', error);
      throw error;
    }
  }

  generateDynamicSubject() {
    return `Daily AI News Summary - ${new Date().toLocaleDateString('en-US')}`;
  }

  generateEnhancedHTML() {
    const today = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // Apple-style ultra-modern minimalist template
    return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Helvetica, Arial, sans-serif; padding: 0; margin: 0; background: #ffffff;">
  <div style="max-width: 680px; margin: 0 auto;">
    <!-- Ultra-minimal header -->
    <div style="padding: 60px 40px 40px; text-align: center; background: #000000;">
      <div style="font-size: 48px; margin-bottom: 20px;">🤖</div>
      <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 300; letter-spacing: -0.5px;">AI News Daily</h1>
      <p style="color: #999999; margin: 12px 0 0 0; font-size: 16px; font-weight: 200;">${today}</p>
      <p style="color: #666666; margin: 8px 0 0 0; font-size: 14px; font-weight: 200;">Belgium Edition</p>
    </div>
    
    <!-- Minimal stats bar -->
    <div style="background: #f5f5f7; padding: 32px 40px; border-bottom: 1px solid #e5e5e7;">
      <div style="display: flex; justify-content: center; align-items: center; gap: 40px; flex-wrap: wrap;">
        <div style="text-align: center;">
          <div style="font-size: 36px; font-weight: 600; color: #1d1d1f;">${this.allNews.length}</div>
          <div style="font-size: 13px; color: #86868b; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px;">Articles</div>
        </div>
        <div style="width: 1px; height: 40px; background: #d2d2d7;"></div>
        <div style="text-align: center;">
          <div style="font-size: 36px; font-weight: 600; color: #1d1d1f;">5</div>
          <div style="font-size: 13px; color: #86868b; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px;">Languages</div>
        </div>
        <div style="width: 1px; height: 40px; background: #d2d2d7;"></div>
        <div style="text-align: center;">
          <div style="font-size: 24px; line-height: 36px;">🇫🇷 🇬🇧 🇳🇱 🇩🇪 🇹🇷</div>
          <div style="font-size: 13px; color: #86868b; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px;">Coverage</div>
        </div>
      </div>
    </div>
    
    <div style="margin: 30px 0;">
      ${this.generateSimpleNewsList()}
      </div>
      
      <!-- Belgian news section removed for stability -->
      
      <!-- Premium Footer -->
      <div style="background: #000000; padding: 60px 40px; text-align: center; margin-top: 80px;">
        <!-- Logo animation hint -->
        <div style="margin-bottom: 24px;">
          <div style="display: inline-block; position: relative;">
            <div style="font-size: 48px; animation: pulse 2s ease-in-out infinite;">🤖</div>
            <style>
              @keyframes pulse {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.05); opacity: 0.8; }
                100% { transform: scale(1); opacity: 1; }
              }
            </style>
          </div>
        </div>
        
        <h3 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 300; color: #ffffff; letter-spacing: -0.5px;">AI News Daily</h3>
        <p style="margin: 0 0 32px 0; color: #86868b; font-size: 16px; font-weight: 200;">Curated Intelligence from Belgium</p>
        
        <!-- Turquoise accent stats -->
        <div style="display: inline-block; background: linear-gradient(135deg, #00D4FF 0%, #00A8CC 100%); padding: 20px 32px; border-radius: 24px; margin-bottom: 32px;">
          <div style="display: flex; align-items: center; gap: 24px; color: white; font-size: 14px;">
            <div>
              <span style="font-weight: 600;">⚡</span> ${Math.round((Date.now() - this.startTime) / 1000)}s
            </div>
            <div style="width: 1px; height: 16px; background: rgba(255,255,255,0.3);"></div>
            <div>
              <span style="font-weight: 600;">📍</span> Belgium, CET
            </div>
            <div style="width: 1px; height: 16px; background: rgba(255,255,255,0.3);"></div>
            <div>
              <span style="font-weight: 600;">📅</span> ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>
        
        <p style="margin: 0; color: #515154; font-size: 14px;">
          Crafted with precision • <a href="mailto:atakansan2012@gmail.com" style="color: #00D4FF; text-decoration: none;">atakansan2012@gmail.com</a>
        </p>
      </div>
    </div>
  </div>
</div>`;
  }
  generateSimpleNewsList() {
    const languages = ['fr', 'en', 'nl', 'de', 'tr']; // Belgium priority: French first, then English
    const languageInfo = {
      'en': { name: 'English', flag: '🇺🇸', emoji: '🌍' },
      'fr': { name: 'Français', flag: '🇫🇷', emoji: '🥖' },
      'nl': { name: 'Nederlands', flag: '🇳🇱', emoji: '🌷' },
      'de': { name: 'Deutsch', flag: '🇩🇪', emoji: '🍺' },
      'tr': { name: 'Türkçe', flag: '🇹🇷', emoji: '🧿' }
    };

    return languages.map(language => {
      const languageNews = this.allNews.filter(news => news.language === language);
      if (languageNews.length === 0) return '';
      
      const langInfo = languageInfo[language];
      // Apple-style minimalist approach
      return `
        <div style="padding: 0 40px; margin-bottom: 60px;">
          <!-- Language section header - ultra clean -->
          <div style="border-bottom: 1px solid #e5e5e7; padding-bottom: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 16px;">
                <span style="font-size: 40px; line-height: 1;">${langInfo.flag}</span>
                <h2 style="margin: 0; font-size: 28px; font-weight: 600; color: #1d1d1f; letter-spacing: -0.5px;">${langInfo.name}</h2>
              </div>
              <div style="background: #000000; color: #ffffff; padding: 8px 16px; border-radius: 24px; font-size: 14px; font-weight: 500;">
                ${languageNews.length} articles
              </div>
            </div>
          </div>
          
          <!-- News items - super clean cards -->
          <div style="display: grid; gap: 16px;">
            ${languageNews.slice(0, 8).map((news, index) => `
              <div style="
                background: linear-gradient(135deg, #ffffff 0%, #f8fffe 50%, #f0ffff 100%); 
                padding: 24px; 
                border-radius: 20px; 
                border: 1px solid rgba(0, 212, 255, 0.08);
                box-shadow: 0 4px 24px rgba(0, 212, 255, 0.05);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                overflow: hidden;
              ">
                <!-- Subtle gradient overlay -->
                <div style="position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, #00D4FF, transparent); opacity: 0.3;"></div>
                
                <div style="margin-bottom: 16px;">
                  <a href="${news.link}" target="_blank" style="color: #1d1d1f; text-decoration: none; display: block;">
                    <h3 style="
                      margin: 0; 
                      font-size: 19px; 
                      font-weight: 600; 
                      line-height: 1.35; 
                      letter-spacing: -0.4px;
                      background: linear-gradient(135deg, #1d1d1f 0%, #2c2c2e 100%);
                      -webkit-background-clip: text;
                      -webkit-text-fill-color: transparent;
                      background-clip: text;
                    ">
                      ${news.title}
                    </h3>
                  </a>
                </div>
                
                <div style="display: flex; align-items: center; gap: 16px; font-size: 13px;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 18px; filter: brightness(1.1);">${this.getCountryFlag(news.source)}</span>
                    <span style="color: #1d1d1f; font-weight: 600;">${news.source}</span>
                  </div>
                  
                  <div style="width: 3px; height: 3px; background: #00D4FF; border-radius: 50%; opacity: 0.6;"></div>
                  
                  <span style="
                    background: linear-gradient(135deg, #00D4FF, #00A8CC); 
                    color: white; 
                    padding: 6px 14px; 
                    border-radius: 16px; 
                    font-size: 11px; 
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                  ">
                    ${news.category}
                  </span>
                  
                  <div style="margin-left: auto; display: flex; align-items: center; gap: 6px;">
                    <div style="
                      width: 24px; 
                      height: 24px; 
                      background: linear-gradient(135deg, #00D4FF, #00A8CC); 
                      border-radius: 50%; 
                      display: flex; 
                      align-items: center; 
                      justify-content: center;
                    ">
                      <span style="color: white; font-size: 10px; font-weight: 700;">${news.aiScore || news.priority}</span>
                    </div>
                    <span style="color: #86868b; font-size: 11px; font-weight: 500;">AI Score</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
          
          ${languageNews.length > 8 ? `
            <div style="text-align: center; margin-top: 24px;">
              <span style="color: #86868b; font-size: 14px;">
                +${languageNews.length - 8} more articles
              </span>
            </div>
          ` : ''}
        </div>
      `;
    }).filter(html => html !== '').join('');
  }

  generateBelgianNewsSection() {
    if (this.belgianNews.length === 0) return '';
    
    return `
      <div style="margin: 40px 0; border-top: 3px solid #667eea; padding-top: 30px;">
        <h3 style="color: #667eea; text-align: center; margin-bottom: 20px; font-size: 24px;">
          🇧🇪 News in Belgium 🇧🇪
        </h3>
        <div style="background: #f0f4ff; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
          <p style="margin: 0; color: #666; font-size: 16px;">
            Latest news from Belgian sources (${this.belgianNews.length} articles)
          </p>
        </div>
        
        ${this.generateBelgianNewsByLanguage()}
      </div>
    `;
  }

  generateBelgianNewsByLanguage() {
    const languages = ['fr', 'nl'];
    const languageInfo = {
      'fr': { name: 'French', flag: '🇫🇷', emoji: '📰' },
      'nl': { name: 'Dutch', flag: '🇳🇱', emoji: '📰' }
    };

    return languages.map(language => {
      const languageNews = this.belgianNews.filter(news => news.language === language);
      if (languageNews.length === 0) return '';
      
      const langInfo = languageInfo[language];
      return `
        <div style="margin-bottom: 25px;">
          <h4 style="color: #667eea; border-bottom: 1px solid #667eea; padding-bottom: 8px; margin-bottom: 15px;">
            ${langInfo.flag} ${langInfo.name} ${langInfo.emoji} (${languageNews.length})
          </h4>
          ${languageNews.map((news, index) => `
            <div style="background: #fff; padding: 12px; margin: 8px 0; border-radius: 6px; border-left: 3px solid #667eea; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <div style="font-weight: bold; margin-bottom: 5px; font-size: 14px;">
                <a href="${news.link}" target="_blank" style="color: #333; text-decoration: none;">${news.title}</a>
              </div>
              <div style="font-size: 11px; color: #666;">
                🏢 <strong>${news.source}</strong> | ${new Date(news.timestamp).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})}
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }).filter(html => html !== '').join('');
  }

  getCountryFlag(sourceName) {
    const countryFlags = {
      'Webrazzi': '🇹🇷',
      'ShiftDelete': '🇹🇷', 
      'Webtekno': '🇹🇷',
      'Tamindir': '🇹🇷',
      'Log': '🇹🇷',
      'DonanımHaber': '🇹🇷',
      'TechCrunch': '🇺🇸',
      'VentureBeat': '🇺🇸',
      'ActuIA': '🇫🇷',
      'JDN Intelligence': '🇫🇷',
      'Bright.nl': '🇳🇱', 
      'AI Headliner': '🇳🇱',
      'All-AI.de': '🇩🇪'
    };
    
    for (let site in countryFlags) {
      if (sourceName.includes(site)) {
        return countryFlags[site];
      }
    }
    return '🌍'; // Default
  }

  generateNewsByCategory() {
    const categories = [...new Set(this.allNews.map(news => news.category))];
    const categoryEmojis = {
      'startup': '🚀💡',
      'tech': '🤖💻', 
      'global': '🌍🇹🇷🇺🇸🇫🇷🇳🇱🇩🇪🌟',
      'local': '🏠🇹🇷'
    };

    return categories.map(category => {
      const categoryNews = this.allNews.filter(news => news.category === category);
      
      return `
        <div class="news-section">
            <div class="section-title">
                ${categoryEmojis[category] || '📰'} ${category.toUpperCase()} (${categoryNews.length})
            </div>
            ${categoryNews.map(news => `
                <div class="news-item" style="position: relative;">
                    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; 
                                font-size: 8em; opacity: 0.1; display: flex; align-items: center; 
                                justify-content: center; pointer-events: none; z-index: 0;">
                        ${this.getCountryFlag(news.source)}
                    </div>
                    <div style="position: relative; z-index: 1;">
                        <div class="news-title">
                            <a href="${news.link}" target="_blank">${news.title}</a>
                        </div>
                        <div class="news-meta">
                            <span class="news-badge badge-source">📰 ${news.source}</span>
                            <span class="news-badge badge-category">🏷️ ${news.category}</span>
                            <span class="news-badge badge-priority">⭐ ${news.priority}</span>
                            <span class="news-badge badge-score">🎯 AI: ${news.aiScore}</span>
                        </div>
                        ${news.aiSummary ? `
                            <div class="ai-summary">
                                <strong>🤖 AI Özet:</strong> ${news.aiSummary}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
      `;
    }).join('');
  }

  async sendErrorNotification(error) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: config.email.user,
          pass: config.email.pass
        }
      });

      const mailOptions = {
        from: config.email.user,
        to: config.email.to,
        subject: '❌ AI News Bot Hata Bildirimi',
        html: `
          <h2>🚨 Bot Hatası</h2>
          <p><strong>Hata:</strong> ${error.message}</p>
          <p><strong>Zaman:</strong> ${new Date().toLocaleString('tr-TR')}</p>
          <p><strong>Stack:</strong></p>
          <pre>${error.stack}</pre>
        `
      };

      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Hata bildirimi gönderilemedi:', emailError);
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Bot'u başlat
if (require.main === module) {
  const bot = new EnhancedAINewsBot();
  bot.init().catch(console.error);
}

module.exports = { EnhancedAINewsBot };
