import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronRight, Copy, Terminal, Scale } from 'lucide-react';
import { ObligationHighlighter } from '../watcher/ObligationHighlighter';

interface Props {
  gap: any;
  onClose: () => void;
}

export const GapDetailModal: React.FC<Props> = ({ gap, onClose }) => {
  const [expandedStep, setExpandedStep] = useState<number | null>(0);

  const bestMatch = gap.top_matches?.[0];

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'pass': return <CheckCircle className="w-5 h-5 text-canara-success" />;
      case 'fail': return <XCircle className="w-5 h-5 text-canara-danger" />;
      case 'review': return <AlertTriangle className="w-5 h-5 text-[#FF6B35]" />;
      default: return null;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">Judge Mode: Gap Explanation</h2>
              <p className="text-xs text-slate-500">Transparent AI decision tracing for Clause {gap.clause_number}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: The Data */}
          <div className="flex-1 space-y-6">
            
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Target Regulatory Clause</h3>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 font-serif leading-relaxed">
                <ObligationHighlighter text={gap.clause_text} />
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Top Matched Internal Policy</h3>
              {bestMatch ? (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                    <span className="font-semibold text-slate-700">{bestMatch.policy_id}: {bestMatch.title}</span>
                    <span className="text-xs font-mono font-bold px-2 py-1 bg-white border border-slate-200 rounded shadow-sm text-slate-600">
                      Sim: {(bestMatch.similarity * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="p-4 bg-white font-serif text-slate-800 leading-relaxed text-sm">
                    {bestMatch.full_text}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-6 text-center text-slate-500 text-sm">
                  No active policies found in vector search.
                </div>
              )}
            </div>
            
            {/* Final Verdict Banner */}
            <div className={`rounded-xl border p-4 flex items-center gap-4 ${
              gap.gap_status === 'covered' ? 'bg-canara-success/10 border-canara-success/30' :
              gap.gap_status === 'confirmed' ? 'bg-canara-danger/10 border-canara-danger/30' :
              'bg-[#FF6B35]/10 border-[#FF6B35]/30'
            }`}>
              {gap.gap_status === 'covered' ? <CheckCircle className="w-8 h-8 text-canara-success" /> :
               gap.gap_status === 'confirmed' ? <XCircle className="w-8 h-8 text-canara-danger" /> :
               <AlertTriangle className="w-8 h-8 text-[#FF6B35]" />}
              
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-0.5">
                  Final Verdict: {gap.gap_status.replace('_', ' ')}
                </h4>
                <p className="text-sm text-slate-700">
                  {gap.historical_matches_count >= 3 ? "Historical match — Auto-routed to MAP creation." : "Novel finding — Requires human triage."}
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: AI Reasoning Timeline */}
          <div className="w-full lg:w-[400px] shrink-0">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Deterministic Logic Trace</h3>
            
            <div className="relative border-l-2 border-slate-200 ml-3 space-y-6 pb-4">
              {gap.judge_explanation?.map((step: any, idx: number) => {
                const isExpanded = expandedStep === idx;
                
                let borderColor = 'border-slate-200';
                if (step.result === 'pass') borderColor = 'border-canara-success';
                else if (step.result === 'fail') borderColor = 'border-canara-danger';
                else if (step.result === 'review') borderColor = 'border-[#FF6B35]';

                return (
                  <div key={idx} className="relative pl-6">
                    {/* Connector Dot */}
                    <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 bg-white ${borderColor} flex items-center justify-center`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${step.result === 'pass' ? 'bg-canara-success' : step.result === 'fail' ? 'bg-canara-danger' : 'bg-[#FF6B35]'}`} />
                    </div>

                    <div 
                      className={`bg-white rounded-xl border shadow-sm transition-all overflow-hidden ${isExpanded ? 'border-canara-primary/30 ring-1 ring-canara-primary/10' : 'border-slate-200 hover:border-slate-300 cursor-pointer'}`}
                    >
                      <div 
                        className="p-3 flex items-start gap-3"
                        onClick={() => setExpandedStep(isExpanded ? null : idx)}
                      >
                        <div className="mt-0.5 shrink-0">{getResultIcon(step.result)}</div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-slate-900">{step.title}</h4>
                          <p className="text-xs text-slate-600 mt-1 leading-snug">{step.businessImpact}</p>
                        </div>
                        <div className="shrink-0 text-slate-400">
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-slate-900 border-t border-slate-800"
                          >
                            <div className="p-3">
                              <div className="flex items-center justify-between mb-2 text-slate-400">
                                <span className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                                  <Terminal className="w-3 h-3" /> Technical Trace
                                </span>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); copyToClipboard(step.technicalDetail); }}
                                  className="hover:text-white transition-colors"
                                  title="Copy to clipboard"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                              <p className="text-xs font-mono text-green-400 break-words leading-relaxed">
                                &gt; {step.technicalDetail}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
          <button 
            onClick={onClose}
            className="px-5 py-2 border border-slate-300 bg-white rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors shadow-sm"
          >
            Dismiss
          </button>
          {gap.gap_status !== 'covered' && (
            <button 
              className="px-5 py-2 bg-canara-primary text-white rounded-lg font-medium hover:bg-canara-primary/90 transition-colors shadow-sm"
              onClick={async () => {
                try {
                  const { gapsApi } = await import('../../api/gaps');
                  const { toast } = await import('../common/ToastProvider');
                  await gapsApi.approve(gap.gap_id || gap.id);
                  toast('success', "Queued MAP Creation successfully");
                  onClose();
                } catch (e) {
                  console.error(e);
                  alert("Failed to queue MAP");
                }
              }}
            >
              Send to MAP Queue
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
