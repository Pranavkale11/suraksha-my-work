import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, PlayCircle, Loader2, CheckCircle, AlertTriangle, ChevronRight, CheckSquare, XCircle, BrainCircuit } from 'lucide-react';
import { gapsApi } from '../../api/gaps';
import { circularsApi } from '../../api/circulars';
import { GapDetailModal } from '../../components/gaps/GapDetailModal';

export const GapDashboard = () => {
  const [circulars, setCirculars] = useState<any[]>([]);
  const [selectedCircular, setSelectedCircular] = useState<string>('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionStep, setDetectionStep] = useState(0);
  const [results, setResults] = useState<any[]>([]);
  const [selectedGap, setSelectedGap] = useState<any>(null);

  useEffect(() => {
    // Check URL params for pre-selected circular
    const params = new URLSearchParams(window.location.search);
    const circularParam = params.get('circular');
    if (circularParam) {
      setSelectedCircular(circularParam);
    }

    circularsApi.list().then(res => {
      setCirculars(res.circulars.filter((c: any) => 
        ['fully_parsed', 'processed'].includes(c.ingestion_status)
      ));
    });
  }, []);

  const runDetection = async () => {
    if (!selectedCircular) return;
    
    setIsDetecting(true);
    setDetectionStep(1);
    
    const timers = [
      setTimeout(() => setDetectionStep(2), 1000),
      setTimeout(() => setDetectionStep(3), 2500),
      setTimeout(() => setDetectionStep(4), 3800),
    ];
    
    try {
      const res = await gapsApi.detect(selectedCircular);
      timers.forEach(clearTimeout);
      setDetectionStep(5);
      setResults(res.gaps_detected);
    } catch (e) {
      console.error(e);
      alert('Gap detection failed');
      setIsDetecting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'covered': return <span className="px-2 py-1 bg-canara-success/10 text-canara-success rounded text-xs font-bold flex items-center gap-1 w-max"><CheckCircle className="w-3 h-3"/> Covered</span>;
      case 'suspected': return <span className="px-2 py-1 bg-[#FF6B35]/10 text-[#FF6B35] rounded text-xs font-bold flex items-center gap-1 w-max"><AlertTriangle className="w-3 h-3"/> Suspected</span>;
      case 'confirmed': return <span className="px-2 py-1 bg-canara-danger/10 text-canara-danger rounded text-xs font-bold flex items-center gap-1 w-max"><ShieldAlert className="w-3 h-3"/> Confirmed</span>;
      default: return <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-xs font-bold flex items-center gap-1 w-max"><XCircle className="w-3 h-3"/> Unknown</span>;
    }
  };

  const stats = {
    total: results.length,
    covered: results.filter(r => r.gap_status === 'covered').length,
    suspected: results.filter(r => r.gap_status === 'suspected').length,
    confirmed: results.filter(r => r.gap_status === 'confirmed').length,
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
              <BrainCircuit className="w-8 h-8 text-canara-primary" />
              AI-Powered Gap Detection
            </h1>
            <p className="text-slate-600">Cross-reference regulatory obligations with your internal active policies.</p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full max-w-md">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Target Circular</label>
            <select 
              className="w-full border-slate-300 rounded-lg focus:ring-canara-primary/50 text-slate-700 bg-slate-50 py-2.5 px-3 border outline-none"
              value={selectedCircular}
              onChange={(e) => setSelectedCircular(e.target.value)}
              disabled={isDetecting}
            >
              <option value="">-- Choose a Circular --</option>
              {circulars.map(c => (
                <option key={c.circular_id} value={c.circular_id}>{c.circular_id} - {c.title}</option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={runDetection}
            disabled={!selectedCircular || isDetecting}
            className={`px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all ${
              !selectedCircular ? 'bg-slate-200 text-slate-400 cursor-not-allowed' :
              isDetecting ? 'bg-canara-primary/80 text-white cursor-wait' :
              'bg-canara-primary text-white hover:bg-canara-primary/90 shadow-md hover:shadow-lg hover:-translate-y-0.5'
            }`}
          >
            {isDetecting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</>
            ) : (
              <><PlayCircle className="w-5 h-5" /> Run Gap Detection</>
            )}
          </button>
        </div>

        {/* Processing State */}
        <AnimatePresence>
          {isDetecting && detectionStep < 5 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-slate-900 rounded-xl p-8 mb-8 text-center overflow-hidden border border-slate-700"
            >
              <div className="w-16 h-16 relative mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-canara-primary/30 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-canara-primary border-t-transparent rounded-full animate-spin"></div>
                <BrainCircuit className="w-6 h-6 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              
              <h3 className="text-xl font-mono text-white mb-6 h-8">
                {detectionStep === 1 && "Initializing Atlas Vector Search..."}
                {detectionStep === 2 && "Comparing semantic similarity across active policies..."}
                {detectionStep === 3 && "Executing syntactic keyword compliance checks..."}
                {detectionStep === 4 && "Analyzing historical gap patterns..."}
              </h3>

              <div className="w-full max-w-lg mx-auto bg-slate-800 h-2 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-canara-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${(detectionStep / 4) * 100}%` }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        {detectionStep === 5 && results.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                <p className="text-sm text-slate-500 font-medium mb-1">Obligations Analyzed</p>
                <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <div className="bg-canara-success/5 p-4 rounded-xl border border-canara-success/20 shadow-sm text-center">
                <p className="text-sm text-canara-success font-medium mb-1">Coverage Rate</p>
                <p className="text-3xl font-bold text-canara-success">{Math.round((stats.covered / stats.total) * 100)}%</p>
              </div>
              <div className="bg-[#FF6B35]/5 p-4 rounded-xl border border-[#FF6B35]/20 shadow-sm text-center">
                <p className="text-sm text-[#FF6B35] font-medium mb-1">Suspected Gaps</p>
                <p className="text-3xl font-bold text-[#FF6B35]">{stats.suspected}</p>
              </div>
              <div className="bg-canara-danger/5 p-4 rounded-xl border border-canara-danger/20 shadow-sm text-center">
                <p className="text-sm text-canara-danger font-medium mb-1">Confirmed Gaps</p>
                <p className="text-3xl font-bold text-canara-danger">{stats.confirmed}</p>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Clause ID</th>
                    <th className="px-6 py-4 font-semibold">Obligation Text</th>
                    <th className="px-6 py-4 font-semibold">Severity</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.map((r, idx) => {
                    const bestMatch = r.top_matches[0];
                    return (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-700">
                          {r.clause_number || `CL-${idx+1}`}
                        </td>
                        <td className="px-6 py-4 max-w-md">
                          <p className="truncate text-slate-800">{r.clause_text}</p>
                          {bestMatch && (
                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                              Match: {bestMatch.policy_id} ({(bestMatch.similarity * 100).toFixed(0)}%)
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="uppercase text-[10px] font-bold tracking-wider px-2 py-1 bg-slate-100 rounded text-slate-600">
                            {r.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(r.gap_status)}
                        </td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => setSelectedGap(r)}
                            className="text-canara-primary hover:text-canara-primary/80 font-semibold flex items-center gap-1 text-xs bg-canara-primary/10 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Judge View <ChevronRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedGap && (
          <GapDetailModal gap={selectedGap} onClose={() => setSelectedGap(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};
