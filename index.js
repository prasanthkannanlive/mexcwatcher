const http = require('http');
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
            const message = `${currentPrice} : ${tokenSymbol}  threshold  ${priceThreshold}.`;

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

// Create an HTTP server
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Price alert service is running\n');
});

// Listen on the port provided by the environment or default to 3000
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
