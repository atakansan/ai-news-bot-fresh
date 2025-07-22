const nodemailer = require('nodemailer');
const config = require('./enhanced-config.js');

async function testSimpleEmail() {
  console.log('🧪 Basit email test başlıyor...');
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.email.user,
      pass: config.email.pass
    }
  });

  // Connection test
  console.log('🔍 SMTP connection test...');
  try {
    await transporter.verify();
    console.log('✅ SMTP OK');
  } catch (error) {
    console.error('❌ SMTP Error:', error.message);
    return;
  }

  // Kişisel email adresinize test gönder
  const testEmail = {
    from: config.email.user,
    to: 'atakansan2012@gmail.com',
    subject: '🧪 TEST EMAIL - ' + new Date().toLocaleTimeString(),
    text: `
Merhaba Asan,

Bu basit bir test email'dir.
Zaman: ${new Date().toLocaleString('tr-TR')}
Bot: AI News Bot Test

Eğer bu email'i görüyorsanız, SMTP çalışıyor demektir.

Test ID: ${Math.random().toString(36).substr(2, 9)}
    `
  };

  try {
    console.log('📤 Test email gönderiliyor...');
    const result = await transporter.sendMail(testEmail);
    console.log('✅ Test email gönderildi!');
    console.log('📧 Response:', result.response);
    console.log('📧 Message ID:', result.messageId);
    
    console.log('\n🔔 Şimdi email kutunuzu kontrol edin:');
    console.log('1. Inbox');
    console.log('2. Spam/Junk folder');
    console.log('3. Gmail filters');
    
  } catch (error) {
    console.error('❌ Email gönderme hatası:', error);
  }
}

testSimpleEmail();