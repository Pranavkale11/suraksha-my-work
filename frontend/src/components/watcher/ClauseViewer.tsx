import React from 'react';
import { ObligationHighlighter } from './ObligationHighlighter';
import { ShieldCheck, HelpCircle, XCircle, AlertCircle } from 'lucide-react';

interface Props {
  clause: any;
}

export const ClauseViewer: React.FC<Props> = ({ clause }) => {
  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case 'critical': return 'bg-canara-danger text-white border-canara-danger';
      case 'high': return 'bg-[#FF6B35] text-white border-[#FF6B35]';
      case 'medium': return 'bg-[#00A86B] text-white border-[#00A86B]';
      case 'low': return 'bg-slate-500 text-white border-slate-500';
      default: return 'bg-slate-200 text-slate-700 border-slate-300';
    }
  };

  const getGapIcon = (status: string) => {
    switch (status) {
      case 'covered': return <ShieldCheck className="w-5 h-5 text-canara-success" />;
      case 'suspected': return <HelpCircle className="w-5 h-5 text-[#FF6B35]" />;
      case 'confirmed': return <AlertCircle className="w-5 h-5 text-canara-danger" />;
      case 'error': return <XCircle className="w-5 h-5 text-slate-400" />;
      default: return <div className="w-5 h-5 rounded-full border-2 border-slate-300 border-dashed" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm mb-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded border">
            {clause.clause_number || "Unnumbered"}
          </span>
          {clause.severity && (
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getSeverityStyle(clause.severity)}`}>
              {clause.severity}
            </span>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gap Status</span>
          {getGapIcon(clause.gap_status)}
        </div>
      </div>
      
      <p className="text-sm text-slate-700 leading-relaxed">
        <ObligationHighlighter text={clause.text} />
      </p>

      {clause.penalty_reference && (
        <div className="mt-3 text-xs p-2 bg-canara-danger/5 border border-canara-danger/20 rounded text-canara-danger font-medium">
          ⚠️ {clause.penalty_reference}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        {clause.gap_status === 'covered' && (
          <button className="px-3 py-1.5 bg-canara-success/10 text-canara-success text-xs font-semibold rounded hover:bg-canara-success/20 transition-colors">
            Link to Policy
          </button>
        )}
        {(clause.gap_status === 'suspected' || clause.gap_status === 'confirmed') && (
          <button className="px-3 py-1.5 bg-canara-primary text-white text-xs font-semibold rounded hover:bg-canara-primary/90 transition-colors">
            Create MAP
          </button>
        )}
      </div>
    </div>
  );
};
