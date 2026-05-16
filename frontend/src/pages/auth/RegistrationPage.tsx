import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, User, Mail, Phone, Lock, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';

export const RegistrationPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [generatedEmpId, setGeneratedEmpId] = useState('');

  const handleDepartmentChange = (val: string) => {
    setDepartment(val);
    if (val) {
      setGeneratedEmpId(`${val}-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    } else {
      setGeneratedEmpId('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({
        emp_id: generatedEmpId,
        password,
        email,
        role: "department_user",
        department
      });
      navigate('/auth/enroll');
    } catch (err) {
      console.error(err);
    }
  };

  // Password strength calculation
  const getStrength = (pass: string) => {
    let score = 0;
    if (pass.length > 8) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass)) score += 25;
    if (/[^A-Za-z0-9]/.test(pass)) score += 25;
    return score;
  };

  const strength = getStrength(password);
  
  let strengthColor = 'bg-gray-200';
  if (strength > 75) strengthColor = 'bg-canara-green';
  else if (strength > 50) strengthColor = 'bg-canara-blue';
  else if (strength > 25) strengthColor = 'bg-canara-orange';
  else if (strength > 0) strengthColor = 'bg-canara-red';

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card border rounded-xl shadow-sm overflow-hidden"
      >
        <div className="bg-canara-blue p-6 text-white text-center">
          <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-canara-green" />
          <h2 className="text-2xl font-bold">New Employee Setup</h2>
          <p className="text-blue-100 text-sm mt-1">Register for SuRaksha MAPS</p>
        </div>

        <form className="p-6 space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><User className="w-3.5 h-3.5"/> Full Name</label>
              <input required className="w-full p-2.5 text-sm bg-background border rounded-md focus:ring-1 focus:ring-canara-blue outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><Phone className="w-3.5 h-3.5"/> Mobile</label>
              <input required className="w-full p-2.5 text-sm bg-background border rounded-md focus:ring-1 focus:ring-canara-blue outline-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><Mail className="w-3.5 h-3.5"/> Corporate Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-2.5 text-sm bg-background border rounded-md focus:ring-1 focus:ring-canara-blue outline-none" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5"/> Department</label>
            <select 
              required
              className="w-full p-2.5 text-sm bg-background border rounded-md focus:ring-1 focus:ring-canara-blue outline-none"
              onChange={(e) => handleDepartmentChange(e.target.value)}
              value={department}
            >
              <option value="">Select Department</option>
              <option value="IT">IT Security</option>
              <option value="HR">Human Resources</option>
              <option value="FIN">Finance</option>
              <option value="COMP">Compliance</option>
            </select>
          </div>

          <AnimatePresence>
            {generatedEmpId && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 bg-secondary/50 rounded-md border border-secondary"
              >
                <p className="text-xs text-muted-foreground">Auto-generated Employee ID:</p>
                <p className="text-lg font-mono font-bold text-foreground mt-0.5">
                  {generatedEmpId}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><Lock className="w-3.5 h-3.5"/> Setup Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 text-sm bg-background border rounded-md focus:ring-1 focus:ring-canara-blue outline-none" 
            />
            {/* Strength Meter */}
            <div className="h-1.5 w-full bg-gray-200 rounded-full mt-2 overflow-hidden">
              <motion.div 
                className={`h-full ${strengthColor}`} 
                initial={{ width: 0 }}
                animate={{ width: `${strength}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground text-right">{strength}% Strength</p>
          </div>

          <button type="submit" className="w-full py-3 mt-4 bg-canara-blue text-white rounded-md font-medium hover:bg-canara-blue/90 transition-colors">
            Continue to Enrollment
          </button>
        </form>
      </motion.div>
    </div>
  );
};
