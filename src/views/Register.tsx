import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Key, User, ArrowRight, AlertCircle, RefreshCw, Users, Crown, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { LOVE_IMAGES } from '../assets/loveImages';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ROLE_VIEWER' | 'ROLE_ADMIN'>('ROLE_VIEWER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.register({ username, password, role });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Username may already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden bg-[#09060F]">
      
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <img
          src={LOVE_IMAGES.handHolding}
          alt="Hand Holding Background"
          className="w-full h-full object-cover filter blur-sm scale-105 opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09060F] via-[#09060F]/80 to-purple-950/40" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="relative p-3.5 bg-gradient-to-tr from-pink-600 via-pink-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-pink-500/40 mb-4 animate-heart-pulse">
            <Heart className="w-9 h-9 text-white fill-white" />
            <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300 animate-spin" />
          </div>

          <h2 className="text-3xl font-extrabold text-white tracking-tight font-['Outfit']">
            Join LoveStream ❤️
          </h2>
          <p className="text-pink-200/70 text-xs mt-1 font-medium">
            Creating private credentials for Harashwar & Dharunya
          </p>
        </div>

        {/* Card */}
        <div className="glass-love-heavy p-8 rounded-3xl border border-pink-500/30 shadow-2xl">
          {success ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 bg-gradient-to-tr from-pink-500 to-purple-500 text-white rounded-full flex items-center justify-center mx-auto shadow-xl animate-bounce">
                <Heart className="w-7 h-7 fill-current" />
              </div>
              <h3 className="text-xl font-extrabold text-white font-['Outfit']">Registration Successful! ❤️</h3>
              <p className="text-xs text-pink-200/80">Redirecting to login space...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Error Message */}
              {error && (
                <div className="p-3.5 bg-red-500/15 border border-red-500/30 rounded-2xl flex items-start gap-3 text-xs text-red-300">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-pink-300/80 uppercase tracking-widest block">
                  Choose Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-pink-400">
                    <User className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="E.g., Harashwar or Dharunya"
                    className="w-full pl-11 pr-4 py-3 bg-[#09060F]/70 border border-pink-500/20 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-2xl text-xs text-white placeholder-pink-300/30 outline-none transition-all"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-pink-300/80 uppercase tracking-widest block">
                  Password
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

              {/* Role Select Buttons */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-pink-300/80 uppercase tracking-widest block">
                  Select Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('ROLE_VIEWER')}
                    className={`py-3 px-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                      role === 'ROLE_VIEWER'
                        ? 'border-pink-500 bg-pink-500/20 text-white shadow-lg shadow-pink-500/20'
                        : 'border-pink-500/20 bg-[#09060F]/50 text-pink-300/60 hover:border-pink-500/40'
                    }`}
                  >
                    <Users className="w-5 h-5 text-pink-400" />
                    <span className="text-xs font-bold font-['Outfit']">Viewer / Love Queen</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setRole('ROLE_ADMIN')}
                    className={`py-3 px-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                      role === 'ROLE_ADMIN'
                        ? 'border-purple-500 bg-purple-500/20 text-white shadow-lg shadow-purple-500/20'
                        : 'border-pink-500/20 bg-[#09060F]/50 text-pink-300/60 hover:border-pink-500/40'
                    }`}
                  >
                    <Crown className="w-5 h-5 text-purple-400" />
                    <span className="text-xs font-bold font-['Outfit']">Admin / Host King</span>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-pink-600 via-pink-500 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-xl shadow-pink-600/30 hover:scale-[1.02] disabled:opacity-50 font-['Outfit']"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    Creating Love Profile...
                  </>
                ) : (
                  <>
                    Create Account ❤️
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-pink-300/60 mt-6 font-medium">
          Already have credentials?{' '}
          <Link to="/login" className="text-pink-400 hover:text-white font-bold transition-colors">
            Sign In Here
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
