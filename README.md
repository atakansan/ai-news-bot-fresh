# 🤖 AI News Bot

Automated AI news aggregator that collects articles from multiple sources and sends daily email digests.

## ✨ Features

- 📰 Scrapes AI news from 15+ sources (Turkish, English, French, Dutch, German)
- 📧 Automated daily email notifications
- 🌍 Multi-language support
- ⏰ Scheduled delivery at 5:00 AM Belgium time
- 🚀 Serverless deployment on Vercel
- 📊 News categorization and analytics

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Scraping**: Axios + Cheerio
- **Email**: Nodemailer (Gmail)
- **Deployment**: Vercel
- **Schedule**: Vercel Cron Jobs

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/atakansan/ai-news-bot-fresh.git
cd ai-news-bot-fresh
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password
```

4. Test locally:
```bash
npm start
```

## 🚀 Vercel Deployment

1. **Deploy to Vercel:**
```bash
vercel
```

2. **Set Environment Variables:**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add `EMAIL_USER` and `EMAIL_PASS`

3. **Disable Authentication:**
   - Go to Settings → Security
   - Disable "Vercel Authentication"
   - Disable "Password Protection"

## 🔧 Configuration

Edit `enhanced-config.js` to:
- Add/remove news sources
- Update email recipients
- Modify scraping settings
- Adjust AI keywords

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/daily-news` | GET | Cron job endpoint (auto-triggered) |
| `/api/test` | GET | Test deployment status |
| `/api/trigger` | POST | Manually trigger the bot |

## 📅 Cron Schedule

The bot runs automatically at **5:00 AM Belgium time** every day.
- Winter: UTC 04:00
- Summer: UTC 03:00

## 🧪 Testing

Test the deployment:
```bash
curl https://your-deployment.vercel.app/api/test
```

Manually trigger the bot:
```bash
curl -X POST https://your-deployment.vercel.app/api/trigger
```

## 📝 License

MIT © Atakan San

---

Made with ❤️ in Belgium 🇧🇪