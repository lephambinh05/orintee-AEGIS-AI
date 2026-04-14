'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';

interface AegisChartProps {
  data: any[];
  symbol: string;
  timeframe: string;
  onTimeframeChange: (tf: string) => void;
}

export function AegisChart({ data, symbol, timeframe, onTimeframeChange }: AegisChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !chartContainerRef.current || !data || data.length === 0) return;

    // console.log(`[AegisChart] Initializing with ${data.length} candles`);

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#ffffff' },
        textColor: '#71717a',
        fontFamily: "'Be Vietnam Pro', sans-serif",
      },
      grid: {
        vertLines: { color: '#f5f5f5' },
        horzLines: { color: '#f5f5f5' },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight || 400,
      timeScale: {
        borderColor: '#e4e4e7',
      },
      rightPriceScale: {
        borderColor: '#e4e4e7',
      },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#16a34a',
      downColor: '#dc2626',
      borderVisible: false,
      wickUpColor: '#16a34a',
      wickDownColor: '#dc2626',
    });

    try {
      candlestickSeries.setData(data);
      chart.timeScale().fitContent();
    } catch (e) {
      console.error('[AegisChart] setData failed:', e);
    }

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [mounted, data]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <span className="font-semibold text-[14px] uppercase">{symbol.replace('USDT', '/USDT')} · {timeframe.toUpperCase()}</span>
        <div className="flex gap-2">
          {['1h', '4h', '1d'].map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              className={tf === timeframe 
                ? 'bg-text-primary text-white text-[12px] font-semibold px-2.5 py-1 rounded-[4px]' 
                : 'text-text-secondary text-[12px] font-semibold px-2.5 py-1 hover:bg-bg-secondary rounded-[4px] transition-colors'}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1" ref={chartContainerRef} />
    </div>
  );
}
