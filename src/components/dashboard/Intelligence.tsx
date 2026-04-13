'use client';

import { Badge } from '../shared/Badge';

interface IntelligenceProps {
  insights?: {
    cashflow: { label: string; value: 'positive' | 'neutral' | 'negative' };
    sentiment: { label: string; value: 'positive' | 'neutral' | 'negative' };
    technical: { label: string; value: 'positive' | 'neutral' | 'negative' };
  };
}

export function Intelligence({ insights }: IntelligenceProps) {
  const getDisplay = (val: 'positive' | 'neutral' | 'negative' | undefined) => {
    switch (val) {
      case 'positive': return { text: 'Tích cực', variant: 'success' };
      case 'negative': return { text: 'Tiêu cực', variant: 'danger' };
      default: return { text: 'Trung lập', variant: 'warning' };
    }
  };

  const rows = [
    { 
      icon: '💰', 
      label: insights?.cashflow.label || 'Dòng tiền', 
      ...getDisplay(insights?.cashflow.value) 
    },
    { 
      icon: '📰', 
      label: insights?.sentiment.label || 'Sentiment', 
      ...getDisplay(insights?.sentiment.value) 
    },
    { 
      icon: '📈', 
      label: insights?.technical.label || 'Kỹ thuật', 
      ...getDisplay(insights?.technical.value) 
    },
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
