import { Fragment, useEffect, useMemo, useState } from 'react';
import { CheckCircle, Loader2, RefreshCw, ShieldAlert } from 'lucide-react';
import { apiClient } from '../../lib/api';

interface AuditLog {
  log_id: string;
  timestamp: string;
  user_id: string;
  user_name?: string;
  action_type: string;
  target_type: string;
  target_id: string;
  department_id?: string;
  tamper_evident_hash?: string;
  previous_log_hash?: string;
  details?: Record<string, unknown>;
  provenance?: Record<string, unknown>;
  state_change?: Record<string, unknown>;
}

export function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chainStatus, setChainStatus] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/api/audit/logs', { params: { limit: 200 } });
      setLogs(res.data.items ?? []);
    } catch {
      setError('Could not load audit logs.');
    } finally {
      setLoading(false);
    }
  };

  const verifyChain = async () => {
    const res = await apiClient.post('/api/audit/verify-chain');
    setChainStatus(`${res.data.integrity} - ${res.data.total_logs} logs checked`);
  };

  useEffect(() => { fetchLogs(); }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return logs;
    return logs.filter(log => JSON.stringify(log).toLowerCase().includes(needle));
  }, [logs, query]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="text-3xl font-bold font-mono">Audit Log Ledger</h1>
        <div className="flex gap-2">
          <button onClick={verifyChain} className="border px-3 py-2 rounded text-sm flex items-center gap-2 bg-white hover:bg-gray-50">
            <CheckCircle className="w-4 h-4" /> Verify Chain
          </button>
          <button onClick={fetchLogs} className="border px-3 py-2 rounded text-sm flex items-center gap-2 bg-white hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      <div className="flex gap-2 text-sm bg-gray-50 p-2 rounded border">
        <input value={query} onChange={e => setQuery(e.target.value)} type="text" placeholder="Search user, action, target, hash..." className="border rounded px-2 py-2 flex-1" />
        {chainStatus && <span className="px-3 py-2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">{chainStatus}</span>}
      </div>

      <div className="bg-white border rounded shadow-sm overflow-hidden">
        {loading && <div className="p-12 text-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading logs...</div>}
        {!loading && error && <div className="p-12 text-center text-red-600"><ShieldAlert className="w-8 h-8 mx-auto mb-2" />{error}</div>}
        {!loading && !error && filtered.length === 0 && <div className="p-12 text-center text-gray-500">No audit logs found.</div>}
        {!loading && !error && filtered.length > 0 && (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100 font-mono text-xs text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Timestamp (UTC)</th>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Action</th>
                <th className="px-4 py-3 text-left">Target</th>
                <th className="px-4 py-3 text-left">Hash Chain</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-mono text-sm">
              {filtered.map(log => (
                <Fragment key={log.log_id}>
                  <tr className="hover:bg-blue-50 cursor-pointer transition-colors" onClick={() => setExpandedRow(expandedRow === log.log_id ? null : log.log_id)}>
                    <td className="px-4 py-3 text-gray-700">{log.timestamp}</td>
                    <td className="px-4 py-3 text-blue-600 font-bold">{log.user_name || log.user_id}</td>
                    <td className="px-4 py-3"><span className="bg-gray-200 px-2 py-0.5 rounded text-xs truncate max-w-[180px] block">{log.action_type}</span></td>
                    <td className="px-4 py-3 text-gray-600">{log.target_type}:{log.target_id}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{log.tamper_evident_hash?.slice(0, 24) ?? '-'}</td>
                  </tr>
                  {expandedRow === log.log_id && (
                    <tr className="bg-gray-50 border-b">
                      <td colSpan={5} className="px-6 py-4">
                        <div className="grid grid-cols-3 gap-4 text-xs">
                          <pre className="bg-white p-3 border rounded overflow-x-auto">{JSON.stringify(log.state_change ?? {}, null, 2)}</pre>
                          <pre className="bg-white p-3 border rounded overflow-x-auto">{JSON.stringify(log.details ?? {}, null, 2)}</pre>
                          <pre className="bg-white p-3 border rounded overflow-x-auto">{JSON.stringify({ provenance: log.provenance, previous_hash: log.previous_log_hash, hash: log.tamper_evident_hash }, null, 2)}</pre>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
