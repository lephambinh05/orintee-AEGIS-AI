'use client';

import { Badge } from '../shared/Badge';

export function Intelligence() {
  const rows = [
    { icon: '💰', label: 'Dòng tiền', status: 'Positive', text: 'Tích cực', variant: 'success' },
    { icon: '📰', label: 'Sentiment', status: 'Neutral', text: 'Trung lập', variant: 'warning' },
    { icon: '📈', label: 'Kỹ thuật', status: 'Positive', text: 'Tích cực', variant: 'success' },
  ];

  return (
    <div className="card">
      <h3 className="font-semibold text-[14px] mb-4">Market Intelligence</h3>
      <div className="divide-y divide-[#f5f5f5]">
        {rows.map((row, i) => (
          <div key={i} className="flex justify-between items-center py-2.5 first:pt-0 last:pb-0">
            <div className="flex items-center gap-2">
              <span className="text-[14px]">{row.icon}</span>
              <span className="text-[13px] text-text-secondary">{row.label}</span>
            </div>
            <Badge variant={row.variant as any}>{row.text}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
