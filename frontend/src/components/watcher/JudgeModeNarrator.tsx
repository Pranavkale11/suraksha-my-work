import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, CheckCircle2, ChevronDown, ChevronUp, Code, Database } from 'lucide-react';

const JUDGE_NARRATION_STEPS = [
  {
    stage: "FILE_UPLOAD",
    title: "1. Secure File Ingestion",
    technical: "FastAPI UploadFile → Virus scan placeholder → MongoDB GridFS bucket 'circulars.files'",
    business: "Regulatory document safely stored with checksum verification"
  },
  {
    stage: "TEXT_EXTRACTION", 
    title: "2. Deterministic Text Extraction",
    technical: "PyPDF2.extractText() / python-docx Document.paragraphs → Preserve structure",
    business: "No AI hallucination — pure regex and text parsing"
  },
  {
    stage: "CLAUSE_PARSING",
    title: "3. Obligation Detection Engine",
    technical: "Regex: (shall|must|should|may|recommended) → Severity mapping → Clause numbering: (\\d+\\.\\d+)",
    business: "Every 'shall' and 'must' flagged for compliance tracking"
  },
  {
    stage: "EMBEDDING_GENERATION",
    title: "4. Semantic Vectorization",
    technical: "sentence-transformers all-MiniLM-L6-v2 → 384-dim embedding → Atlas Vector Search index",
    business: "Enables AI-powered similarity matching against internal policies"
  },
  {
    stage: "INGESTION_STATUS",
    title: "5. Quality Gate",
    technical: "fully_parsed: 100% clauses numbered + obligations clear | partially_parsed: <100% | failed: >50% errors",
    business: "Ghost gaps prevented — incomplete documents blocked from gap detection"
  }
];

interface Props {
  currentStage: number; // 0 to 5
}

export const JudgeModeNarrator: React.FC<Props> = ({ currentStage }) => {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col h-full">
      <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-canara-success" />
          <h3 className="text-white font-semibold">Judge Mode: Pipeline Trace</h3>
        </div>
        <div className="px-2 py-1 bg-canara-primary/20 text-canara-primary text-xs rounded font-mono">
          LIVE DEMO
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {JUDGE_NARRATION_STEPS.map((step, idx) => {
          const isActive = currentStage === idx + 1;
          const isComplete = currentStage > idx + 1;
          const isPending = currentStage < idx + 1;
          const isExpanded = expandedStep === idx || isActive;

          return (
            <motion.div 
              key={step.stage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: isPending ? 0.4 : 1, x: 0 }}
              className={`rounded-lg border transition-colors duration-300 ${isActive ? 'bg-canara-primary/10 border-canara-primary/50' : isComplete ? 'bg-slate-800/50 border-canara-success/30' : 'bg-slate-800/30 border-slate-700/50'}`}
            >
              <div 
                className="p-3 flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedStep(isExpanded ? null : idx)}
              >
                <div className="flex items-center gap-3">
                  {isComplete ? (
                    <CheckCircle2 className="w-5 h-5 text-canara-success" />
                  ) : isActive ? (
                    <div className="w-5 h-5 rounded-full border-2 border-canara-primary border-t-transparent animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-600" />
                  )}
                  <span className={`font-medium ${isActive ? 'text-white' : 'text-slate-300'}`}>
                    {step.title}
                  </span>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-11 pb-4 space-y-3">
                      <p className="text-sm text-slate-300">{step.business}</p>
                      
                      <div className="bg-slate-950 rounded p-2 text-xs font-mono text-slate-400 flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                          <Code className="w-3 h-3" /> Technical Trace:
                        </div>
                        {step.technical}
                        {idx === 2 && (
                          <div className="mt-2 text-canara-primary hover:text-white cursor-pointer transition-colors">
                            ▶ Show Me The Regex
                          </div>
                        )}
                        {idx === 3 && (
                          <div className="mt-2 text-canara-primary hover:text-white cursor-pointer transition-colors">
                            ▶ Show Me The Embedding [0.014, -0.823, ...]
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
