const axios = require('axios');
require('dotenv').config();

const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
const telegramChatId = process.env.TELEGRAM_CHAT_ID;
const tokenSymbol = process.env.TOKEN_SYMBOL;
const priceThreshold = parseFloat(process.env.PRICE_THRESHOLD);

const mexcApiUrl = `https://api.mexc.com/api/v3/ticker/price?symbol=${tokenSymbol}`;

async function checkPrice() {
    try {
        const response = await axios.get(mexcApiUrl);
        const currentPrice = parseFloat(response.data.price);

        console.log(`Current price of ${tokenSymbol}: ${currentPrice}`);

        if (currentPrice >= priceThreshold) {
            const message = `${currentPrice} ${tokenSymbol} threshold ${priceThreshold}.`;

            await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
                chat_id: telegramChatId,
                text: message
            });

            console.log('Price alert sent to Telegram.');
        }
    } catch (error) {
        console.error('Error fetching price or sending alert:', error);
    }
}

// Check the price every hour (3600000 milliseconds)
setInterval(checkPrice, 3600000);

// Initial check
checkPrice();
