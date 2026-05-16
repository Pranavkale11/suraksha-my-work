import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, User, ArrowRight } from 'lucide-react';
import { useBehavioralCapture } from '../../hooks/useBehavioralCapture';
import { BehavioralCaptureIndicator } from '../../components/auth/BehavioralCaptureIndicator';
import { SessionHealthBadge } from '../../components/auth/SessionHealthBadge';
import { useAuth } from '../../hooks/useAuth';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [empId, setEmpId] = useState('');
  const [password, setPassword] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { captureKeystrokeDown, captureKeystrokeUp, keystrokeData } = useBehavioralCapture();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    setIsCapturing(true);
    captureKeystrokeDown(e);
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    captureKeystrokeUp(e);
    // Stop capturing visual after 1s of inactivity
    setTimeout(() => setIsCapturing(false), 1000);
  };

  const { login, sessionHealth } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(
        { emp_id: empId, password },
        { keystroke: keystrokeData }
      );
      navigate('/admin/circulars/upload'); // Default route for demo
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid credentials or failed behavioral check.');
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Side: Gradient & Branding */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-canara-blue to-[#002255] flex-col justify-center items-center p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10 text-center"
        >
          <Shield className="w-24 h-24 mx-auto mb-8 text-canara-green drop-shadow-[0_0_15px_rgba(0,168,107,0.8)]" />
          <h1 className="text-5xl font-bold mb-4 tracking-tight">SuRaksha MAPS v4.0</h1>
          <p className="text-xl text-blue-100 font-light">Deterministic Compliance. Intelligent Augmentation.</p>
        </motion.div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center items-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold text-foreground">Sign In</h2>
            <SessionHealthBadge status={sessionHealth} />
          </div>

          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-6"
            animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" /> Employee ID
              </label>
              <input
                type="text"
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyUp}
                className="w-full p-3 bg-background border rounded-lg focus:ring-2 focus:ring-canara-blue outline-none transition-shadow"
                placeholder="EMP-0000"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" /> Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyUp}
                className="w-full p-3 bg-background border rounded-lg focus:ring-2 focus:ring-canara-blue outline-none transition-shadow"
                placeholder="••••••••"
                required
              />
              <BehavioralCaptureIndicator isCapturing={isCapturing} />
            </div>

            <div className="flex items-center justify-between text-sm">
              <Link to="/auth/token" className="text-canara-blue hover:underline">
                Use Hardware Token
              </Link>
              <Link to="/auth/enroll" className="text-muted-foreground hover:text-foreground">
                First time setup? Enroll here
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-canara-blue text-white rounded-lg font-medium hover:bg-canara-blue/90 transition-colors flex justify-center items-center gap-2 disabled:opacity-70"
            >
              {isLoading ? 'Authenticating...' : 'Secure Login'}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </motion.form>
        </div>
      </div>
    </div>
  );
};
