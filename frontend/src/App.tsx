import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage';
import { EnrollmentPage } from './pages/auth/EnrollmentPage';
import { RegistrationPage } from './pages/auth/RegistrationPage';
import { CircularUploadPage } from './pages/watcher/CircularUploadPage';
import { CircularBoardPage } from './pages/watcher/CircularBoardPage';
import { CircularDetailPage } from './pages/watcher/CircularDetailPage';
import { GapDashboard } from './pages/gaps/GapDashboard';
import { GapQueue } from './pages/gaps/GapQueue';
import { VerifyDashboardPage } from './pages/verify/VerifyDashboardPage';
import { JudgeGuide } from './pages/verify/JudgeGuide';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ToastProvider } from './components/common/ToastProvider';
import { JudgePanel } from './components/common/JudgePanel';

const NAV_ITEMS = [
  { label: 'Login', href: '/auth/login', desc: 'Behavioral auth with keystroke dynamics', color: 'bg-canara-blue' },
  { label: 'Upload Circular', href: '/admin/circulars/upload', desc: 'Regulatory ingestion pipeline (Watcher)', color: 'bg-emerald-600' },
  { label: 'Circular Board', href: '/admin/circulars', desc: 'Kanban view of all ingested circulars', color: 'bg-slate-700' },
  { label: 'Gap Detector', href: '/admin/gaps', desc: 'AI-powered compliance gap analysis', color: 'bg-yellow-600' },
  { label: 'Gap Queue', href: '/admin/gaps/queue', desc: 'Triage & approve gap reports', color: 'bg-orange-600' },
  { label: '✅ Verify System', href: '/verify', desc: 'Run all 5 integration test suites', color: 'bg-purple-700' },
  { label: '📖 Judge Guide', href: '/guide', desc: '5-minute demo walkthrough for judges', color: 'bg-rose-700' },
];

function Home() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-canara-blue/20 border border-canara-blue/30 px-4 py-1.5 rounded-full text-sm font-semibold text-canara-blue mb-6">
            🛡️ HACKATHON DEMO MODE
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4 bg-gradient-to-r from-white via-blue-200 to-canara-blue bg-clip-text text-transparent">
            SuRaksha MAPS
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Multi-Agent Persistent Security · v4.0 · Canara Bank
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="group bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-xl p-5 transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className={`inline-block px-2 py-0.5 rounded text-xs font-bold text-white mb-3 ${item.color}`}>
                {item.label}
              </div>
              <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                {item.desc}
              </p>
            </Link>
          ))}
        </div>

        <p className="text-center text-slate-600 text-xs mt-10">
          Backend: <code className="text-slate-400">http://localhost:8000</code> · Judge Mode: use the 🔍 button (top-right)
        </p>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider />
        <JudgePanel />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/enroll" element={<EnrollmentPage />} />
          <Route path="/auth/register" element={<RegistrationPage />} />

          {/* Watcher Routes */}
          <Route path="/admin/circulars/upload" element={<CircularUploadPage />} />
          <Route path="/admin/circulars" element={<CircularBoardPage />} />
          <Route path="/admin/circulars/:id" element={<CircularDetailPage />} />

          {/* Gap Detector Routes */}
          <Route path="/admin/gaps" element={<GapDashboard />} />
          <Route path="/admin/gaps/queue" element={<GapQueue />} />

          {/* Verify & Judge Tools */}
          <Route path="/verify" element={<VerifyDashboardPage />} />
          <Route path="/guide" element={<JudgeGuide />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
