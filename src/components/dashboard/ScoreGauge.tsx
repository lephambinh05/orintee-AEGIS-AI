'use client';

import { Badge } from '../shared/Badge';
import { motion } from 'framer-motion';

interface ScoreGaugeProps {
  score: number;
}

export function ScoreGauge({ score }: ScoreGaugeProps) {
  // SVG Arc parameters
  const strokeWidth = 14;
  const radius = 80;
  const center = { x: 100, y: 100 };
  const circumference = Math.PI * radius; // Half circle
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s < 40) return '#dc2626'; // Bearish (Red)
    if (s < 60) return '#d97706'; // Neutral (Yellow)
    return '#16a34a'; // Bullish (Green)
  };

  const getLabel = (s: number) => {
    if (s < 40) return 'BEARISH';
    if (s < 60) return 'NEUTRAL';
    return 'BULLISH';
  };

  const getVariant = (s: number) => {
    if (s < 40) return 'danger';
    if (s < 60) return 'warning';
    return 'success';
  };

  return (
    <div className="card flex flex-col items-center">
      <h3 className="text-[13px] font-semibold text-text-secondary uppercase tracking-[0.05em] mb-4 self-start">
        Aegis Score
      </h3>
      
      <div className="w-[280px] h-[160px] relative flex flex-col items-center">
        <svg viewBox="0 0 200 120" className="w-full h-full transform transition-all duration-300">
          {/* Background Arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#e4e4e7"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          
          {/* Score Arc */}
          <motion.path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={getColor(score)}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </svg>
        
        <div className="absolute inset-x-0 bottom-[10px] flex flex-col items-center">
          <motion.span 
            className="text-[36px] font-bold leading-none mb-1 text-text-primary"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            key={score}
          >
            {score}
          </motion.span>
          <Badge variant={getVariant(score)} className="mt-1">
            {getLabel(score)}
          </Badge>
        </div>
      </div>
    </div>
  );
}
