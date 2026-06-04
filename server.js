import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

app.post('/api/collect', async (req, res) => {
  try {
    const { marque, annee, modele, plaque } = req.body;
    
    const message = 🚗 بيانات جديدة:\n🔹 الماركة: ${marque}\n🔹 السنة: ${annee}\n🔹 الموديل: ${modele}\n🔹 اللوحة: ${plaque || 'غير محدد'};
    
    await axios.post(https://api.telegram.org/bot${BOT_TOKEN}/sendMessage, {
      chat_id: CHAT_ID,
      text: message
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/ping', (req, res) => {
  res.json({ status: 'live' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(Server on port ${port}));
