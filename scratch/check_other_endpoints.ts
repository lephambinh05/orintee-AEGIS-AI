import axios from 'axios';

const DAA_BASE_URL = 'https://api.daathena.com/api/v2';

async function testEndpoint(path: string) {
    console.log(`\n--- Testing Path: ${path} ---`);
    try {
        const res = await axios.get(`${DAA_BASE_URL}${path}`, {
            timeout: 5000
        });
        console.log(`Result:`, JSON.stringify(res.data).substring(0, 200));
    } catch (e: any) {
        console.log(`Error:`, e.response?.data ? JSON.stringify(e.response.data) : e.message);
    }
}

async function run() {
    const paths = ['/public/wallet/currencies', '/public/trade-spot/ticker/detail?symbol=btcusdt'];
    for (const p of paths) {
        await testEndpoint(p);
    }
}

run();
