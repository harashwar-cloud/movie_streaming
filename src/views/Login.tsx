import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Key, User, ArrowRight, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { api, setAuthData } from '../services/api';
import { LOVE_IMAGES } from '../assets/loveImages';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please fill in both fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.login({ username, password });
      setAuthData(res.token, res.username, res.role);
      
      // Trigger heart explosion & romantic success state
      setLoginSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1800);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden bg-[#09060F]">
      
      {/* Kissing Background Image Layer with Blur & Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={LOVE_IMAGES.kissing}
          alt="Harashwar & Dharunya Kissing"
          className="w-full h-full object-cover filter blur-sm scale-105 opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09060F] via-[#09060F]/75 to-pink-950/40" />
      </div>

      {/* Floating Sparkles & Orbs */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-pink-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Login Glass Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="relative p-3.5 bg-gradient-to-tr from-pink-600 via-pink-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-pink-500/40 mb-4 animate-heart-pulse">
            <Heart className="w-9 h-9 text-white fill-white" />
            <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300 animate-spin" />
          </div>

          <h2 className="text-3xl font-extrabold text-white tracking-tight font-['Outfit']">
            Welcome to LoveStream ❤️
          </h2>
          <p className="text-pink-200/70 text-xs mt-1 font-medium">
            Private Space for Harashwar ❤️ Dharunya
          </p>
        </div>

        {/* Card Container */}
        <div className="glass-love-heavy p-8 rounded-3xl border border-pink-500/30 shadow-2xl relative overflow-hidden">
          
          <AnimatePresence>
            {loginSuccess ? (
              /* Success Romantic Overlay Animation */
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="py-10 text-center space-y-4"
              >
                <div className="w-16 h-16 bg-gradient-to-tr from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-pink-500/50 animate-bounce">
                  <Heart className="w-9 h-9 text-white fill-white" />
                </div>
                <h3 className="text-2xl font-extrabold text-white font-['Outfit']">
                  Welcome Back, My Love! 💕
                </h3>
                <p className="text-xs text-pink-200/80">Opening our synchronized movie world...</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 bg-red-500/15 border border-red-500/30 rounded-2xl flex items-start gap-3 text-xs text-red-300"
                  >
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {/* Username Input */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-pink-300/80 uppercase tracking-widest block">
                    Our Secret Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-pink-400">
                      <User className="w-4.5 h-4.5" />
                    </span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter Harashwar or Dharunya"
                      className="w-full pl-11 pr-4 py-3 bg-[#09060F]/70 border border-pink-500/20 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-2xl text-xs text-white placeholder-pink-300/30 outline-none transition-all"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-pink-300/80 uppercase tracking-widest block">
                    Passcode
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-pink-400">
                      <Key className="w-4.5 h-4.5" />
                    </span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-3 bg-[#09060F]/70 border border-pink-500/20 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-2xl text-xs text-white placeholder-pink-300/30 outline-none transition-all"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                {/* Heart Pulse Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-pink-600 via-pink-500 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-xl shadow-pink-600/30 hover:scale-[1.02] disabled:opacity-50 font-['Outfit']"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      Opening Love Vault...
                    </>
                  ) : (
                    <>
                      Enter Our Space ❤️
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-pink-300/60 mt-6 font-medium">
          New love account?{' '}
          <Link to="/register" className="text-pink-400 hover:text-white font-bold transition-colors">
            Register Here
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
