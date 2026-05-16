import React, { useState, useEffect } from 'react';
import { useJudgeMode } from '../../contexts/JudgeModeContext';
import type { ApiCall } from '../../contexts/JudgeModeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, X, Copy, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';

export const JudgePanel = () => {
  const { isJudgeMode, toggleJudgeMode, requestLog, clearLog } = useJudgeMode();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Sync listener to context
  const { addRequest } = useJudgeMode();
  useEffect(() => {
    const handleLog = (e: any) => addRequest(e.detail);
    window.addEventListener('api_call_logged', handleLog);
    return () => window.removeEventListener('api_call_logged', handleLog);
  }, [addRequest]);

  const copyAsCurl = (call: ApiCall) => {
    let curl = `curl -X ${call.method} "${call.url}"`;
    if (call.requestBody) {
      curl += ` -H "Content-Type: application/json" -d '${JSON.stringify(call.requestBody)}'`;
    }
    navigator.clipboard.writeText(curl);
    // Could dispatch a toast here, but simple alert is fine for judges
    alert("cURL copied to clipboard!");
  };

  return (
    <>
      <button 
        onClick={toggleJudgeMode}
        className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-full text-xs font-mono font-bold shadow-lg transition-all border ${
          isJudgeMode 
            ? "bg-yellow-400 text-slate-900 border-yellow-500 hover:bg-yellow-500 animate-pulse" 
            : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
        }`}
      >
        {isJudgeMode ? "🔍 JUDGE MODE ON" : "👁️ JUDGE MODE"}
      </button>

      <AnimatePresence>
        {isJudgeMode && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed top-0 right-0 bottom-0 w-[400px] bg-slate-900 shadow-2xl z-40 border-l border-slate-700 flex flex-col"
          >
            <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between pt-16">
              <h3 className="text-white font-mono font-bold flex items-center gap-2">
                <Terminal className="w-5 h-5 text-yellow-400" /> API Trace Log
              </h3>
              <div className="flex gap-2">
                <button onClick={clearLog} className="p-1.5 text-slate-400 hover:text-white rounded transition-colors" title="Clear logs">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={toggleJudgeMode} className="p-1.5 text-slate-400 hover:text-white rounded transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {requestLog.length === 0 ? (
                <div className="text-slate-500 text-center text-sm font-mono mt-10">
                  Waiting for API calls...
                </div>
              ) : (
                requestLog.map((call, idx) => {
                  const isExpanded = expandedIndex === idx;
                  const getMethodColor = (m: string) => {
                    switch (m) {
                      case 'GET': return 'bg-blue-500/20 text-blue-400';
                      case 'POST': return 'bg-green-500/20 text-green-400';
                      case 'PUT': return 'bg-orange-500/20 text-orange-400';
                      case 'DELETE': return 'bg-red-500/20 text-red-400';
                      default: return 'bg-slate-700 text-slate-300';
                    }
                  };
                  
                  const statusColor = call.status >= 200 && call.status < 300 ? 'text-green-400' :
                                     call.status >= 400 ? 'text-red-400' : 'text-yellow-400';

                  return (
                    <div key={idx} className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden text-xs font-mono">
                      <div 
                        className="p-3 cursor-pointer hover:bg-slate-750 flex items-start gap-2 transition-colors"
                        onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                      >
                        <span className={`px-1.5 py-0.5 rounded font-bold ${getMethodColor(call.method)}`}>
                          {call.method}
                        </span>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-slate-300 truncate" title={call.url}>
                            {call.url.replace(import.meta.env.VITE_API_URL || '', '')}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-slate-500">
                            <span className={statusColor}>{call.status}</span>
                            <span>{call.duration}ms</span>
                          </div>
                        </div>
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                      </div>

                      {isExpanded && (
                        <div className="border-t border-slate-700 bg-slate-950 p-3 space-y-3">
                          <div className="flex justify-end">
                            <button 
                              onClick={(e) => { e.stopPropagation(); copyAsCurl(call); }}
                              className="text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2 py-1 rounded"
                            >
                              <Copy className="w-3 h-3" /> cURL
                            </button>
                          </div>
                          {call.requestBody && (
                            <div>
                              <p className="text-slate-500 mb-1 font-bold">Request Body:</p>
                              <pre className="text-slate-300 overflow-x-auto bg-slate-900 p-2 rounded max-h-32">
                                {JSON.stringify(call.requestBody, null, 2)}
                              </pre>
                            </div>
                          )}
                          {call.responseBody && (
                            <div>
                              <p className="text-slate-500 mb-1 font-bold">Response Body:</p>
                              <pre className="text-slate-300 overflow-x-auto bg-slate-900 p-2 rounded max-h-40">
                                {JSON.stringify(call.responseBody, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
