'use client';

import { Badge } from '../shared/Badge';

interface RiskGuardProps {
  entry: number | undefined;
  stopLoss: number | undefined;
  takeProfit: number | undefined;
}

export function RiskGuard({ entry, stopLoss, takeProfit }: RiskGuardProps) {
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[18px]">🛡️</span>
        <h3 className="font-semibold text-[14px]">Risk Guard</h3>
      </div>
      
      <div className="space-y-2">
        <div className="bg-[#fafafa] rounded-[6px] p-[10px_12px] flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-[12px] text-text-secondary">Vùng Mua</span>
            <span className="text-[15px] font-bold text-text-primary">
              ${entry?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <span className="bg-[#f5f5f5] text-[#71717a] text-[10px] font-bold px-1.5 py-0.5 rounded-[3px]">ENTRY</span>
        </div>

        <div className="bg-[#fafafa] rounded-[6px] p-[10px_12px] flex justify-between items-center border-l-[3px] border-red-primary">
          <div className="flex items-center gap-3">
            <span className="text-red-primary text-[14px]">↓</span>
            <div className="flex flex-col">
              <span className="text-[12px] text-text-secondary">Điểm Cắt Lỗ</span>
              <span className="text-[15px] font-bold text-red-primary">
                ${stopLoss?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          <Badge variant="danger">STOP</Badge>
        </div>

        <div className="bg-[#fafafa] rounded-[6px] p-[10px_12px] flex justify-between items-center border-l-[3px] border-green-primary">
          <div className="flex items-center gap-3">
            <span className="text-green-primary text-[14px]">↑</span>
            <div className="flex flex-col">
              <span className="text-[12px] text-text-secondary">Điểm Chốt Lời</span>
              <span className="text-[15px] font-bold text-green-primary">
                ${takeProfit?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          <Badge variant="success">TARGET</Badge>
        </div>
      </div>
    </div>
  );
}
