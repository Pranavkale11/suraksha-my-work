import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ApiCall {
  method: string;
  url: string;
  status: number;
  duration: number;
  requestBody?: any;
  responseBody?: any;
}

interface JudgeModeContextType {
  isJudgeMode: boolean;
  toggleJudgeMode: () => void;
  requestLog: ApiCall[];
  addRequest: (call: ApiCall) => void;
  clearLog: () => void;
}

const JudgeModeContext = createContext<JudgeModeContextType | undefined>(undefined);

export const JudgeModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isJudgeMode, setIsJudgeMode] = useState(false);
  const [requestLog, setRequestLog] = useState<ApiCall[]>([]);

  const toggleJudgeMode = () => {
    setIsJudgeMode(prev => {
      const next = !prev;
      (window as any).__JUDGE_MODE_ENABLED = next;
      return next;
    });
  };

  const addRequest = (call: ApiCall) => {
    setRequestLog(prev => {
      const newLog = [call, ...prev];
      if (newLog.length > 20) return newLog.slice(0, 20); // Keep last 20
      return newLog;
    });
  };

  const clearLog = () => setRequestLog([]);

  return (
    <JudgeModeContext.Provider value={{ isJudgeMode, toggleJudgeMode, requestLog, addRequest, clearLog }}>
      {children}
    </JudgeModeContext.Provider>
  );
};

export const useJudgeMode = () => {
  const context = useContext(JudgeModeContext);
  if (context === undefined) {
    throw new Error('useJudgeMode must be used within a JudgeModeProvider');
  }
  return context;
};
