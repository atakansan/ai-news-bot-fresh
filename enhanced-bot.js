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

    // Simple email template that works with Yahoo
    return `
<div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
  <div style="background: white; padding: 30px; border-radius: 10px; max-width: 700px; margin: 0 auto;">
    <h2 style="color: #333; text-align: center;">🤖 AI News Daily</h2>
    <p style="text-align: center; color: #666;">${today}</p>
    
    <div style="background: #667eea; color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
      <h3 style="margin: 0;">📊 Today's Summary</h3>
      <p style="margin: 10px 0 0 0;">Found <strong>${this.allNews.length} AI news</strong> from 🇺🇸 🇫🇷 🇩🇪 🇹🇷 🇳🇱 (v${Date.now()})</p>
    </div>
    
    <div style="margin: 30px 0;">
      ${this.generateSimpleNewsList()}
    </div>
    
    <!-- Belgian news section removed for stability -->
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; color: #666; font-size: 14px;">
      🤖 AI News Bot v3.0 | Runtime: ${Math.round((Date.now() - this.startTime) / 1000)}s<br>
      ${new Date().toLocaleString('en-US')}<br><br>
      📧 Contact <strong>atakansan2012@gmail.com</strong> for any suggestion.
    </div>
  </div>
</div>`;
  }
  generateSimpleNewsList() {
    const languages = ['en', 'fr', 'nl', 'de', 'tr'];
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
      return `
        <div style="margin-bottom: 30px;">
          <h3 style="color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
            ${langInfo.flag} ${langInfo.name} ${langInfo.emoji} (${languageNews.length})
          </h3>
          ${languageNews.map((news, index) => `
            <div style="background: #f8f9ff; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #667eea;">
              <div style="font-weight: bold; margin-bottom: 8px;">
                <a href="${news.link}" target="_blank" style="color: #333; text-decoration: none;">${news.title}</a>
              </div>
              <div style="font-size: 12px; color: #666;">
                ${this.getCountryFlag(news.source)} <strong>${news.source}</strong> | ${news.category} | ⭐ ${news.priority}
              </div>
            </div>
          `).join('')}
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
