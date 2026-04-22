import axios from 'axios';

const DAA_BASE_URL = 'https://api.daathena.com/api/v2';
const API_KEY = 'd8425488094ebe8396ae872ea7137c6e';

async function testSymbol(symbol: string) {
    console.log(`\n--- Testing Symbol: ${symbol} ---`);
    try {
        const res = await axios.get(`${DAA_BASE_URL}/public/trade-spot/ticker/24h?symbol=${symbol}`, {
            headers: { 'Authorization': API_KEY },
            timeout: 5000
        });
        console.log(`Result:`, JSON.stringify(res.data));
    } catch (e) {
        if (axios.isAxiosError(e)) {
            console.log(`Error:`, e.response?.data ? JSON.stringify(e.response.data) : e.message);
        } else {
            console.log(`Error:`, e instanceof Error ? e.message : 'Unknown error');
        }
    }
}

async function run() {
    const symbols = ['btcusdt', 'BTCUSDT', 'ethusdt', 'ETHUSDT', 'solusdt', 'SOLUSDT'];
    for (const s of symbols) {
        await testSymbol(s);
    }
}

run();
