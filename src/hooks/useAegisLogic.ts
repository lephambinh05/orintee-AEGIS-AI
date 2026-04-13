'use client';

import { useMemo } from 'react';

export function useAegisLogic(currentPrice: number | undefined, klines: any[]) {
  const calculations = useMemo(() => {
    if (!currentPrice || klines.length === 0) return null;

    // Simple RSI Approximation (Last 14 closes)
    const calculateRSI = (data: any[]) => {
      if (data.length < 15) return 50;
      let gains = 0;
      let losses = 0;
      for (let i = data.length - 14; i < data.length; i++) {
        const diff = data[i].close - data[i - 1].close;
        if (diff >= 0) gains += diff;
        else losses -= diff;
      }
      if (losses === 0) return 100;
      const rs = gains / losses;
      return 100 - (100 / (1 + rs));
    };

    const rsi = calculateRSI(klines);
    
    // Mock On-Chain & Sentiment as per prompt instructions
    const generateOnChain = () => 40 + Math.random() * 40; // 40-80
    const getSentiment = () => 30 + Math.random() * 50;   // 30-80
    
    const onChain = generateOnChain();
    const sentiment = getSentiment();
    
    // Aegis Score Formula - Layer 4: Clamp [0, 100]
    const rawScore = Math.round(rsi * 0.4 + onChain * 0.3 + sentiment * 0.3);
    const aegisScore = Math.max(0, Math.min(100, rawScore));
    
    // Position type based on score
    const isLong = aegisScore >= 50;

    // Risk Guard Formula
    const atr = currentPrice * 0.02;
    const entryPrice = currentPrice;
    
    // Layer 4: Validate SL < Entry < TP for Long, TP < Entry < SL for Short
    let stopLoss = isLong ? entryPrice - (atr * 2) : entryPrice + (atr * 2);
    let takeProfit = isLong ? entryPrice + (atr * 3) : entryPrice - (atr * 3);

    // Final safety clamps to ensure logical ordering
    if (isLong) {
      if (stopLoss >= entryPrice) stopLoss = entryPrice * 0.95;
      if (takeProfit <= entryPrice) takeProfit = entryPrice * 1.10;
    } else {
      if (stopLoss <= entryPrice) stopLoss = entryPrice * 1.05;
      if (takeProfit >= entryPrice) takeProfit = entryPrice * 0.90;
    }

    return {
      rsi,
      onChain,
      sentiment,
      aegisScore,
      entryPrice,
      stopLoss,
      takeProfit,
      isLong
    };
  }, [currentPrice, klines]);

  return calculations;
}
