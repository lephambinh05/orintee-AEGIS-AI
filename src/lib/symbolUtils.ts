/**
 * symbolUtils.ts
 * Helper utilities for symbol conversion between UI and DAA API formats.
 */

const ALLOWED = ['btcusdt', 'ethusdt', 'solusdt'];

/**
 * Converts a UI trading pair to DAA API format.
 * Example: "BTC/USDT" -> "btcusdt"
 */
export function toDaaSymbol(pair: string): string {
  if (!pair) return '';
  return pair.replace('/', '').toLowerCase();
}

/**
 * Converts a DAA API symbol to UI format.
 * Example: "btcusdt" -> "BTC/USDT"
 */
export function toUiSymbol(symbol: string): string {
  if (!symbol) return '';
  const s = symbol.toLowerCase();
  if (s.endsWith('usdt')) {
    const base = s.slice(0, -4).toUpperCase();
    return `${base}/USDT`;
  }
  return symbol.toUpperCase();
}

/**
 * Checks if a symbol is within the allowed set.
 */
export function isValidSymbol(s: string): boolean {
  if (!s) return false;
  return ALLOWED.includes(s.toLowerCase());
}
