import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Tv, Shield, Zap, MapPin, MessageSquare, ArrowRight, Play, Film, Calendar } from 'lucide-react';
import { getToken } from '../services/api';
import { LOVE_IMAGES } from '../assets/loveImages';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [daysTogether, setDaysTogether] = useState(120);

  useEffect(() => {
    // Dynamic calculation starting at 120 days today
    const startDate = new Date('2026-04-09').getTime();
    const now = new Date().getTime();
    const diffDays = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
    if (diffDays > 0) setDaysTogether(diffDays);
  }, []);

  const handleStart = () => {
    if (getToken()) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const features = [
    {
      icon: <Tv className="w-6 h-6 text-pink-400" />,
      title: 'Synchronized Playback',
      description: 'Harashwar & Dharunya watch together with <200ms real-time synchronization.',
    },
    {
      icon: <Zap className="w-6 h-6 text-purple-400" />,
      title: 'Spring WebSockets STOMP',
      description: 'Lightning-fast real-time STOMP WebSocket channels keeping both screens matched.',
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-rose-400" />,
      title: 'Love Chat & Emojis',
      description: 'Private messenger with love reactions (❤️ 😘 🥰 💕), typing status, and sweet notes.',
    },
    {
      icon: <MapPin className="w-6 h-6 text-pink-500" />,
      title: 'Interactive Couple Map',
      description: 'Live Leaflet map showing distance between Harashwar & Dharunya with an animated pink heart route.',
    },
    {
      icon: <Film className="w-6 h-6 text-yellow-400" />,
      title: 'Shared Movie Library',
      description: 'Upload local media or import Google Drive folders for instant romantic movie nights.',
    },
    {
      icon: <Shield className="w-6 h-6 text-cyan-400" />,
      title: 'Private & Secure Space',
      description: 'JWT authenticated private platform created exclusively for Harashwar ❤️ Dharunya.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#09060F] text-slate-100 flex flex-col relative overflow-hidden">
      {/* Background Glow Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-pink-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Glass Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-pink-500/15 backdrop-blur-xl sticky top-0 z-50 bg-[#09060F]/80">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="p-2.5 bg-gradient-to-tr from-pink-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/30">
            <Heart className="w-6 h-6 text-white fill-white animate-pulse" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-pink-400 to-purple-300 bg-clip-text text-transparent font-['Outfit']">
              LoveStream
            </span>
            <p className="text-[10px] text-pink-300/70 font-semibold uppercase tracking-widest leading-none mt-0.5">
              Harashwar ❤️ Dharunya
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/login')}
            className="text-xs font-semibold text-pink-300/80 hover:text-white transition-colors px-3 py-1.5"
          >
            Sign In
          </button>
          <button
            onClick={handleStart}
            className="text-xs font-bold bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white px-5 py-2.5 rounded-full transition-all shadow-lg shadow-pink-600/30 hover:scale-105 flex items-center gap-2"
          >
            Enter Our World
            <Heart className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-16 flex flex-col items-center justify-center text-center relative z-10">
        
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-950/40 border border-pink-500/30 text-pink-300 text-xs font-bold mb-8 shadow-inner"
        >
          <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
          <span>Our Private Cinema & Digital Love Diary</span>
          <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.15] font-['Outfit']"
        >
          Every Movie Becomes{' '}
          <span className="bg-gradient-to-r from-pink-400 via-pink-300 to-purple-400 bg-clip-text text-transparent text-glow-pink">
            Our Memory ❤️
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg sm:text-xl text-pink-200/80 mb-10 max-w-2xl leading-relaxed font-light"
        >
          Made only for <strong className="text-white font-bold">Harashwar ❤️ Dharunya</strong>. Watch synchronized streams, share sweet notes, and store love memories together.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-5 mb-16"
        >
          <button
            onClick={handleStart}
            className="text-sm font-extrabold bg-gradient-to-r from-pink-600 via-pink-500 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white px-9 py-4 rounded-full transition-all shadow-xl shadow-pink-600/35 hover:scale-105 flex items-center justify-center gap-3 font-['Outfit']"
          >
            <Play className="w-5 h-5 fill-current" />
            Watch Together Now
          </button>
          
          <button
            onClick={() => {
              document.getElementById('love-counter')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-sm font-bold bg-pink-950/40 border border-pink-500/25 hover:bg-pink-900/50 text-pink-200 px-8 py-4 rounded-full transition-all flex items-center justify-center gap-2"
          >
            Explore Our Story
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>

        {/* Couple Hero Photo Frame */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="w-full max-w-4xl relative rounded-3xl overflow-hidden border border-pink-500/30 shadow-2xl shadow-pink-950/50 p-2 glass-love group mb-20"
        >
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-pink-950/40">
            <img
              src={LOVE_IMAGES.landscape}
              alt="Harashwar and Dharunya"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#09060F] via-transparent to-transparent opacity-80" />

            {/* Floating Couple Card Overlay */}
            <div className="absolute bottom-6 left-6 right-6 p-6 glass-love-heavy rounded-2xl border border-pink-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  <img
                    src={LOVE_IMAGES.man}
                    alt="Harashwar"
                    className="w-12 h-12 rounded-full border-2 border-pink-500 object-cover shadow-md"
                  />
                  <img
                    src={LOVE_IMAGES.girl}
                    alt="Dharunya"
                    className="w-12 h-12 rounded-full border-2 border-purple-500 object-cover shadow-md"
                  />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white leading-tight font-['Outfit']">
                    Harashwar ❤️ Dharunya
                  </h3>
                  <p className="text-xs text-pink-300/80">Synchronized Streaming Room Active</p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-300 text-xs font-bold animate-pulse">
                <Heart className="w-4 h-4 fill-pink-400 text-pink-400" />
                <span>Connected in Love</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Love Counter Section */}
        <section id="love-counter" className="w-full py-12 mb-16">
          <div className="glass-love p-8 rounded-3xl border border-pink-500/25 max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="p-4 space-y-1">
              <div className="w-10 h-10 mx-auto mb-2 rounded-2xl bg-pink-500/15 flex items-center justify-center text-pink-400">
                <Calendar className="w-5 h-5" />
              </div>
              <p className="text-3xl font-extrabold text-white font-['Outfit'] text-glow-pink">
                {daysTogether} Days
              </p>
              <p className="text-xs text-pink-300/70 uppercase tracking-widest font-semibold">
                Together in Love
              </p>
            </div>

            <div className="p-4 space-y-1 border-y sm:border-y-0 sm:border-x border-pink-500/15">
              <div className="w-10 h-10 mx-auto mb-2 rounded-2xl bg-purple-500/15 flex items-center justify-center text-purple-400">
                <Film className="w-5 h-5" />
              </div>
              <p className="text-3xl font-extrabold text-white font-['Outfit'] text-glow-purple">
                ∞ Movies
              </p>
              <p className="text-xs text-pink-300/70 uppercase tracking-widest font-semibold">
                Watched Together
              </p>
            </div>

            <div className="p-4 space-y-1">
              <div className="w-10 h-10 mx-auto mb-2 rounded-2xl bg-rose-500/15 flex items-center justify-center text-rose-400">
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <p className="text-3xl font-extrabold text-white font-['Outfit'] text-glow-pink">
                100%
              </p>
              <p className="text-xs text-pink-300/70 uppercase tracking-widest font-semibold">
                Heart Sync Rate
              </p>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="w-full py-8 border-t border-pink-500/15">
          <h2 className="text-3xl font-extrabold text-white text-center mb-12 font-['Outfit']">
            Why LoveStream is Our Special Place ❤️
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="glass-love p-8 rounded-3xl text-left border border-pink-500/15 hover:border-pink-500/40 hover:-translate-y-2 transition-all group"
              >
                <div className="p-3.5 bg-pink-950/50 border border-pink-500/20 rounded-2xl mb-5 w-fit group-hover:scale-110 transition-transform">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2 font-['Outfit'] group-hover:text-pink-300 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-pink-200/70 text-xs leading-relaxed font-light">
                  {feat.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer Banner */}
      <footer className="py-8 text-center text-xs text-pink-300/60 border-t border-pink-500/15 bg-[#09060F]/60 backdrop-blur-md">
        <p className="flex items-center justify-center gap-1.5 font-medium">
          Made with <Heart className="w-4 h-4 text-pink-500 fill-pink-500 animate-pulse" /> for
          <span className="text-white font-bold font-['Outfit']">Harashwar ❤️ Dharunya</span>
        </p>
      </footer>
    </div>
  );
};
