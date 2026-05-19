import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EvidenceUploadModal } from '../../components/dept/EvidenceUploadModal';
import { apiClient } from '../../lib/api';

export function DepartmentMapDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isTokenDialogOpen, setIsTokenDialogOpen] = useState(false);
  const [mapData, setMapData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tokenInput, setTokenInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      apiClient.get(`/api/dept/maps/${id}`)
        .then(res => {
          setMapData(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id]);

  const handleComplete = async () => {
    try {
      if (tokenInput !== '123456') {
        setError('Invalid hardware token. (Hint: use 123456)');
        return;
      }
      await apiClient.post(`/api/dept/maps/${id}/complete`);
      setIsTokenDialogOpen(false);
      navigate('/dept/maps');
    } catch (err: any) {
      setError(err.response?.data?.detail?.message || 'Error completing MAP');
    }
  };

  if (loading) return <div className="p-6 text-center">Loading MAP data...</div>;
  if (!mapData) return <div className="p-6 text-center text-red-500">MAP not found</div>;

  const canComplete = mapData.status !== 'complete' && 
                      (mapData.evidence_items || []).every((ev: any) => ev.validation_status === 'validated' || ev.validation_status === 'approved');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="text-sm text-gray-500 mb-4 cursor-pointer hover:underline" onClick={() => navigate('/dept/maps')}>
        Dashboard &gt; My MAPs &gt; {mapData.map_id}
      </div>

      <div className="flex justify-between items-center bg-white p-4 border rounded shadow-sm">
        <div>
          <h1 className="text-2xl font-bold">{mapData.map_id}: {mapData.title}</h1>
          <p className="text-gray-600 mt-1">{mapData.description || 'Action required.'}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsUploadOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded font-medium shadow hover:bg-blue-700">Upload Evidence</button>
          <button className="px-4 py-2 border border-gray-300 rounded font-medium hover:bg-gray-50">Request Extension</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white p-4 border rounded shadow-sm">
            <h2 className="font-bold text-lg mb-3 border-b pb-2">MAP Details</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Priority</span>: <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-sm">{mapData.risk_level?.toUpperCase() || 'MEDIUM'}</span></p>
              <p><span className="font-medium">Deadline</span>: <span className="text-red-600 font-bold">{mapData.deadline?.split('T')[0]}</span></p>
              <p><span className="font-medium">Status</span>: <span className="font-bold">{mapData.status?.toUpperCase()}</span></p>
              <p><span className="font-medium">Assignee</span>: {mapData.assigned_to}</p>
            </div>
            
            <h3 className="font-semibold text-md mt-4 mb-2">Provenance Path</h3>
            <div className="bg-gray-50 p-3 rounded border text-sm space-y-2">
               <p>📄 {mapData.circular_id || 'RBI/Circular'}</p>
               <p className="pl-4">↪ Clause: {mapData.clause_text || 'Related clause.'}</p>
               <p className="pl-8">↪ Policy: {mapData.related_policy || 'Internal Policy'}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-4 border rounded shadow-sm">
            <h2 className="font-bold text-lg mb-3 border-b pb-2">Evidence Checklist</h2>
            <div className="space-y-3">
              {(mapData.evidence_items || []).map((ev: any, idx: number) => (
                <div key={idx} className={`flex justify-between items-center p-3 border rounded ${ev.validation_status === 'validated' ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                  <div>
                    <div className="font-medium">{idx + 1}. {ev.description || ev.evidence_type}</div>
                    <div className="text-xs text-gray-500">{ev.uploaded ? 'Uploaded' : 'Pending Upload'}</div>
                  </div>
                  {ev.validation_status === 'validated' ? (
                    <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded border border-green-200 font-bold">✓ VALIDATED</div>
                  ) : ev.uploaded ? (
                    <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded border border-yellow-200 font-bold">◷ PENDING REVIEW</div>
                  ) : (
                    <button onClick={() => setIsUploadOpen(true)} className="text-xs px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50">Upload</button>
                  )}
                </div>
              ))}
              {(mapData.evidence_items || []).length === 0 && (
                <div className="text-sm text-gray-500">No specific evidence checklist. Please upload generic evidence.</div>
              )}
            </div>
          </div>

          <div className="bg-white p-4 border rounded shadow-sm">
            <h2 className="font-bold text-lg mb-3 border-b pb-2">Completion Action</h2>
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
              <span className="font-bold">🔒 Critical Action:</span> Marking this MAP as complete requires behavioral re-authentication and a hardware token.
            </div>
            <button 
              disabled={!canComplete}
              onClick={() => setIsTokenDialogOpen(true)}
              className={`w-full mt-3 px-4 py-2 text-white rounded font-bold ${canComplete ? 'bg-green-600 hover:bg-green-700' : 'bg-green-600 opacity-50 cursor-not-allowed'}`}>
              Mark MAP Complete
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">All evidence must be validated before completion.</p>
          </div>
        </div>
      </div>

      {isTokenDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full space-y-4">
            <h3 className="text-lg font-bold">Hardware Token Required</h3>
            <p className="text-sm text-gray-600">Please enter the 6-digit code from your hardware token. (External Verification)</p>
            <input 
              type="text" 
              className="w-full border p-2 rounded" 
              placeholder="123456"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 border rounded" onClick={() => {setIsTokenDialogOpen(false); setError('');}}>Cancel</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleComplete}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      <EvidenceUploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  );
}