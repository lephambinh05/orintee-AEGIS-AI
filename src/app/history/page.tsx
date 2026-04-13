'use client';

import { useState } from 'react';
import { Badge } from '@/components/shared/Badge';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GlobalNav } from '@/components/shared/GlobalNav';
import { useMetamask } from '@/hooks/useMetamask';
import { useHistoryQuery } from '@/hooks/useHistory';

export default function HistoryPage() {
  const { address } = useMetamask();
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useHistoryQuery(address, page, limit);
  const history = data?.data || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 0;

  return (
    <main className="min-h-screen bg-bg-secondary flex flex-col">
      <GlobalNav />
      <div className="p-8">
      <motion.div 
        className="max-w-[1200px] mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <header className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-[24px] font-bold text-text-primary">Transaction History</h1>
            <p className="text-[14px] text-text-secondary mt-1">
              On-chain records on Base Sepolia Testnet
            </p>
          </div>
          <Badge variant="blue" className="px-3 py-1">Base Sepolia</Badge>
        </header>

        <motion.div 
          className="card !p-0 overflow-hidden"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {isLoading ? (
            <div className="p-20 flex flex-col items-center">
              <div className="animate-spin h-10 w-10 border-4 border-green-primary border-t-transparent rounded-full mb-4"></div>
              <p className="text-text-secondary">Đang tải lịch sử giao dịch...</p>
            </div>
          ) : history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#fafafa] border-b border-border">
                    <th className="p-4 text-[12px] font-semibold text-text-secondary uppercase tracking-wider">Thời gian</th>
                    <th className="p-4 text-[12px] font-semibold text-text-secondary uppercase tracking-wider">Cặp GD</th>
                    <th className="p-4 text-[12px] font-semibold text-text-secondary uppercase tracking-wider">Vị thế</th>
                    <th className="p-4 text-[12px] font-semibold text-text-secondary uppercase tracking-wider">Score</th>
                    <th className="p-4 text-[12px] font-semibold text-text-secondary uppercase tracking-wider">Kết quả</th>
                    <th className="p-4 text-[12px] font-semibold text-text-secondary uppercase tracking-wider">On-chain Proof</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f5f5f5]">
                  {history.map((record: any) => (
                    <tr key={record._id} className="hover:bg-bg-secondary transition-colors transition-duration-150">
                      <td className="p-4 text-[13px] text-text-secondary">
                        {new Date(record.createdAt).toLocaleString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="p-4 font-semibold text-text-primary">
                        {record.coinPair}
                      </td>
                      <td className="p-4">
                        <Badge variant={record.isLong ? 'success' : 'danger'}>
                          {record.position.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-4 font-bold text-[14px]">
                        <span style={{ color: record.aegisScore > 60 ? '#16a34a' : record.aegisScore > 40 ? '#d97706' : '#dc2626' }}>
                          {record.aegisScore}
                        </span>
                      </td>
                      <td className="p-4 font-semibold uppercase text-[12px]">
                        <span className={record.status === 'win' ? 'text-green-primary' : 'text-red-primary'}>
                          ● {record.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <a 
                          href={`https://sepolia.basescan.org/tx/${record.txHash}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-green-primary font-semibold hover:text-green-hover underline decoration-dotted underline-offset-4"
                        >
                          {record.shortTxHash || record.txHash.slice(0, 10)}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-20 flex flex-col items-center text-center">
              <span className="text-[48px] mb-4 opacity-50">📊</span>
              <h3 className="text-[18px] font-bold">Chưa có giao dịch nào</h3>
              <p className="text-text-secondary mt-2 mb-8">
                {!address ? "Vui lòng kết nối ví để xem lịch sử" : "Nhấn Execute Strategy để tạo giao dịch đầu tiên"}
              </p>
              <Link href="/dashboard" className="btn-primary">
                Go to Dashboard
              </Link>
            </div>
          )}

          {history.length > 0 && (
            <div className="p-4 border-t border-border flex justify-between items-center">
              <span className="text-[13px] text-text-secondary">
                Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} records
              </span>
              <div className="flex gap-2">
                <button 
                  className="btn-secondary !py-1.5 !px-3 disabled:opacity-50" 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  ← Prev
                </button>
                <button 
                  className="btn-secondary !py-1.5 !px-3 disabled:opacity-50" 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
      </div>
    </main>
  );
}
