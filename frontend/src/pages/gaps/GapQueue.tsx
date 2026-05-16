import React, { useEffect, useState } from 'react';
import { gapsApi } from '../../api/gaps';
import { ShieldAlert, CheckCircle, XCircle, ArrowRight, BrainCircuit, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const GapQueue = () => {
  const navigate = useNavigate();
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      const res = await gapsApi.queue();
      setQueue(res.queue);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (gapId: string, action: 'approve' | 'dismiss' | 'escalate') => {
    try {
      if (action === 'approve') await gapsApi.approve(gapId);
      if (action === 'dismiss') await gapsApi.dismiss(gapId);
      if (action === 'escalate') await gapsApi.escalate(gapId);
      fetchQueue(); // refresh
    } catch (e) {
      console.error(e);
      alert(`Failed to ${action} gap`);
    }
  };

  const autoRouted = queue.filter(g => g.triage_status === 'assigned');
  const pendingReview = queue.filter(g => g.triage_status === 'new');

  const renderCard = (gap: any, isAuto: boolean) => (
    <div key={gap.gap_id} className={`bg-white rounded-xl border p-4 shadow-sm mb-4 transition-all hover:shadow-md ${isAuto ? 'border-canara-success/30' : 'border-slate-200'}`}>
      <div className="flex justify-between items-start mb-2">
        <span className="font-mono text-xs font-bold text-slate-500">{gap.gap_id}</span>
        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
          gap.classification === 'critical' ? 'bg-canara-danger/10 text-canara-danger' : 
          gap.classification === 'high' ? 'bg-[#FF6B35]/10 text-[#FF6B35]' : 
          'bg-slate-100 text-slate-600'
        }`}>
          {gap.classification}
        </span>
      </div>
      
      <p className="text-sm font-semibold text-slate-900 mb-1">{gap.circular_id} | Clause {gap.clause_number}</p>
      <p className="text-sm text-slate-600 line-clamp-2 mb-3">{gap.clause_text}</p>
      
      <div className="flex items-center gap-2 mb-4 text-xs font-medium">
        <BrainCircuit className={`w-4 h-4 ${isAuto ? 'text-canara-success' : 'text-canara-primary'}`} />
        <span className={isAuto ? 'text-canara-success' : 'text-slate-600'}>Confidence: {(gap.ai_confidence_score * 100).toFixed(0)}%</span>
        <span className="text-slate-300">|</span>
        <span className="text-slate-600">Dept: {gap.department}</span>
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-slate-100">
        <span className="text-xs font-medium text-slate-500">{gap.suggested_action}</span>
        <div className="flex gap-2">
          {!isAuto && (
            <button 
              onClick={() => handleAction(gap.gap_id, 'dismiss')}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
              title="Dismiss False Positive"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={() => handleAction(gap.gap_id, 'approve')}
            className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded transition-colors ${
              isAuto ? 'bg-canara-success text-white hover:bg-canara-success/90' : 'bg-canara-primary text-white hover:bg-canara-primary/90'
            }`}
          >
            {isAuto ? 'View MAP' : 'Approve'} <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) return <div className="min-h-screen bg-slate-50 pt-20 flex justify-center text-slate-500">Loading queue...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Gap Verification Queue</h1>
            <p className="text-slate-600">Review suspected compliance gaps and approve MAP generation.</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-600 font-medium flex items-center gap-2 hover:bg-slate-50 shadow-sm">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left: Auto-Routed */}
          <div className="flex flex-col h-[750px]">
            <div className="flex justify-between items-center mb-4 px-1">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-canara-success" />
                Auto-Routed to MAP
              </h3>
              <span className="bg-slate-200 text-slate-700 text-xs font-bold px-2 py-1 rounded-full">{autoRouted.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 pb-4">
              {autoRouted.map(g => renderCard(g, true))}
              {autoRouted.length === 0 && (
                <div className="h-40 flex items-center justify-center border-2 border-dashed border-slate-300 rounded-xl text-slate-400 text-sm italic">
                  No auto-routed items.
                </div>
              )}
            </div>
          </div>

          {/* Right: Pending Review */}
          <div className="flex flex-col h-[750px]">
            <div className="flex justify-between items-center mb-4 px-1">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF6B35]" />
                Pending Triage
              </h3>
              <span className="bg-slate-200 text-slate-700 text-xs font-bold px-2 py-1 rounded-full">{pendingReview.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 pb-4">
              {pendingReview.map(g => renderCard(g, false))}
              {pendingReview.length === 0 && (
                <div className="h-40 flex items-center justify-center border-2 border-dashed border-slate-300 rounded-xl text-slate-400 text-sm italic">
                  Queue is clear.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
