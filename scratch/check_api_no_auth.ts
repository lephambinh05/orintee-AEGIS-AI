import axios from 'axios';

const DAA_BASE_URL = 'https://api.daathena.com/api/v2';

async function testNoAuth(symbol: string) {
    console.log(`\n--- Testing Symbol (No Auth): ${symbol} ---`);
    try {
        const res = await axios.get(`${DAA_BASE_URL}/public/trade-spot/ticker/24h?symbol=${symbol}`, {
            timeout: 5000
        });
        console.log(`Result:`, JSON.stringify(res.data));
    } catch (e: any) {
        console.log(`Error:`, e.response?.data ? JSON.stringify(e.response.data) : e.message);
    }
}

async function run() {
    const symbols = ['btcusdt', 'BTCUSDT'];
    for (const s of symbols) {
        await testNoAuth(s);
    }
}

run();
