import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  score: number; // 0.0 to 1.0
}

export const QualityScoreGauge: React.FC<Props> = ({ score }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - score * circumference;

  let color = '#DC2626'; // canara-red
  if (score > 0.7) color = '#00A86B'; // canara-green
  else if (score > 0.4) color = '#FF6B35'; // canara-orange

  return (
    <div className="relative flex flex-col items-center justify-center w-32 h-32">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          className="text-muted stroke-current"
          strokeWidth="8"
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
        />
        <motion.circle
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-bold" style={{ color }}>
          {Math.round(score * 100)}%
        </span>
        <span className="text-[10px] text-muted-foreground">Confidence</span>
      </div>
    </div>
  );
};
