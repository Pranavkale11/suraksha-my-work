import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { KeyRound, ArrowRight } from 'lucide-react';

export const HardwareTokenFallback: React.FC = () => {
  const [token, setToken] = useState(['', '', '', '', '', '']);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newToken = [...token];
    newToken[index] = value;
    setToken(newToken);
    
    // Auto focus next
    if (value && index < 5) {
      const nextInput = document.getElementById(`token-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border rounded-xl p-6 shadow-sm w-full max-w-md"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-canara-blue/10 rounded-full">
          <KeyRound className="w-6 h-6 text-canara-blue" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Hardware Token</h3>
          <p className="text-sm text-muted-foreground">Enter the 6-digit sequence from your RSA token.</p>
        </div>
      </div>

      <div className="flex gap-2 justify-between mb-6">
        {token.map((digit, i) => (
          <input
            key={i}
            id={`token-${i}`}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            className="w-12 h-14 text-center text-xl font-bold bg-background border rounded-lg focus:ring-2 focus:ring-canara-blue focus:border-transparent outline-none transition-all"
          />
        ))}
      </div>

      <button className="w-full py-2.5 bg-canara-blue text-white rounded-md font-medium hover:bg-canara-blue/90 transition-colors flex items-center justify-center gap-2">
        Authenticate <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
};
