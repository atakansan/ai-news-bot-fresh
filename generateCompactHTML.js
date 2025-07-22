// Kompakt HTML email template'i
function generateCompactHTML(allNews, analytics, startTime) {
  const today = new Date().toLocaleDateString('tr-TR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Kategori emoji'leri
  const categoryEmojis = {
    'startup': '🚀',
    'tech': '🤖', 
    'global': '🌍',
    'local': '🏠'
  };

  // News by category
  const categories = [...new Set(allNews.map(news => news.category))];
  
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 700px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(45deg, #667eea, #764ba2); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 2em; }
        .content { padding: 30px; }
        .analytics { background: #f8f9fa; padding: 20px; margin-bottom: 30px; border-radius: 8px; }
        .analytics-grid { display: flex; justify-content: space-around; flex-wrap: wrap; }
        .analytics-item { text-align: center; margin: 10px; }
        .analytics-number { font-size: 2em; font-weight: bold; color: #667eea; }
        .section-title { font-size: 1.3em; font-weight: bold; color: #333; margin: 25px 0 15px 0; border-bottom: 2px solid #667eea; padding-bottom: 5px; }
        .news-item { background: white; border: 1px solid #eee; border-radius: 8px; padding: 20px; margin-bottom: 15px; }
        .news-title { font-size: 1.1em; font-weight: bold; margin-bottom: 10px; }
        .news-title a { color: #667eea; text-decoration: none; }
        .news-meta { font-size: 0.9em; color: #666; }
        .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 0.8em; margin-right: 5px; }
        .badge-source { background: #e3f2fd; color: #1976d2; }
        .badge-category { background: #f3e5f5; color: #7b1fa2; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 AI News Bot</h1>
            <p>Daily AI News - ${today}</p>
        </div>

        <div class="content">
            <div class="analytics">
                <div class="analytics-grid">
                    <div class="analytics-item">
                        <div class="analytics-number">${allNews.length}</div>
                        <div>Total News</div>
                    </div>
                    <div class="analytics-item">
                        <div class="analytics-number">${categories.length}</div>
                        <div>Categories</div>
                    </div>
                    <div class="analytics-item">
                        <div class="analytics-number">${Object.keys(analytics.trendingTopics || {}).length}</div>
                        <div>Topics</div>
                    </div>
                </div>
            </div>

            ${categories.map(category => {
              const categoryNews = allNews.filter(news => news.category === category);
              return `
                <div class="section-title">
                    ${categoryEmojis[category] || '📰'} ${category.toUpperCase()} (${categoryNews.length})
                </div>
                ${categoryNews.map(news => `
                    <div class="news-item">
                        <div class="news-title">
                            <a href="${news.link}" target="_blank">${news.title}</a>
                        </div>
                        <div class="news-meta">
                            <span class="badge badge-source">${news.source}</span>
                            <span class="badge badge-category">${news.category}</span>
                        </div>
                    </div>
                `).join('')}
              `;
            }).join('')}
        </div>

        <div class="footer">
            🤖 AI News Bot v3.0 | Runtime: ${Math.round((Date.now() - startTime) / 1000)}s<br>
            ${new Date().toLocaleString('tr-TR')}
        </div>
    </div>
</body>
</html>`;
}

module.exports = { generateCompactHTML };