
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-lg px-4 pr-12 h-11 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-white transition-colors"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors p-1 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m13.42 13.42l-3.29-3.29m0 0L3 3m16.71 16.71L20.71 20.71" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
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
