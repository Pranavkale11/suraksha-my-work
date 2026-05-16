import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  isCapturing: boolean;
}

export const BehavioralCaptureIndicator: React.FC<Props> = ({ isCapturing }) => {
  return (
    <div className="flex items-center gap-2 h-4 mt-1">
      {isCapturing && (
        <>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1 h-1 bg-canara-blue rounded-full"
                animate={{ y: [0, -3, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground animate-pulse">
            Capturing behavioral signature...
          </span>
        </>
      )}
    </div>
  );
};
