'use client';

import { useState, useEffect } from 'react';

export interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
}

export function useAegisPrice(symbol: string = 'BTCUSDT', interval: string = '1h') {
  const [data, setData] = useState<PriceData | null>(null);
  const [klines, setKlines] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const [priceRes, tickerRes, klinesRes] = await Promise.all([
          fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`),
          fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`),
          fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=100`)
        ]);

        const priceData = await priceRes.json();
        const tickerData = await tickerRes.json();
        const klinesData = await klinesRes.json();

        // Layer 4: Sanitize and safely parse prices
        const safeParse = (val: any) => {
          const num = parseFloat(val);
          return isNaN(num) ? 0 : num;
        };

        setData({
          symbol: priceData.symbol || symbol,
          price: safeParse(priceData.price),
          change24h: safeParse(tickerData.priceChangePercent),
        });

        // Format klines for Lightweight Charts - Layer 4: Strict Parsing
        const formattedKlines = klinesData.map((k: any) => ({
          time: (k[0] / 1000) || Date.now() / 1000,
          open: safeParse(k[1]),
          high: safeParse(k[2]),
          low: safeParse(k[3]),
          close: safeParse(k[4]),
        }));

        setKlines(formattedKlines);
        setError(null);
      } catch (err) {
        console.error('Binance API error:', err);
        setError('Using simulated data');
        // Mock data if API fails
        setData({
          symbol: symbol,
          price: 65432.10,
          change24h: 2.34
        });
      }
    };

    fetchPrice();
    const timer = setInterval(fetchPrice, 5000); // Update every 5s

    return () => clearInterval(timer);
  }, [symbol, interval]);

  return { data, klines, error };
}
