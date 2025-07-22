const nodemailer = require('nodemailer');

async function testGmailConnection() {
  console.log('🔍 Gmail SMTP connection testi başlıyor...');
  
  const config = {
    user: 'atakansan2012@gmail.com',
    pass: 'jwzuwacigxctzmjv'
  };
  
  console.log('📧 Email config:', {
    user: config.user,
    passLength: config.pass.length
  });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.user,
      pass: config.pass
    },
    debug: true, // Enable debug output
    logger: true // Log to console
  });

  try {
    console.log('🔗 SMTP connection verify ediliyor...');
    const result = await transporter.verify();
    console.log('✅ SMTP Connection başarılı!', result);
    
    console.log('📤 Test email gönderiliyor...');
    const testResult = await transporter.sendMail({
      from: config.user,
      to: 'atakan_san@yahoo.com',
      subject: '🧪 Gmail SMTP Test - ' + new Date().toLocaleTimeString(),
      text: `
GMAIL SMTP CONNECTION TEST

Bu email Gmail SMTP connection testinden geliyor.
Zaman: ${new Date().toLocaleString('tr-TR')}

Eğer bu email'i görüyorsanız:
✅ Gmail SMTP connection çalışıyor
✅ App password geçerli
✅ Email gönderim başarılı

Test ID: ${Math.random().toString(36).substr(2, 9)}
      `,
      html: `
<div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
  <div style="background: white; padding: 30px; border-radius: 10px; max-width: 500px; margin: 0 auto;">
    <h2 style="color: #333;">🧪 Gmail SMTP Test</h2>
    <p>Bu email Gmail SMTP connection testinden geliyor.</p>
    <p><strong>Zaman:</strong> ${new Date().toLocaleString('tr-TR')}</p>
    
    <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p><strong>Eğer bu email'i görüyorsanız:</strong></p>
      <ul>
        <li>✅ Gmail SMTP connection çalışıyor</li>
        <li>✅ App password geçerli</li>
        <li>✅ Email gönderim başarılı</li>
      </ul>
    </div>
    
    <p><small>Test ID: ${Math.random().toString(36).substr(2, 9)}</small></p>
  </div>
</div>
      `
    });
    
    console.log('✅ Test email başarıyla gönderildi!');
    console.log('📧 Response:', testResult.response);
    console.log('📧 Message ID:', testResult.messageId);
    console.log('📧 Accepted:', testResult.accepted);
    console.log('📧 Rejected:', testResult.rejected);
    
    console.log('\n🎉 Gmail SMTP tamamen çalışıyor!');
    console.log('📍 Yahoo mail kutunuzu kontrol edin!');
    
  } catch (error) {
    console.error('❌ Gmail SMTP hatası:', error);
    console.error('Error details:', error.message);
    console.error('Error code:', error.code);
  }
}

testGmailConnection();