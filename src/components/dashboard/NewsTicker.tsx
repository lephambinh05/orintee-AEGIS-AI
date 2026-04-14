'use client';

const NEWS = [
  "Bitcoin ETF inflows hit $500M amid bullish sentiment",
  "Fed holds rates — crypto markets react positively",
  "Base Network TVL surpasses $2.5B milestone",
  "SOL ecosystem sees 40% surge in developer activity",
  "On-chain data signals accumulation phase for BTC"
];

export function NewsTicker() {
  return (
    <div className="flex-1 overflow-hidden relative h-full flex items-center border-l border-r border-border px-4">
      <div className="whitespace-nowrap flex gap-12 animate-[marquee_30s_linear_infinite] hover:[animation-play-state:paused]">
        {NEWS.concat(NEWS).map((n, i) => (
          <span key={i} className="text-[12px] text-text-secondary">
            📰 {n}
          </span>
        ))}
      </div>
    </div>
  );
}
