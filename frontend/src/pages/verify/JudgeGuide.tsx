import React from 'react';
import { Play, Copy, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const JudgeGuide = () => {

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied: " + text);
  };

  const FlowCard = ({ title, time, url, expected, steps }: any) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Play className="w-5 h-5 text-canara-primary" /> {title}
        </h3>
        <span className="flex items-center gap-1 text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded">
          <Clock className="w-3 h-3" /> {time}
        </span>
      </div>
      
      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4 flex justify-between items-center">
        <code className="text-sm font-mono text-canara-primary">{url}</code>
        <Link to={url} target="_blank" className="text-xs font-bold bg-white border px-3 py-1.5 rounded hover:bg-slate-50">
          Open Flow
        </Link>
      </div>

      <ol className="list-decimal pl-5 mb-4 text-sm text-slate-700 space-y-2">
        {steps.map((s: string, i: number) => <li key={i}>{s}</li>)}
      </ol>

      <div className="bg-canara-success/5 p-3 rounded-lg border border-canara-success/20 flex items-start gap-2">
        <CheckCircle className="w-4 h-4 text-canara-success shrink-0 mt-0.5" />
        <p className="text-sm text-canara-success font-medium">Expected: {expected}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        
        <div className="bg-slate-900 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">Judge Quick-Test Guide</h1>
            <p className="text-slate-400">Welcome Judge! Test these 5 core flows in 5 minutes.</p>
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Admin Credentials</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-mono">
                  <span>EMP-COMP-001</span>
                  <button onClick={() => copyToClipboard('EMP-COMP-001')} className="text-slate-500 hover:text-white"><Copy className="w-4 h-4"/></button>
                </div>
                <div className="flex justify-between items-center text-sm font-mono text-slate-400">
                  <span>Demo@123</span>
                  <button onClick={() => copyToClipboard('Demo@123')} className="text-slate-500 hover:text-white"><Copy className="w-4 h-4"/></button>
                </div>
              </div>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Department Credentials</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-mono">
                  <span>EMP-INFOSEC-002</span>
                  <button onClick={() => copyToClipboard('EMP-INFOSEC-002')} className="text-slate-500 hover:text-white"><Copy className="w-4 h-4"/></button>
                </div>
                <div className="flex justify-between items-center text-sm font-mono text-slate-400">
                  <span>Demo@123</span>
                  <button onClick={() => copyToClipboard('Demo@123')} className="text-slate-500 hover:text-white"><Copy className="w-4 h-4"/></button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <FlowCard 
          title="Behavioral Auth Enrollment"
          time="1 min"
          url="/auth/register"
          steps={[
            "Fill out the registration form (any details).",
            "Type the provided paragraph (Round 1).",
            "Click the appearing targets (Round 2).",
            "Retype the paragraph (Round 3)."
          ]}
          expected="See the Quality Score gauge update dynamically and reach a 'Success' state."
        />

        <FlowCard 
          title="Behavioral Login Verification"
          time="1 min"
          url="/auth/login"
          steps={[
            "Enter the Admin credentials from above.",
            "Type the password normally.",
            "Observe the Session Health Badge."
          ]}
          expected="Session Health badge turns green based on your typing patterns."
        />

        <FlowCard 
          title="Circular Ingestion"
          time="1 min"
          url="/admin/circulars/upload"
          steps={[
            "Toggle 'Judge Mode' on using the top right button.",
            "Upload any sample PDF.",
            "Watch the 4-stage ingestion animation and review the AI trace logs."
          ]}
          expected="Status shows 'Fully Parsed' with the exact number of extracted obligations."
        />

        <FlowCard 
          title="AI Gap Detection"
          time="1 min"
          url="/admin/gaps"
          steps={[
            "Select an ingested circular from the dropdown.",
            "Click 'Run Gap Detection'.",
            "Click 'Judge View' on any confirmed gap."
          ]}
          expected="See a 4-stage transparent explanation (Vector Search -> Threshold -> Keyword -> History) proving the AI's decision."
        />

        <FlowCard 
          title="System Verification"
          time="30 sec"
          url="/verify"
          steps={[
            "Click 'Run All Suites'."
          ]}
          expected="All 5 automated suites return green, proving end-to-end integration."
        />

      </div>
    </div>
  );
};
