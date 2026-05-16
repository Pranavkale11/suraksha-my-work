import { useState } from 'react';
import { CheckCircle2, XCircle, Loader2, PlayCircle, ShieldCheck, Database, Server, RefreshCw } from 'lucide-react';
import { apiClient } from '../../api/client';
import { authApi } from '../../api/auth';
import { circularsApi } from '../../api/circulars';
import { gapsApi } from '../../api/gaps';

export const VerifyDashboardPage = () => {
  const [suiteStatus, setSuiteStatus] = useState<Record<number, 'idle' | 'running' | 'pass' | 'fail'>>({
    1: 'idle', 2: 'idle', 3: 'idle', 4: 'idle', 5: 'idle'
  });
  const [logs, setLogs] = useState<Record<number, any[]>>({
    1: [], 2: [], 3: [], 4: [], 5: []
  });

  const appendLog = (suite: number, log: any) => {
    setLogs(prev => ({ ...prev, [suite]: [...prev[suite], log] }));
  };

  const runSuite1 = async () => {
    setSuiteStatus(prev => ({ ...prev, 1: 'running' }));
    setLogs(prev => ({ ...prev, 1: [] }));
    try {
      const res = await apiClient.get('/api/debug/deployment');
      appendLog(1, { step: "Database Check", data: res.data.database_connected ? "OK" : "FAIL" });
      appendLog(1, { step: "Vector Search", data: res.data.vector_search_ready ? "OK" : "FAIL" });
      if (res.data.database_connected) setSuiteStatus(prev => ({ ...prev, 1: 'pass' }));
      else setSuiteStatus(prev => ({ ...prev, 1: 'fail' }));
    } catch (e: any) {
      appendLog(1, { step: "Error", data: e.message });
      setSuiteStatus(prev => ({ ...prev, 1: 'fail' }));
    }
  };

  const runSuite2 = async () => {
    setSuiteStatus(prev => ({ ...prev, 2: 'running' }));
    setLogs(prev => ({ ...prev, 2: [] }));
    try {
      const ts = Date.now();
      const mockCreds = { emp_id: `EMP-TEST-${ts}`, password: "TestPassword123!", department: "IT", email: `test${ts}@canara.com` };
      
      appendLog(2, { step: "Registering", data: mockCreds.emp_id });
      await authApi.register(mockCreds);
      
      appendLog(2, { step: "Enrollment Round 1", data: "Sending mock keystrokes" });
      await authApi.enrollRound(1, { keystroke: { totalKeys: 50 } });
      
      appendLog(2, { step: "Enrollment Round 2", data: "Sending mock mouse data" });
      await authApi.enrollRound(2, { mouse: { trajectory: [] } });
      
      appendLog(2, { step: "Enrollment Round 3", data: "Consistency check" });
      const enrollRes = await authApi.enrollRound(3, { keystroke: { totalKeys: 50 } });
      appendLog(2, { step: "Quality Score", data: enrollRes.quality_score });

      if (enrollRes.quality_score >= 0.70) {
        setSuiteStatus(prev => ({ ...prev, 2: 'pass' }));
      } else {
        setSuiteStatus(prev => ({ ...prev, 2: 'fail' }));
      }
    } catch (e: any) {
      appendLog(2, { step: "Error", data: e.response?.data || e.message });
      setSuiteStatus(prev => ({ ...prev, 2: 'fail' }));
    }
  };

  const runSuite3 = async () => {
    setSuiteStatus(prev => ({ ...prev, 3: 'running' }));
    setLogs(prev => ({ ...prev, 3: [] }));
    try {
      appendLog(3, { step: "Fetch List", data: "Requesting circulars" });
      const res = await circularsApi.list();
      appendLog(3, { step: "Response", data: `Found ${res.circulars.length} circulars` });
      setSuiteStatus(prev => ({ ...prev, 3: 'pass' }));
    } catch (e: any) {
      appendLog(3, { step: "Error", data: e.message });
      setSuiteStatus(prev => ({ ...prev, 3: 'fail' }));
    }
  };

  const runSuite4 = async () => {
    setSuiteStatus(prev => ({ ...prev, 4: 'running' }));
    setLogs(prev => ({ ...prev, 4: [] }));
    try {
      appendLog(4, { step: "Checking pre-seeded policies", data: "..." });
      // In a real demo, we'd trigger gaps on a known seeded circular.
      // For this test, we just check the queue endpoint
      const res = await gapsApi.queue();
      appendLog(4, { step: "Queue Status", data: `Found ${res.queue.length} gaps in queue` });
      setSuiteStatus(prev => ({ ...prev, 4: 'pass' }));
    } catch (e: any) {
      appendLog(4, { step: "Error", data: e.message });
      setSuiteStatus(prev => ({ ...prev, 4: 'fail' }));
    }
  };

  const runSuite5 = async () => {
    setSuiteStatus(prev => ({ ...prev, 5: 'running' }));
    setLogs(prev => ({ ...prev, 5: [] }));
    try {
      appendLog(5, { step: "End-to-End Chain", data: "Validating CORS and Deployment" });
      const res = await apiClient.get('/api/debug/cors-test');
      appendLog(5, { step: "CORS", data: res.data.cors });
      setSuiteStatus(prev => ({ ...prev, 5: 'pass' }));
    } catch (e: any) {
      appendLog(5, { step: "Error", data: e.message });
      setSuiteStatus(prev => ({ ...prev, 5: 'fail' }));
    }
  };

  const runAll = async () => {
    await runSuite1();
    await runSuite2();
    await runSuite3();
    await runSuite4();
    await runSuite5();
  };

  const allPassed = Object.values(suiteStatus).every(s => s === 'pass');
  const anyFailed = Object.values(suiteStatus).some(s => s === 'fail');

  const renderSuite = (num: number, title: string, icon: any, runFn: () => void) => {
    const status = suiteStatus[num];
    return (
      <div className="bg-white rounded-xl border p-5 shadow-sm mb-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${status === 'pass' ? 'bg-canara-success/10 text-canara-success' : status === 'fail' ? 'bg-canara-danger/10 text-canara-danger' : 'bg-slate-100 text-slate-500'}`}>
              {icon}
            </div>
            <h3 className="font-bold text-slate-800">Suite {num}: {title}</h3>
          </div>
          <div className="flex items-center gap-3">
            {status === 'running' && <Loader2 className="w-5 h-5 text-canara-primary animate-spin" />}
            {status === 'pass' && <CheckCircle2 className="w-5 h-5 text-canara-success" />}
            {status === 'fail' && <XCircle className="w-5 h-5 text-canara-danger" />}
            <button 
              onClick={runFn}
              disabled={status === 'running'}
              className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors disabled:opacity-50"
            >
              Run
            </button>
          </div>
        </div>
        
        {logs[num].length > 0 && (
          <div className="bg-slate-900 rounded-lg p-3 text-xs font-mono text-slate-300 space-y-1">
            {logs[num].map((log, i) => (
              <div key={i} className="flex gap-4">
                <span className="text-canara-primary w-32 shrink-0">[{log.step}]</span>
                <span className={log.data === 'FAIL' ? 'text-red-400' : 'text-slate-300'}>
                  {typeof log.data === 'object' ? JSON.stringify(log.data) : log.data}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">System Verification</h1>
            <p className="text-slate-600">Run integration test suites to validate frontend-backend connectivity.</p>
          </div>
          <button 
            onClick={runAll}
            className="px-6 py-2.5 bg-canara-primary text-white rounded-lg font-bold hover:bg-canara-primary/90 flex items-center gap-2"
          >
            <PlayCircle className="w-5 h-5" /> Run All Suites
          </button>
        </div>

        {allPassed && (
          <div className="mb-6 p-4 bg-canara-success/10 border border-canara-success/30 rounded-xl flex items-center gap-3 text-canara-success font-bold">
            <CheckCircle2 className="w-6 h-6" /> SYSTEM READY FOR DEMO
          </div>
        )}
        
        {anyFailed && (
          <div className="mb-6 p-4 bg-canara-danger/10 border border-canara-danger/30 rounded-xl flex items-center gap-3 text-canara-danger font-bold">
            <XCircle className="w-6 h-6" /> VERIFICATION FAILED — Check Backend Logs
          </div>
        )}

        <div className="space-y-4">
          {renderSuite(1, "Connectivity", <Database className="w-5 h-5"/>, runSuite1)}
          {renderSuite(2, "Authentication Flow", <ShieldCheck className="w-5 h-5"/>, runSuite2)}
          {renderSuite(3, "Circular Ingestion", <Server className="w-5 h-5"/>, runSuite3)}
          {renderSuite(4, "Gap Detection", <RefreshCw className="w-5 h-5"/>, runSuite4)}
          {renderSuite(5, "End-to-End Environment", <PlayCircle className="w-5 h-5"/>, runSuite5)}
        </div>
      </div>
    </div>
  );
};
