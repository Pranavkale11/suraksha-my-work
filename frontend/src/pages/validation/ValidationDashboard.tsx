import { useEffect, useMemo, useState } from 'react';
import { Check, Loader2, RefreshCw, ShieldCheck, X } from 'lucide-react';
import { ValidationBadge } from '../../components/common/ValidationBadge';
import { apiClient } from '../../lib/api';

interface QueueItem {
  evidence_id: string;
  map_id?: string;
  type: string;
  filename?: string;
  uploader: string;
  upload_time: string;
  status: string;
  confidence: number;
  details?: Array<{ name: string; status: string; reason?: string; detail?: string }>;
}

export function ValidationDashboard() {
  const [activeTab, setActiveTab] = useState('all');
  const [items, setItems] = useState<QueueItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<QueueItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchQueue = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/api/validation/queue');
      setItems(res.data.items ?? []);
      setSelectedItem((current) => {
        if (!current) return res.data.items?.[0] ?? null;
        return res.data.items?.find((item: QueueItem) => item.evidence_id === current.evidence_id) ?? res.data.items?.[0] ?? null;
      });
    } catch {
      setError('Could not load validation queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQueue(); }, []);

  const filtered = useMemo(() => {
    if (activeTab === 'all') return items;
    if (activeTab === 'manual') return items.filter(q => q.status === 'manual_review');
    if (activeTab === 'failed') return items.filter(q => q.status === 'fail');
    return items.filter(q => q.status === 'pass' || q.status === 'override_pass' || q.status === 'approved');
  }, [activeTab, items]);

  const override = async (status: 'override_pass' | 'fail') => {
    if (!selectedItem) return;
    const reason = window.prompt('Reason for validation override');
    if (!reason) return;
    setBusyId(selectedItem.evidence_id);
    try {
      await apiClient.post(`/api/validation/override/${selectedItem.evidence_id}`, { new_status: status, reason });
      await fetchQueue();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto flex gap-6 h-[calc(100vh-60px)]">
      <div className="w-1/2 flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h1 className="text-xl font-bold flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> Validation Queue</h1>
          <button onClick={fetchQueue} className="border border-gray-300 rounded px-2 py-1 text-sm flex items-center gap-1">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        <div className="flex border-b border-gray-200 text-sm">
          {[
            ['all', 'All'],
            ['failed', 'Failed'],
            ['manual', 'Manual Review'],
            ['passed', 'Passed'],
          ].map(([key, label]) => (
            <button key={key} className={`flex-1 py-2 font-medium ${activeTab === key ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`} onClick={() => setActiveTab(key)}>
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-gray-50">
          {loading && <div className="p-8 text-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading queue...</div>}
          {!loading && error && <div className="p-8 text-center text-red-600">{error}</div>}
          {!loading && !error && filtered.length === 0 && <div className="p-8 text-center text-gray-500">No evidence in this queue.</div>}
          {filtered.map(item => (
            <div
              key={item.evidence_id}
              onClick={() => setSelectedItem(item)}
              className={`p-3 border rounded shadow-sm cursor-pointer transition-colors ${selectedItem?.evidence_id === item.evidence_id ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-xs font-bold text-gray-500">{item.map_id ?? 'Unlinked MAP'}</span>
                  <h3 className="font-medium text-sm text-gray-900 truncate pr-2">{item.filename ?? item.evidence_id}</h3>
                </div>
                <ValidationBadge status={item.status} confidence={item.confidence} />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>{item.type}</span>
                <span>{item.uploader} - {item.upload_time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-1/2 flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm">
        {selectedItem ? (
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{selectedItem.filename ?? selectedItem.evidence_id}</h2>
                  <p className="text-gray-500 text-sm">{selectedItem.evidence_id} - Attached to {selectedItem.map_id ?? 'unlinked MAP'}</p>
                </div>
                <ValidationBadge status={selectedItem.status} confidence={selectedItem.confidence} />
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
              <h3 className="font-bold text-gray-700 mb-4 uppercase text-xs tracking-wider">Validation Checks Breakdown</h3>
              <div className="space-y-3">
                {(selectedItem.details ?? []).map((detail, i) => (
                  <div key={i} className={`p-3 rounded border flex justify-between items-center bg-white ${detail.status === 'pass' ? 'border-green-200' : detail.status === 'manual_review' ? 'border-amber-200' : 'border-red-200'}`}>
                    <div>
                      <div className="font-medium text-sm">{detail.name}</div>
                      {(detail.reason || detail.detail) && <div className="text-xs text-gray-600 mt-0.5">{detail.reason ?? detail.detail}</div>}
                    </div>
                    <span className="text-xs font-bold uppercase">{detail.status}</span>
                  </div>
                ))}
                {(selectedItem.details ?? []).length === 0 && <p className="text-sm text-gray-500">No validation details captured yet.</p>}
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex gap-3">
                {selectedItem.status !== 'pass' && selectedItem.status !== 'override_pass' && (
                  <button disabled={busyId === selectedItem.evidence_id} onClick={() => override('override_pass')} className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded transition-colors flex justify-center items-center gap-2">
                    <Check className="w-4 h-4" /> Override & Approve
                  </button>
                )}
                {selectedItem.status !== 'fail' && (
                  <button disabled={busyId === selectedItem.evidence_id} onClick={() => override('fail')} className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded transition-colors flex justify-center items-center gap-2">
                    <X className="w-4 h-4" /> Override & Reject
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <ShieldCheck className="w-16 h-16 mb-4 text-gray-300" />
            <p className="text-lg">Select evidence from the queue to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
