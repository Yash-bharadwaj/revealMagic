
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'performer' && user.performerId) {
        navigate(`/${user.performerId}`, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      // Navigation will happen in useEffect when auth state updates
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 font-sans selection:bg-zinc-800 selection:text-white">
      <div className="w-full max-w-[400px]">
        {/* Logo / Header */}
        <div className="text-center mb-10">
          <div className="w-10 h-10 bg-white rounded-md mx-auto flex items-center justify-center mb-6">
            <span className="text-black font-black text-xl">R</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Welcome back</h2>
          <p className="text-zinc-500 text-sm mt-2">Enter your credentials to access the system.</p>
        </div>

        {/* Login Form */}
        <div className="bg-zinc-950/50 border border-zinc-800 p-8 rounded-2xl shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-rose-900/20 border border-rose-800 text-rose-400 text-xs px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-lg px-4 h-11 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-white transition-colors"
                placeholder="your@email.com"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Secret Key</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-lg px-4 h-11 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-white transition-colors"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-white hover:bg-zinc-200 text-black font-bold rounded-lg transition-all flex items-center justify-center text-sm disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
              ) : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-zinc-600 text-[10px] uppercase tracking-[0.2em] mt-12 font-bold">
          Restricted Access Only
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
