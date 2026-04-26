import axios from 'axios';

export function initCron() {
  if (typeof window !== 'undefined') return; // Only run on server
  if ((global as any)._cronInitialized) return;
  (global as any)._cronInitialized = true;

  console.log('⏳ [CRON] Background PnL Check initialized (runs every 5 minutes).');

  // Set interval to run every 5 minutes (300,000 ms)
  setInterval(async () => {
    try {
      // GỌi API nội bộ để check
      const res = await axios.get('http://localhost:3000/api/cron/check-status', {
        // headers: { 'Authorization': `Bearer ${process.env.CRON_SECRET_KEY}` }
      });
      
      if (res.data?.results) {
        const { processed, wins, losses, stillPending } = res.data.results;
        // Chỉ log nếu có lệnh đang pending được xử lý
        if (processed > 0) {
           console.log(`✅ [CRON] PnL Check Done: ${wins} wins, ${losses} losses, ${stillPending} pending.`);
        }
      }
    } catch (e: any) {
      console.log('❌ [CRON] Failed to run background PnL check:', e.message);
    }
  }, 5 * 60 * 1000);
}
