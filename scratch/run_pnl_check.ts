import axios from 'axios';

const LOCAL_URL = 'http://localhost:3000/api/cron/check-status';
const SECRET_KEY = 'aegis_cron_secret_2024';

async function runCronTest() {
    console.log('--- Running Automated PnL Check ---');
    try {
        const res = await axios.get(LOCAL_URL, {
            headers: {
                'Authorization': `Bearer ${SECRET_KEY}`
            }
        });
        console.log('Result:', JSON.stringify(res.data, null, 2));
    } catch (e: any) {
        console.log('Error:', e.response?.data ? JSON.stringify(e.response.data) : e.message);
    }
}

runCronTest();
