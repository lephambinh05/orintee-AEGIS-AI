/**
 * Wilder's RSI formula
 * @param closes array of close prices
 * @param period period to calculate (default 14)
 */
export function calcRSI(closes: number[], period: number = 14): number {
  if (closes.length < period + 1) return 0;

  let gains = 0;
  let losses = 0;

  // Calculate initial averages
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  // Calculate subsequent averages using Wilder's smoothing
  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const currentGain = diff > 0 ? diff : 0;
    const currentLoss = diff < 0 ? -diff : 0;

    avgGain = (avgGain * (period - 1) + currentGain) / period;
    avgLoss = (avgLoss * (period - 1) + currentLoss) / period;
  }

  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));

  return Math.min(Math.max(rsi, 0), 100);
}

/**
 * calcATR - True Range = max(high-low, |high-prevClose|, |low-prevClose|)
 * ATR = average of TR over period
 */
export function calcATR(candles: { high: number; low: number; close: number }[], period: number = 14): number {
  if (candles.length < period + 1) {
    return candles.length > 0 ? candles[candles.length - 1].close * 0.02 : 0;
  }

  const trueRanges: number[] = [];

  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevClose = candles[i - 1].close;

    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
    trueRanges.push(tr);
  }

  // Simple average of the last 'period' True Ranges
  const lastTRs = trueRanges.slice(-period);
  const atr = lastTRs.reduce((sum, tr) => sum + tr, 0) / period;

  return atr;
}

/**
 * calcEMA - Exponential Moving Average
 */
export function calcEMA(values: number[], period: number): number[] {
  if (values.length < period) return [];

  const k = 2 / (period + 1);
  const emaValues: number[] = [];

  // Initialize with SMA
  let ema = values.slice(0, period).reduce((sum, val) => sum + val, 0) / period;
  emaValues.push(ema);

  for (let i = period; i < values.length; i++) {
    ema = (values[i] - ema) * k + ema;
    emaValues.push(ema);
  }

  return emaValues;
}

/**
 * Mock sentiment based on symbol and time shifts every 5 minutes
 */
export function calcSentiment(symbol: string): number {
  const symbolHash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const timeWindow = Math.floor(Date.now() / (5 * 60 * 1000)); // 5 minutes window
  
  // Deterministic "random" 0-100
  const seed = (symbolHash + timeWindow) % 101;
  return seed;
}

/**
 * Weighted Aegis Score: 40% Technical (RSI), 30% On-chain, 30% Sentiment
 */
export function calcScore(rsi: number, onchain: number, sentiment: number): number {
  const score = rsi * 0.4 + onchain * 0.3 + sentiment * 0.3;
  return Math.min(Math.max(Math.round(score), 0), 100);
}
