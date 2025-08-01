// Manual trigger endpoint - sadece test için
export default async function handler(req, res) {
  // Güvenlik kontrolü - sadece POST isteklerine izin ver
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Daily news handler'ı import et ve çalıştır
    const dailyNewsHandler = require('./daily-news').default;
    
    // Fake request/response objesi oluştur
    const fakeReq = {};
    const fakeRes = {
      status: (code) => ({
        json: (data) => {
          res.status(code).json({
            ...data,
            triggeredManually: true,
            note: "This was triggered manually for testing"
          });
        }
      })
    };
    
    // Daily news'i çalıştır
    await dailyNewsHandler(fakeReq, fakeRes);
    
  } catch (error) {
    console.error('Manual trigger error:', error);
    res.status(500).json({ 
      error: error.message,
      triggeredManually: true 
    });
  }
}