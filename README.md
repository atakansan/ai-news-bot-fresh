# AI News Bot

AI haberlerini toplar ve email gönderir.

## Özellikler
- Türkçe ve İngilizce AI haber siteleri
- Otomatik email gönderimi
- Vercel'de çalışır
- Her sabah 5'te otomatik çalışır (Belçika saati)

## 🚀 Vercel Kurulum

### 1. Environment Variables (Zorunlu)
Vercel Dashboard > Settings > Environment Variables:
- `EMAIL_USER` - Gmail adresiniz
- `EMAIL_PASS` - Gmail uygulama şifreniz

### 2. Güvenlik Ayarları (Önemli!)
Settings > Security:
- "Vercel Authentication" → **Disable**
- "Password Protection" → **Disable**

### 3. Test Endpoint'leri
- `/api/test` - Deployment kontrolü (GET)
- `/api/trigger` - Manuel bot tetikleme (POST)

### 4. Cron Schedule
- Her gün sabah 5:00 Belçika saati (UTC 4:00 kış, UTC 3:00 yaz)

Boom SCHAKALA! 🚀// Fresh deployment Tue 22 Jul 2025 09:47:21 CEST
# Force deploy Sat 26 Jul 2025 10:10:31 CEST
# Emergency deployment Sat 26 Jul 2025 19:30:00 CEST - Fix flags production issue
