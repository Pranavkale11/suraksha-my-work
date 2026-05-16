import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Info, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onConsent: () => void;
  onOptOut: () => void;
}

export const ConsentModal: React.FC<Props> = ({ isOpen, onConsent, onOptOut }) => {
  const [agreed, setAgreed] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-card w-full max-w-lg rounded-xl shadow-2xl border p-6 m-4"
          >
            <div className="flex items-center gap-3 mb-4 text-canara-blue">
              <Shield className="w-8 h-8" />
              <h2 className="text-2xl font-bold text-foreground">Behavioral Authentication</h2>
            </div>
            
            <p className="text-muted-foreground mb-6">
              To provide zero-trust security, SuRaksha MAPS establishes a unique behavioral signature based on how you interact with your device.
            </p>

            <div className="space-y-4 mb-6">
              <div className="bg-secondary/50 p-4 rounded-lg flex gap-3 items-start">
                <CheckCircle2 className="w-5 h-5 text-canara-green mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-medium text-sm text-foreground">What we capture:</h4>
                  <ul className="text-sm text-muted-foreground list-disc list-inside mt-1">
                    <li>Keystroke rhythm (dwell and flight times)</li>
                    <li>Mouse movement patterns and velocity</li>
                  </ul>
                </div>
              </div>

              <div className="bg-secondary/50 p-4 rounded-lg flex gap-3 items-start">
                <Info className="w-5 h-5 text-canara-orange mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-medium text-sm text-foreground">What we DO NOT capture:</h4>
                  <ul className="text-sm text-muted-foreground list-disc list-inside mt-1">
                    <li>Actual passwords or sensitive content</li>
                    <li>Browser history or personal files</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <input 
                type="checkbox" 
                id="consent-check" 
                className="w-4 h-4 rounded border-gray-300 text-canara-blue focus:ring-canara-blue"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <label htmlFor="consent-check" className="text-sm font-medium text-foreground">
                I understand this is for security purposes only
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={onOptOut}
                className="px-4 py-2 w-full text-sm font-medium text-foreground border rounded-md hover:bg-secondary transition-colors"
              >
                Opt Out (Use Hardware Token)
              </button>
              <button 
                onClick={onConsent}
                disabled={!agreed}
                className={`px-4 py-2 w-full text-sm font-medium rounded-md transition-colors ${
                  agreed 
                  ? 'bg-canara-green text-white hover:bg-canara-green/90 shadow-lg shadow-canara-green/20' 
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                I Consent & Enroll
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
