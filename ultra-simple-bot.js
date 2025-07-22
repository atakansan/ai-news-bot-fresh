const nodemailer = require('nodemailer');
const config = require('./enhanced-config.js');

async function sendUltraSimpleBot() {
  console.log('🚀 Ultra Simple Bot test başlıyor...');
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.email.user,
      pass: config.email.pass
    }
  });

  // Test email formatını taklit et
  const simpleEmail = {
    from: config.email.user,
    to: 'atakan_san@yahoo.com',
    subject: 'AI News Update - ' + new Date().toLocaleTimeString(),
    text: `
DAILY AI NEWS UPDATE

Bu email AI News Bot'undan geliyor.
Zaman: ${new Date().toLocaleString('tr-TR')}

Günün AI haberleri:

1. 🇹🇷 Webrazzi AI - Yapay zeka gelişmeleri
2. 🇺🇸 TechCrunch AI - Latest AI innovations  
3. 🇫🇷 ActuIA - Intelligence artificielle news
4. 🇩🇪 All-AI.de - KI Neuigkeiten

Bu email'i alıyorsanız:
✅ AI News Bot çalışıyor
✅ Email delivery başarılı
✅ Yahoo filtering geçildi

Bot ID: ${Math.random().toString(36).substr(2, 9)}
    `,
    html: `
<div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
  <div style="background: white; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #333;">🤖 Daily AI News Update</h2>
    <p>Bu email AI News Bot'undan geliyor.</p>
    <p><strong>Zaman:</strong> ${new Date().toLocaleString('tr-TR')}</p>
    
    <h3 style="color: #667eea;">Günün AI Haberleri:</h3>
    <ul style="line-height: 1.8;">
      <li>🇹🇷 <strong>Webrazzi AI</strong> - Yapay zeka gelişmeleri</li>
      <li>🇺🇸 <strong>TechCrunch AI</strong> - Latest AI innovations</li>
      <li>🇫🇷 <strong>ActuIA</strong> - Intelligence artificielle news</li>
      <li>🇩🇪 <strong>All-AI.de</strong> - KI Neuigkeiten</li>
    </ul>
    
    <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p><strong>Bu email'i alıyorsanız:</strong></p>
      <ul>
        <li>✅ AI News Bot çalışıyor</li>
        <li>✅ Email delivery başarılı</li>
        <li>✅ Yahoo filtering geçildi</li>
      </ul>
    </div>
    
    <p><small>Bot ID: ${Math.random().toString(36).substr(2, 9)}</small></p>
  </div>
</div>
    `
  };

  try {
    console.log('📤 Ultra simple bot email gönderiliyor...');
    const result = await transporter.sendMail(simpleEmail);
    console.log('✅ Ultra simple bot email gönderildi!');
    console.log('📧 Response:', result.response);
    console.log('📧 Message ID:', result.messageId);
    
    console.log('\n🔔 Yahoo mail kutunuzu kontrol edin!');
    
  } catch (error) {
    console.error('❌ Email gönderme hatası:', error);
  }
}

sendUltraSimpleBot();