'use client';

import { Badge } from '../shared/Badge';
import { NewsTicker } from './NewsTicker';
import { useAegisStore } from '@/store/useStore';

export function TopBar() {
  const { selectedAsset, setSelectedAsset, priceData } = useAegisStore();

  return (
    <div className="h-[56px] bg-white border-b border-border flex items-center px-6 gap-4">
      <div className="flex items-center gap-3 min-w-[320px]">
        <select 
          className="select !h-8 !py-0 w-[140px] font-semibold"
          value={selectedAsset}
          onChange={(e) => setSelectedAsset(e.target.value)}
        >
          <option value="BTCUSDT">BTCUSDT</option>
          <option value="ETHUSDT">ETHUSDT</option>
          <option value="SOLUSDT">SOLUSDT</option>
        </select>

        <div className="flex items-center gap-2">
          <span className="text-[18px] font-bold text-text-primary">
            ${priceData?.price?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '---'}
          </span>
          {priceData?.change24h !== undefined && (
            <Badge variant={priceData.change24h >= 0 ? 'success' : 'danger'}>
              {priceData.change24h >= 0 ? '+' : ''}{priceData.change24h}%
            </Badge>
          )}
        </div>
      </div>

      <NewsTicker />
    </div>
  );
}
