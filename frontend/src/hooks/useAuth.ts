import { useState, useEffect } from 'react';
import { authApi } from '../api/auth';
import { toast } from '../components/common/ToastProvider';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!localStorage.getItem('jwt_token'));
  const [sessionHealth, setSessionHealth] = useState<'healthy' | 'warning' | 'critical' | 'disconnected'>('disconnected');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Basic sync from localStorage
    setIsAuthenticated(!!localStorage.getItem('jwt_token'));
  }, []);

  const login = async (credentials: any, behavioralData: any) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(credentials, behavioralData);
      localStorage.setItem('jwt_token', res.token);
      localStorage.setItem('session_id', res.session_id);
      setIsAuthenticated(true);
      
      // Derive session health from risk score
      if (res.access_level === 'full' && res.risk_score < 20) setSessionHealth('healthy');
      else if (res.access_level === 'full' && res.risk_score < 40) setSessionHealth('warning');
      else if (res.access_level === 'restricted') setSessionHealth('critical');
      else setSessionHealth('critical');
      
      toast('success', 'Authentication successful');
      return res;
    } catch (e: any) {
      toast('error', e.response?.data?.detail || 'Authentication failed');
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await authApi.register(data);
      localStorage.setItem('jwt_token', res.token);
      setIsAuthenticated(true);
      toast('success', 'Registration successful. Proceeding to behavioral enrollment.');
      return res;
    } catch (e: any) {
      toast('error', e.response?.data?.detail || 'Registration failed');
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const enrollRound = async (roundNumber: number, data: any) => {
    setIsLoading(true);
    try {
      const res = await authApi.enrollRound(roundNumber, data);
      return res;
    } catch (e: any) {
      toast('error', e.response?.data?.detail || 'Enrollment round failed');
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('session_id');
    setIsAuthenticated(false);
    setSessionHealth('red');
    window.location.href = '/auth/login';
  };

  return {
    isAuthenticated,
    sessionHealth,
    isLoading,
    login,
    register,
    enrollRound,
    logout
  };
};
