import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Tv, Plus, Search, Trash2, Video, Key, Calendar, HardDrive, UploadCloud,
  RefreshCw, AlertCircle, Heart, Sparkles, Film, StickyNote, Camera, Play
} from 'lucide-react';
import { api, getRole, getUsername } from '../services/api';
import { LOVE_IMAGES } from '../assets/loveImages';
import { LoveNavbar } from '../components/LoveNavbar';
import { MemoriesGallery } from '../components/MemoriesGallery';
import { LoveNotes } from '../components/LoveNotes';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const username = getUsername() || 'Harashwar';
  const role = getRole();
  const isAdmin = role === 'ROLE_ADMIN';

  // Active Tab
  const [activeTab, setActiveTab] = useState<'rooms' | 'videos' | 'memories' | 'notes'>('rooms');

  // State
  const [rooms, setRooms] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [favoriteVideos, setFavoriteVideos] = useState<number[]>([]);

  // Video upload state
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // Loading & Error states
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [joiningRoom, setJoiningRoom] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Google Drive state
  const [driveUrl, setDriveUrl] = useState('');
  const [importingDrive, setImportingDrive] = useState(false);

  // Days counter
  const [daysTogether, setDaysTogether] = useState(120);

  useEffect(() => {
    const startDate = new Date('2026-04-09').getTime();
    const now = new Date().getTime();
    const diffDays = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
    if (diffDays > 0) setDaysTogether(diffDays);
  }, []);

  // Fetch videos and active rooms
  const loadData = async () => {
    setLoadingVideos(true);
    try {
      const videoList = await api.getVideos(searchQuery);
      setVideos(videoList);

      const roomList = await api.getRooms();
      setRooms(roomList.filter((r: any) => r.active));
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch data from the server.');
    } finally {
      setLoadingVideos(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    setCreatingRoom(true);
    setError('');
    try {
      const room = await api.createRoom(newRoomName);
      navigate(`/room/${room.code}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create watch room');
    } finally {
      setCreatingRoom(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinRoomCode.trim()) return;

    setJoiningRoom(true);
    setError('');
    try {
      const room = await api.joinRoom(joinRoomCode.trim().toUpperCase());
      navigate(`/room/${room.code}`);
    } catch (err: any) {
      setError(err.message || 'Failed to join room. Verify access code.');
    } finally {
      setJoiningRoom(false);
    }
  };

  const handleUploadVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle.trim()) {
      setError('Please select a file and enter a title');
      return;
    }

    setUploading(true);
    setError('');
    setSuccessMsg('');

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('title', uploadTitle);
    formData.append('description', uploadDescription);

    try {
      await api.uploadVideo(formData);
      setSuccessMsg('Video uploaded successfully for our movie night! ❤️');
      setUploadTitle('');
      setUploadDescription('');
      setUploadFile(null);
      const fileInput = document.getElementById('video-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      loadData();
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteVideo = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this video from our library?')) return;
    try {
      await api.deleteVideo(id);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete video');
    }
  };

  const handleImportDriveFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveUrl.trim()) return;

    setImportingDrive(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await api.loadDriveFolder(driveUrl.trim());
      setSuccessMsg(`Successfully imported ${res.added} movies! Total folder movies: ${res.total}. ❤️`);
      setDriveUrl('');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to import Google Drive folder. Make sure the folder is public.');
    } finally {
      setImportingDrive(false);
    }
  };

  const toggleFavorite = (id: number) => {
    setFavoriteVideos((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-[#09060F] text-slate-100 pb-16 relative overflow-hidden">
      
      {/* Background Lighting Orbs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-600/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Top Navbar */}
      <LoveNavbar />

      {/* Header Banner with Landscape Couple Photo */}
      <div className="max-w-7xl mx-auto px-6 mt-6">
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-10 border border-pink-500/20 shadow-2xl">
          <img
            src={LOVE_IMAGES.landscape}
            alt="Harashwar & Dharunya Header"
            className="absolute inset-0 w-full h-full object-cover filter blur-[2px] opacity-35 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#09060F] via-[#09060F]/80 to-transparent" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
                <span>Private Cinema Dashboard</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-['Outfit']">
                Good Evening, {username} ❤️
              </h1>
              <p className="text-sm text-pink-200/80 max-w-xl font-light">
                Welcome back to our digital love space! Harashwar ❤️ Dharunya are synchronized and ready for movie night.
              </p>
            </div>

            {/* Couple Avatars Header Pill */}
            <div className="flex items-center gap-3 p-3 rounded-2xl glass-love border border-pink-500/30">
              <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-pink-500">
                <img src={LOVE_IMAGES.man} alt="Harashwar" className="w-full h-full object-cover" />
              </div>
              <Heart className="w-5 h-5 text-pink-500 fill-pink-500 animate-heart-pulse" />
              <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-purple-500">
                <img src={LOVE_IMAGES.girl} alt="Dharunya" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="flex flex-wrap items-center gap-3 p-1.5 rounded-2xl glass-love border border-pink-500/20 w-fit">
          <button
            onClick={() => setActiveTab('rooms')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 font-['Outfit'] ${
              activeTab === 'rooms'
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-500/25 scale-105'
                : 'text-pink-300/70 hover:text-white hover:bg-pink-900/20'
            }`}
          >
            <Tv className="w-4 h-4" />
            Watch Rooms ({rooms.length})
          </button>

          <button
            onClick={() => setActiveTab('videos')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 font-['Outfit'] ${
              activeTab === 'videos'
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-500/25 scale-105'
                : 'text-pink-300/70 hover:text-white hover:bg-pink-900/20'
            }`}
          >
            <Film className="w-4 h-4" />
            Movie Library ({videos.length})
          </button>

          <button
            onClick={() => setActiveTab('memories')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 font-['Outfit'] ${
              activeTab === 'memories'
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-500/25 scale-105'
                : 'text-pink-300/70 hover:text-white hover:bg-pink-900/20'
            }`}
          >
            <Camera className="w-4 h-4" />
            Memory Diary
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 font-['Outfit'] ${
              activeTab === 'notes'
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-500/25 scale-105'
                : 'text-pink-300/70 hover:text-white hover:bg-pink-900/20'
            }`}
          >
            <StickyNote className="w-4 h-4" />
            Love Notes
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 mt-8">
        
        {/* Feedback / Alerts */}
        {(error || successMsg) && (
          <div className="mb-6 space-y-3">
            {error && (
              <div className="p-4 bg-red-500/15 border border-red-500/30 rounded-2xl flex items-center gap-3 text-xs text-red-300">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-xs text-emerald-300">
                <Heart className="w-5 h-5 text-emerald-400 fill-current shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}
          </div>
        )}

        {/* TAB 1: WATCH ROOMS */}
        {activeTab === 'rooms' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Col: Create/Join Room Card */}
            <div className="lg:col-span-1 space-y-6">
              
              <div className="glass-love p-6 rounded-3xl border border-pink-500/20 shadow-xl relative overflow-hidden">
                <img
                  src={LOVE_IMAGES.handHolding}
                  alt="Room Card Background"
                  className="absolute inset-0 w-full h-full object-cover filter blur-[3px] opacity-15 pointer-events-none"
                />
                
                <div className="relative z-10">
                  {isAdmin ? (
                    // ADMIN: Create Watch Room
                    <form onSubmit={handleCreateRoom} className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-pink-600/20 border border-pink-500/30 rounded-xl text-pink-400">
                          <Plus className="w-5 h-5" />
                        </div>
                        <h3 className="text-base font-extrabold text-white font-['Outfit']">
                          Create Romantic Room
                        </h3>
                      </div>
                      <p className="text-xs text-pink-200/70 leading-relaxed font-light">
                        Host a new synchronized watch room. Harashwar will have full master playback controls.
                      </p>

                      <div>
                        <input
                          type="text"
                          value={newRoomName}
                          onChange={(e) => setNewRoomName(e.target.value)}
                          placeholder="E.g., Harashwar & Dharunya Movie Night ❤️"
                          className="w-full px-4 py-3 bg-[#09060F]/80 border border-pink-500/20 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-2xl text-xs text-white placeholder-pink-300/30 outline-none transition-all"
                          required
                          disabled={creatingRoom}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={creatingRoom}
                        className="w-full py-3 px-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-pink-600/30 transition-all font-['Outfit']"
                      >
                        {creatingRoom ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Create Watch Space ❤️'}
                      </button>
                    </form>
                  ) : (
                    // VIEWER: Join Room
                    <form onSubmit={handleJoinRoom} className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-600/20 border border-purple-500/30 rounded-xl text-purple-400">
                          <Key className="w-5 h-5" />
                        </div>
                        <h3 className="text-base font-extrabold text-white font-['Outfit']">
                          Join Private Room
                        </h3>
                      </div>
                      <p className="text-xs text-pink-200/70 leading-relaxed font-light">
                        Enter the 6-character room access code shared by Harashwar to sync playback instantly.
                      </p>

                      <div>
                        <input
                          type="text"
                          value={joinRoomCode}
                          onChange={(e) => setJoinRoomCode(e.target.value)}
                          placeholder="6-CHAR CODE (E.G., HAR143)"
                          maxLength={6}
                          className="w-full px-4 py-3 bg-[#09060F]/80 border border-pink-500/20 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-2xl text-center font-mono font-bold tracking-widest text-sm text-white uppercase outline-none transition-all"
                          required
                          disabled={joiningRoom}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={joiningRoom}
                        className="w-full py-3 px-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-pink-600/30 transition-all font-['Outfit']"
                      >
                        {joiningRoom ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Join Harashwar ❤️'}
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Couple Stats Panel */}
              <div className="glass-love p-6 rounded-3xl border border-pink-500/20 space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-pink-300/80 font-['Outfit'] flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                  Our Couple Stats
                </h4>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 rounded-2xl bg-pink-950/30 border border-pink-500/15">
                    <p className="text-xl font-extrabold text-white font-['Outfit'] text-glow-pink">{daysTogether}</p>
                    <p className="text-[10px] text-pink-300/60 font-semibold uppercase">Days Together</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-500/15">
                    <p className="text-xl font-extrabold text-white font-['Outfit'] text-glow-purple">{videos.length}</p>
                    <p className="text-[10px] text-pink-300/60 font-semibold uppercase">Shared Movies</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Col: Active Watch Rooms Listing */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-love p-6 rounded-3xl border border-pink-500/20 shadow-xl">
                <h3 className="text-lg font-extrabold text-white mb-6 flex items-center gap-2 font-['Outfit']">
                  <Video className="w-5 h-5 text-pink-400" />
                  Active Watch Parties ({rooms.length})
                </h3>

                {rooms.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-pink-500/20 rounded-2xl bg-pink-950/10">
                    <Heart className="w-10 h-10 text-pink-400/50 mx-auto mb-3 animate-pulse" />
                    <p className="text-sm font-bold text-white font-['Outfit']">
                      Our love story is waiting for its first movie ❤️
                    </p>
                    <p className="text-xs text-pink-300/60 mt-1">
                      {isAdmin ? 'Create a room on the left to get started!' : 'Ask Harashwar to launch a room code!'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rooms.map((rm) => (
                      <motion.div
                        key={rm.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => navigate(`/room/${rm.code}`)}
                        className="p-5 bg-gradient-to-br from-[#140C20] to-[#09060F] border border-pink-500/25 hover:border-pink-500/60 rounded-2xl cursor-pointer transition-all shadow-lg group relative overflow-hidden"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="text-base font-bold text-white group-hover:text-pink-300 transition-colors font-['Outfit']">
                              {rm.name}
                            </h4>
                            <p className="text-xs text-pink-300/70 font-mono mt-1">Code: <strong className="text-white">{rm.code}</strong></p>
                          </div>

                          <span className="text-[10px] font-extrabold px-3 py-1 bg-pink-500/20 border border-pink-500/40 text-pink-300 rounded-full flex items-center gap-1">
                            <Play className="w-3 h-3 fill-current" />
                            JOIN
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-pink-300/60 pt-3 border-t border-pink-500/10 font-mono">
                          <span>Host: {rm.hostUsername || 'Harashwar'}</span>
                          <span>Active Party</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: MOVIE LIBRARY & UPLOAD */}
        {activeTab === 'videos' && (
          <div className="space-y-8">
            
            {/* Top Bar: Search & Counts */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 glass-love p-6 rounded-3xl border border-pink-500/20">
              <div>
                <h3 className="text-xl font-extrabold text-white flex items-center gap-2 font-['Outfit']">
                  <Film className="w-6 h-6 text-pink-400" />
                  Our Romantic Movie Vault ({videos.length})
                </h3>
                <p className="text-xs text-pink-200/70 mt-1">
                  Upload local files or import public Google Drive folders.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-pink-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search movies..."
                  className="w-full sm:w-72 pl-10 pr-4 py-2.5 bg-[#09060F]/80 border border-pink-500/20 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-2xl text-xs text-white placeholder-pink-300/30 outline-none transition-all"
                />
              </div>
            </div>

            {/* Video Cards Grid */}
            {loadingVideos ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 glass-love rounded-3xl animate-pulse" />
                ))}
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-pink-500/20 rounded-3xl glass-love">
                <Film className="w-12 h-12 text-pink-400/40 mx-auto mb-3" />
                <h4 className="text-base font-bold text-white font-['Outfit']">
                  Our movie library is currently empty ❤️
                </h4>
                <p className="text-xs text-pink-300/60 mt-1">
                  {isAdmin ? 'Use the upload or Drive import controls below to add your first movie!' : 'Ask Harashwar to upload a movie!'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((vid) => {
                  const isFav = favoriteVideos.includes(vid.id);
                  return (
                    <motion.div
                      key={vid.id}
                      whileHover={{ y: -6 }}
                      className="glass-love rounded-3xl p-5 border border-pink-500/20 hover:border-pink-500/50 shadow-xl transition-all relative flex flex-col justify-between group"
                    >
                      <div>
                        {/* Card Header & Badges */}
                        <div className="flex justify-between items-start gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="p-2 bg-pink-500/15 border border-pink-500/30 rounded-xl text-pink-400">
                              <Film className="w-4 h-4" />
                            </span>
                            <h4 className="text-base font-bold text-white group-hover:text-pink-300 transition-colors line-clamp-1 font-['Outfit']">
                              {vid.title}
                            </h4>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => toggleFavorite(vid.id)}
                              className="p-1.5 rounded-lg text-pink-400 hover:scale-125 transition-transform"
                              title="Favorite Movie"
                            >
                              <Heart className={`w-4 h-4 ${isFav ? 'fill-pink-500 text-pink-500' : 'text-pink-400/50'}`} />
                            </button>

                            {isAdmin && (
                              <button
                                onClick={() => handleDeleteVideo(vid.id)}
                                className="p-1.5 text-pink-300/40 hover:text-red-400 hover:bg-pink-950/40 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                title="Delete Movie"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-pink-200/70 line-clamp-2 leading-relaxed font-light mb-4">
                          {vid.description || 'No description added yet.'}
                        </p>
                      </div>

                      {/* Card Footer */}
                      <div className="pt-3 border-t border-pink-500/10 flex items-center justify-between text-[11px] text-pink-300/60 font-mono">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-pink-400" />
                          <span>{new Date(vid.uploadDate).toLocaleDateString()}</span>
                        </div>

                        <span className="px-2 py-0.5 rounded-md bg-pink-500/15 border border-pink-500/30 text-pink-300 text-[10px] font-semibold">
                          {vid.source === 'drive' ? 'Google Drive' : formatBytes(vid.size)}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* ADMIN ONLY: Upload & Drive Import Section */}
            {isAdmin && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                
                {/* Upload Local Video */}
                <div className="glass-love p-6 rounded-3xl border border-pink-500/20 shadow-xl space-y-4">
                  <div className="flex items-center gap-2">
                    <UploadCloud className="w-5 h-5 text-pink-400" />
                    <h4 className="text-base font-extrabold text-white font-['Outfit']">
                      Upload Video File
                    </h4>
                  </div>

                  <form onSubmit={handleUploadVideo} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-pink-300/70 uppercase tracking-widest block mb-1">
                        Movie Title
                      </label>
                      <input
                        type="text"
                        value={uploadTitle}
                        onChange={(e) => setUploadTitle(e.target.value)}
                        placeholder="E.g., Romantic Movie Night #1"
                        className="w-full px-4 py-2.5 bg-[#09060F]/80 border border-pink-500/20 rounded-2xl text-xs text-white outline-none focus:border-pink-500"
                        required
                        disabled={uploading}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-pink-300/70 uppercase tracking-widest block mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={uploadDescription}
                        onChange={(e) => setUploadDescription(e.target.value)}
                        placeholder="Brief note about the movie"
                        className="w-full px-4 py-2.5 bg-[#09060F]/80 border border-pink-500/20 rounded-2xl text-xs text-white outline-none focus:border-pink-500"
                        disabled={uploading}
                      />
                    </div>

                    {/* File Dropzone */}
                    <div className="border border-dashed border-pink-500/30 rounded-2xl p-6 text-center hover:border-pink-500 transition-all relative bg-pink-950/20">
                      <input
                        type="file"
                        id="video-file-input"
                        accept="video/mp4,video/webm"
                        onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploading}
                        required
                      />
                      <div className="flex flex-col items-center gap-2">
                        <UploadCloud className="w-8 h-8 text-pink-400 animate-bounce" />
                        <p className="text-xs text-pink-200 font-medium">
                          {uploadFile ? uploadFile.name : 'Drag & drop or click to choose video file'}
                        </p>
                        <p className="text-[10px] text-pink-300/50">Supports MP4, WEBM (Max 500MB)</p>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={uploading || !uploadFile}
                      className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-pink-600/30 transition-all font-['Outfit'] disabled:opacity-50"
                    >
                      {uploading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Uploading Video (Do not close)...
                        </>
                      ) : (
                        'Upload Movie to Library ❤️'
                      )}
                    </button>
                  </form>
                </div>

                {/* Import Google Drive Folder */}
                <div className="glass-love p-6 rounded-3xl border border-pink-500/20 shadow-xl space-y-4">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-purple-400" />
                    <h4 className="text-base font-extrabold text-white font-['Outfit']">
                      Import Google Drive Folder
                    </h4>
                  </div>

                  <p className="text-xs text-pink-200/70 leading-relaxed font-light">
                    Paste a public Google Drive folder link. Any video files inside will be synced automatically.
                  </p>

                  <form onSubmit={handleImportDriveFolder} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-pink-300/70 uppercase tracking-widest block mb-1">
                        Drive Folder Link
                      </label>
                      <input
                        type="url"
                        value={driveUrl}
                        onChange={(e) => setDriveUrl(e.target.value)}
                        placeholder="https://drive.google.com/drive/folders/..."
                        className="w-full px-4 py-2.5 bg-[#09060F]/80 border border-pink-500/20 rounded-2xl text-xs text-white outline-none focus:border-pink-500"
                        required
                        disabled={importingDrive}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={importingDrive || !driveUrl.trim()}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all font-['Outfit'] disabled:opacity-50"
                    >
                      {importingDrive ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Importing Drive Folder...
                        </>
                      ) : (
                        'Import Drive Folder ❤️'
                      )}
                    </button>
                  </form>
                </div>

              </div>
            )}
          </div>
        )}

        {/* TAB 3: MEMORY DIARY */}
        {activeTab === 'memories' && <MemoriesGallery />}

        {/* TAB 4: LOVE NOTES */}
        {activeTab === 'notes' && <LoveNotes />}

      </main>
    </div>
  );
};
