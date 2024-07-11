require('dotenv').config();
const axios = require('axios');
const http = require('http');

const SYMBOL = process.env.TRADING_PAIR || 'WJXN_USDT';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const PORT = process.env.PORT || 8080;

async function getTokenPrice(symbol) {
  try {
    const url = `https://www.mexc.com/open/api/v2/market/ticker?symbol=${symbol}`;
    const response = await axios.get(url);
    if (response.data.code === 200 && response.data.data.length > 0) {
      return parseFloat(response.data.data[0].last);
    }
  } catch (error) {
    console.error('Error fetching price:', error.message);
  }
  return null;
}

async function sendTelegramMessage(message) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('Telegram configuration not found. Skipping notification.');
    return;
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    await axios.post(url, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message
    });
  } catch (error) {
    console.error('Error sending Telegram message:', error.message);
  }
}

async function checkPrice() {
  const price = await getTokenPrice(SYMBOL);
  if (price !== null) {
    const currentTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    const message = `$${price.toFixed(4)}`;
    console.log(message);
    await sendTelegramMessage(message);
  } else {
    const errorMessage = `Failed to fetch price for ${SYMBOL}`;
    console.log(errorMessage);
    await sendTelegramMessage(errorMessage);
  }
}

function startWorker() {
  console.log(`Starting price tracker for ${SYMBOL}`);

  // Run the price check immediately
  checkPrice();

  // Then run it every hour
  setInterval(checkPrice, 3600000);
}

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startWorker();
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully.');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully.');
  server.close(() => {
    process.exit(0);
  });
});
