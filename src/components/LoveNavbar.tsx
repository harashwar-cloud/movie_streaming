import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, LogOut, Sparkles, Tv } from 'lucide-react';
import { getUsername, clearAuthData } from '../services/api';
import { LOVE_IMAGES, AVATARS } from '../assets/loveImages';

interface LoveNavbarProps {
  showBackToDashboard?: boolean;
}

export const LoveNavbar: React.FC<LoveNavbarProps> = ({ showBackToDashboard = false }) => {
  const navigate = useNavigate();
  const username = getUsername() || 'Harashwar';

  const userAvatar = username.toLowerCase().includes('dharunya') ? AVATARS.Dharunya : AVATARS.Harashwar;

  const handleLogout = () => {
    clearAuthData();
    navigate('/');
  };

  return (
    <header className="px-6 py-3.5 bg-[#09060F]/80 border-b border-pink-500/15 backdrop-blur-xl sticky top-0 z-50 flex items-center justify-between shadow-lg shadow-pink-950/20">
      {/* Brand logo & tagline */}
      <div
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-3 cursor-pointer group"
      >
        <div className="relative p-2.5 bg-gradient-to-tr from-pink-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-md shadow-pink-500/30 group-hover:scale-105 transition-all">
          <Heart className="w-5 h-5 text-white fill-white animate-pulse" />
          <div className="absolute -top-1 -right-1">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-pink-400 via-pink-300 to-purple-300 bg-clip-text text-transparent font-['Outfit']">
              LoveStream
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-300 font-semibold tracking-wider uppercase text-[10px]">
              Private Space
            </span>
          </div>
          <p className="text-[11px] text-pink-300/70 font-medium">
            Harashwar ❤️ Dharunya
          </p>
        </div>
      </div>

      {/* Couple avatars & user info */}
      <div className="flex items-center gap-4">
        {/* Couple Avatars Badge */}
        <div className="hidden sm:flex items-center gap-2 p-1.5 px-3 rounded-full bg-pink-950/40 border border-pink-500/20 backdrop-blur-md shadow-inner">
          <div className="relative w-8 h-8 rounded-full ring-2 ring-pink-500/60 overflow-hidden shrink-0">
            <img src={LOVE_IMAGES.man} alt="Harashwar" className="w-full h-full object-cover" />
          </div>
          <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400 animate-bounce" />
          <div className="relative w-8 h-8 rounded-full ring-2 ring-purple-500/60 overflow-hidden shrink-0">
            <img src={LOVE_IMAGES.girl} alt="Dharunya" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Current Logged User */}
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-full p-0.5 bg-gradient-to-tr from-pink-500 to-purple-500">
            <img
              src={userAvatar}
              alt={username}
              className="w-full h-full object-cover rounded-full"
            />
          </div>

          <div className="text-right hidden md:block">
            <p className="text-xs font-bold text-white leading-none mb-1 flex items-center justify-end gap-1">
              {username}
              <span className="text-pink-400">❤️</span>
            </p>
            <span className="text-[10px] font-semibold text-pink-300/60 uppercase tracking-widest block">
              Always Together ❤️
            </span>
          </div>
        </div>

        {showBackToDashboard && (
          <button
            onClick={() => navigate('/dashboard')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-pink-500/10 border border-pink-500/20 hover:bg-pink-500/20 text-pink-300 text-xs font-medium rounded-xl transition-all"
          >
            <Tv className="w-4 h-4" />
            Dashboard
          </button>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-2 bg-pink-950/30 border border-pink-500/20 text-pink-300 hover:text-white hover:bg-pink-900/40 rounded-xl transition-all shadow-sm"
          title="Sign Out of LoveStream"
        >
          <LogOut className="w-4.5 h-4.5" />
        </button>
      </div>
    </header>
  );
};
