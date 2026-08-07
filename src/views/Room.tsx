import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import {
  Users, Send, Image, Smile, MapPin, BarChart2, MessageSquare,
  LogOut, Copy, Check, Download, FolderOpen, Film, ShieldCheck, Heart
} from 'lucide-react';

import { api, getRole, getUsername } from '../services/api';
import { RoomSocketClient } from '../services/websocket';
import { VideoPlayer } from '../components/VideoPlayer';
import { LOVE_IMAGES, AVATARS } from '../assets/loveImages';

// Fix Leaflet Default Icon issue in React bundles
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom pulse icon for location markers
const createHeartMarkerIcon = (avatarUrl: string, name: string) => {
  return L.divIcon({
    html: `<div class="relative flex flex-col items-center group">
             <div class="relative w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-pink-500 to-purple-500 shadow-xl ring-2 ring-pink-400">
               <img src="${avatarUrl}" class="w-full h-full object-cover rounded-full" />
             </div>
             <div class="absolute -top-2 -right-1 text-sm animate-bounce">❤️</div>
             <span class="mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-950/90 border border-pink-500/40 text-pink-200 whitespace-nowrap">${name}</span>
           </div>`,
    className: 'custom-heart-div-icon',
    iconSize: [40, 48],
    iconAnchor: [20, 48]
  });
};

type VerificationStatus = 'unselected' | 'verifying' | 'correct' | 'wrong';

export const Room: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const roomCode = code || '';

  const username = getUsername() || 'Harashwar';
  const role = getRole();
  const isAdmin = role === 'ROLE_ADMIN';

  // Refs
  const socketClientRef = useRef<RoomSocketClient | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const localVideoObjectUrlRef = useRef<string | null>(null);

  // Room states
  const [room, setRoom] = useState<any>(null);
  const [participants, setParticipants] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});

  // Real-time synchronization state
  const [syncState, setSyncState] = useState<{
    action: 'PLAY' | 'PAUSE' | 'SEEK' | 'BUFFERING' | 'ERROR' | 'CHANGE_VIDEO' | 'SYNC_STATE';
    playing: boolean;
    currentTime: number;
    updatedAt: number;
  } | undefined>(undefined);

  // Analytics state
  const [analytics, setAnalytics] = useState<any>({
    activeViewers: 1,
    peakUsers: 1,
    averageLatency: 15.0,
    playbackStatus: 'IDLE',
  });

  // UI state
  const [activeTab, setActiveTab] = useState<'chat' | 'map' | 'analytics'>('chat');
  const [copied, setCopied] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoLibrary, setVideoLibrary] = useState<any[]>([]);
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);

  // Local video state
  const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('unselected');

  // Viewer readiness state
  const [viewerReadyStatus, setViewerReadyStatus] = useState<{
    readyViewers: number;
    totalViewers: number;
    allReady: boolean;
    viewers: { username: string; bufferedSeconds: number; isReady: boolean }[];
  } | null>(null);

  // Reset local video state when video changes
  useEffect(() => {
    setVerificationStatus('unselected');
    setViewerReadyStatus(null);

    if (localVideoObjectUrlRef.current) {
      URL.revokeObjectURL(localVideoObjectUrlRef.current);
      localVideoObjectUrlRef.current = null;
    }
    setLocalVideoUrl(null);
  }, [room?.currentVideo?.id]);

  // Fetch initial room info and chat logs
  const loadRoomInfo = async () => {
    try {
      const roomDetails = await api.getRoomDetails(roomCode);
      setRoom(roomDetails);

      const chatHistory = await api.getChatHistory(roomCode);
      setChatMessages(chatHistory);

      const currentParticipants = await api.getParticipants(roomCode);
      setParticipants(currentParticipants);

      const stats = await api.getAnalytics(roomCode);
      setAnalytics(stats);

      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const stateResponse = await fetch(`${apiBase}/api/rooms/join/${roomCode}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (stateResponse.ok) {
        const playState = await fetch(`${apiBase}/api/rooms/${roomCode}/analytics`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(r => r.json());
        if (playState) {
          setSyncState({
            action: playState.playbackStatus === 'PLAYING' ? 'PLAY' : 'PAUSE',
            playing: playState.playbackStatus === 'PLAYING',
            currentTime: playState.currentTime || 0,
            updatedAt: Date.now()
          });
        }
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!roomCode) return;
    loadRoomInfo();

    const socket = new RoomSocketClient(roomCode);
    socketClientRef.current = socket;

    socket.connect({
      onConnect: () => {
        console.log('STOMP connected to room:', roomCode);
      },
      onSync: (syncMsg) => {
        if (syncMsg.action === 'CHANGE_VIDEO') {
          loadRoomInfo();
          return;
        }

        setSyncState({
          action: syncMsg.action,
          playing: syncMsg.action === 'PLAY',
          currentTime: syncMsg.currentTime,
          updatedAt: Date.now()
        });
      },
      onChat: (msg) => {
        setChatMessages((prev) => [...prev, msg]);
      },
      onParticipants: (members) => {
        setParticipants(members);
      },
      onTyping: (user, status) => {
        if (user !== username) {
          setTypingUsers((prev) => ({
            ...prev,
            [user]: status === 'typing'
          }));
        }
      },
      onKicked: () => {
        alert('You have been removed from this room by the host.');
        navigate('/dashboard');
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [roomCode]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handlePlaybackChange = (action: 'PLAY' | 'PAUSE' | 'SEEK' | 'BUFFERING' | 'ERROR', time: number) => {
    if (isAdmin) {
      socketClientRef.current?.sendPlaybackSync(action, time);
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    socketClientRef.current?.sendChatMessage(chatInput.trim(), 'TEXT');
    setChatInput('');
    socketClientRef.current?.sendTypingStatus('stopped');
  };

  const handleChatInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChatInput(e.target.value);
    socketClientRef.current?.sendTypingStatus('typing');

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketClientRef.current?.sendTypingStatus('stopped');
    }, 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        socketClientRef.current?.sendChatMessage(reader.result as string, 'IMAGE');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEmojiClick = (emoji: string) => {
    setChatInput((prev) => prev + emoji);
    setIsEmojiOpen(false);
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExitRoom = async () => {
    if (isAdmin) {
      if (window.confirm('Are you sure you want to end this room for both of you?')) {
        try {
          await api.endSession(roomCode);
        } catch (e) {
          console.error(e);
        }
        navigate('/dashboard');
      }
    } else {
      navigate('/dashboard');
    }
  };

  const handleOpenVideoModal = async () => {
    try {
      const vids = await api.getVideos();
      setVideoLibrary(vids);
      setShowVideoModal(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectVideo = async (videoId: number) => {
    try {
      await api.changeVideo(roomCode, videoId);
      socketClientRef.current?.sendPlaybackSync('CHANGE_VIDEO', 0, videoId);
      setShowVideoModal(false);
      loadRoomInfo();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadVideo = () => {
    if (!room?.currentVideo?.id) return;
    const downloadUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/videos/stream/${room.currentVideo.id}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = room.currentVideo.title || 'movie.mp4';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLocalFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const vid = room?.currentVideo;
    if (!vid) return;

    setVerificationStatus('verifying');

    if (localVideoObjectUrlRef.current) {
      URL.revokeObjectURL(localVideoObjectUrlRef.current);
    }

    const objUrl = URL.createObjectURL(file);
    localVideoObjectUrlRef.current = objUrl;

    setLocalVideoUrl(objUrl);
    setVerificationStatus('correct');
    socketClientRef.current?.sendViewerReady(10.0);
  };

  const handleKickUser = (target: string) => {
    if (window.confirm(`Kick ${target} from this watch room?`)) {
      socketClientRef.current?.sendKickUser(target);
    }
  };

  const emojis = ['❤️', '😘', '🥰', '💕', '✨', '🌹', '🥂', '🍿'];

  const vid = room?.currentVideo;
  const isDriveOrRemote = vid && vid.source !== 'local';
  const shouldRenderVideoPlayer = isDriveOrRemote || verificationStatus === 'correct';

  const renderVideoArea = () => {
    if (!vid) {
      return (
        <div className="w-full aspect-video rounded-3xl glass-love border border-pink-500/20 flex flex-col items-center justify-center text-center p-8 relative overflow-hidden shadow-2xl">
          <img src={LOVE_IMAGES.handHolding} alt="Empty State" className="absolute inset-0 w-full h-full object-cover filter blur-sm opacity-20" />
          <div className="relative z-10 flex flex-col items-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/40 animate-heart-pulse">
              <Heart className="w-8 h-8 text-white fill-white" />
            </div>
            <h3 className="text-xl font-extrabold text-white font-['Outfit']">
              Our love story is waiting for its first movie ❤️
            </h3>
            <p className="text-xs text-pink-200/70 max-w-sm leading-relaxed">
              {isAdmin ? 'Click "Select Movie" above to choose a film for Harashwar & Dharunya!' : 'Waiting for Harashwar to choose our romantic movie!'}
            </p>
            {isAdmin && (
              <button
                onClick={handleOpenVideoModal}
                className="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs rounded-full shadow-lg shadow-pink-600/30 transition-all hover:scale-105"
              >
                Select Movie Now ❤️
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {shouldRenderVideoPlayer && (
            <motion.div
              key="player"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.35 }}
              className="relative rounded-3xl overflow-hidden border border-pink-500/30 shadow-glow-pink"
            >
              {/* Blurred Background Kissing Image Layer */}
              <div className="absolute inset-0 z-0">
                <img src={LOVE_IMAGES.kissing} alt="Background Overlay" className="w-full h-full object-cover filter blur-md opacity-20 scale-105" />
              </div>

              <div className="relative z-10">
                <VideoPlayer
                  videoUrl={localVideoUrl || `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/videos/stream/${vid.id}`}
                  isAdmin={isAdmin}
                  videoSource={vid?.source === 'local' ? 'local' : vid?.source === 'drive' ? 'drive' : 'remote'}
                  isPlayDisabled={isAdmin ? (viewerReadyStatus ? !viewerReadyStatus.allReady : true) : true}
                  onPlaybackChange={handlePlaybackChange}
                  syncState={syncState}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Video Metadata Card */}
        <div className="glass-love p-6 rounded-3xl border border-pink-500/20 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-300">
                  {vid.source === 'drive' ? 'Google Drive Stream' : vid.source === 'local' ? 'Local Movie' : 'HD Movie Stream'}
                </span>
                {vid.checksum && (
                  <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified SHA-256
                  </span>
                )}
              </div>
              <h3 className="text-xl font-extrabold text-white font-['Outfit']">{vid.title}</h3>
              {vid.description && <p className="text-xs text-pink-200/70 mt-1 font-light">{vid.description}</p>}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              {vid.source !== 'local' && (
                <button
                  onClick={handleDownloadVideo}
                  className="px-5 py-2.5 bg-pink-950/40 border border-pink-500/30 hover:bg-pink-900/50 text-pink-300 text-xs font-bold rounded-2xl transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download
                </button>
              )}

              <button
                onClick={() => videoFileInputRef.current?.click()}
                className="px-5 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-bold rounded-2xl shadow-lg shadow-pink-600/30 transition-all flex items-center gap-2"
              >
                <FolderOpen className="w-4 h-4" /> Select Local File
              </button>
              <input type="file" ref={videoFileInputRef} onChange={handleLocalFileSelect} className="hidden" />
            </div>
          </div>
        </div>

        {/* Readiness Bar */}
        {viewerReadyStatus && (
          <div className="glass-love p-4 rounded-2xl border border-pink-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-pink-300">
              <Heart className="w-4 h-4 text-pink-500 fill-pink-500 animate-pulse" />
              <span>Readiness: {viewerReadyStatus.allReady ? 'Both Ready for Movie Night! ❤️' : 'Waiting for viewer sync...'}</span>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 bg-pink-500/20 rounded-full text-white">
              {viewerReadyStatus.readyViewers} / {viewerReadyStatus.totalViewers} Ready
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-[#09060F] text-slate-100 flex flex-col relative">
      
      {/* Top Navigation Bar */}
      <header className="px-6 py-3.5 bg-[#09060F]/80 border-b border-pink-500/15 backdrop-blur-xl flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <div
            onClick={() => navigate('/dashboard')}
            className="p-2 bg-gradient-to-tr from-pink-600 to-purple-600 rounded-2xl flex items-center justify-center cursor-pointer shadow-md shadow-pink-500/30"
          >
            <Heart className="w-5 h-5 text-white fill-white animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white leading-none font-['Outfit']">
              {room ? room.name : 'Harashwar ❤️ Dharunya Space'}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-semibold bg-pink-950/40 px-2.5 py-0.5 border border-pink-500/30 rounded-full font-mono text-pink-300">
                ROOM: {roomCode}
              </span>
              <button onClick={copyRoomCode} className="text-pink-400 hover:text-white transition-colors" title="Copy Code">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={handleOpenVideoModal}
              className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-pink-600/30 transition-all font-['Outfit']"
            >
              <Film className="w-4 h-4" />
              Select Movie ❤️
            </button>
          )}

          <button
            onClick={handleExitRoom}
            className="px-4 py-2 bg-pink-950/30 border border-pink-500/20 hover:bg-pink-900/40 text-pink-300 hover:text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-2 font-['Outfit']"
          >
            <LogOut className="w-4 h-4" />
            {isAdmin ? 'End Space' : 'Leave Space'}
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden z-10">
        
        {/* Left Col: Video Player & Controls */}
        <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
          {renderVideoArea()}
        </div>

        {/* Right Col: Messenger Chat & Map */}
        <div className="w-full lg:w-96 bg-[#09060F]/90 border-t lg:border-t-0 lg:border-l border-pink-500/15 flex flex-col h-[520px] lg:h-full backdrop-blur-xl">
          
          {/* Tab Selector */}
          <div className="flex border-b border-pink-500/15 p-2 gap-1 bg-[#09060F]">
            {(['chat', 'map', 'analytics'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all font-['Outfit'] ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-500/20'
                    : 'text-pink-300/60 hover:text-white'
                }`}
              >
                {tab === 'chat' && <><MessageSquare className="w-4 h-4" /> Love Chat</>}
                {tab === 'map' && <><MapPin className="w-4 h-4" /> Our Map</>}
                {tab === 'analytics' && <><BarChart2 className="w-4 h-4" /> Stats</>}
              </button>
            ))}
          </div>

          <div className="flex-1 flex flex-col overflow-hidden relative">
            <AnimatePresence mode="wait">
              
              {/* TAB 1: Messenger Style Love Chat */}
              {activeTab === 'chat' && (
                <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col overflow-hidden">
                  
                  {/* Messages Feed */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatMessages.map((msg, idx) => {
                      const isSystem = msg.type === 'JOIN' || msg.type === 'LEAVE';
                      const isSelf = msg.sender === username;
                      const avatar = msg.sender?.toLowerCase().includes('dharunya') ? AVATARS.Dharunya : AVATARS.Harashwar;

                      if (isSystem) {
                        return (
                          <div key={msg.id || idx} className="text-center">
                            <span className="text-[10px] font-bold bg-pink-950/40 border border-pink-500/20 px-3 py-1 rounded-full text-pink-300/80 font-mono">
                              {msg.content}
                            </span>
                          </div>
                        );
                      }
                      return (
                        <div key={msg.id || idx} className={`flex items-end gap-2 ${isSelf ? 'flex-row-reverse' : 'flex-row'}`}>
                          <img src={avatar} alt={msg.sender} className="w-7 h-7 rounded-full object-cover ring-1 ring-pink-400 shrink-0" />
                          <div className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
                            <span className="text-[10px] text-pink-300/60 font-semibold mb-1 px-1">{msg.sender}</span>
                            <div className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                              isSelf
                                ? 'bg-gradient-to-r from-pink-600 to-pink-500 text-white rounded-tr-none shadow-md shadow-pink-600/20'
                                : 'bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-tl-none shadow-md shadow-purple-600/20'
                            }`}>
                              {msg.type === 'IMAGE' ? (
                                <img src={msg.content} alt="shared love media" className="rounded-xl max-h-48 object-cover border border-white/20" />
                              ) : (
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                              )}
                            </div>
                            <span className="text-[9px] text-pink-300/40 mt-1 px-1 font-mono">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Typing Indicator */}
                  {Object.entries(typingUsers).some(([, typing]) => typing) && (
                    <div className="px-4 py-1.5 text-[11px] text-pink-300 italic bg-[#09060F] flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500 animate-pulse" />
                      <span>{Object.entries(typingUsers).filter(([, t]) => t).map(([u]) => u).join(', ')} is typing a sweet message...</span>
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleSendChat} className="p-3 bg-[#09060F] border-t border-pink-500/15 flex flex-col gap-2 relative">
                    
                    {/* Emoji Quick Picker */}
                    {isEmojiOpen && (
                      <div className="absolute bottom-16 left-3 bg-[#140C20] border border-pink-500/30 p-2 rounded-2xl shadow-xl z-50 flex gap-2">
                        {emojis.map((emoji) => (
                          <button key={emoji} type="button" onClick={() => handleEmojiClick(emoji)} className="hover:scale-125 transition-transform text-lg">{emoji}</button>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-pink-300/70 hover:text-white rounded-xl" title="Share Photo">
                        <Image className="w-4 h-4" />
                      </button>
                      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

                      <button type="button" onClick={() => setIsEmojiOpen(!isEmojiOpen)} className="p-2 text-pink-300/70 hover:text-white rounded-xl" title="Love Reaction">
                        <Smile className="w-4 h-4" />
                      </button>

                      <input
                        type="text"
                        value={chatInput}
                        onChange={handleChatInputChange}
                        placeholder="Send a sweet message... ❤️"
                        className="flex-1 px-4 py-2.5 bg-[#140C20] border border-pink-500/20 focus:border-pink-500 rounded-xl text-xs text-white placeholder-pink-300/40 outline-none transition-all"
                      />

                      <button type="submit" disabled={!chatInput.trim()} className="p-2.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-xl disabled:opacity-40 transition-all shadow-md shadow-pink-600/30">
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* TAB 2: Interactive Couple Map */}
              {activeTab === 'map' && (
                <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col overflow-hidden dark-romantic-map">
                  
                  {/* Distance Banner */}
                  <div className="p-3 bg-pink-950/40 border-b border-pink-500/20 text-center">
                    <p className="text-xs font-bold text-pink-300 flex items-center justify-center gap-1 font-['Outfit']">
                      <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500 animate-pulse" />
                      <span>143 km — But our hearts are always together ❤️</span>
                    </p>
                  </div>

                  <MapContainer center={[12.0, 78.5]} zoom={6} scrollWheelZoom={true} className="w-full h-full">
                    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    
                    {/* Pink Polyline Route */}
                    <Polyline
                      positions={[
                        [13.0827, 80.2707],
                        [11.0168, 76.9558]
                      ]}
                      pathOptions={{ color: '#FF4F9A', weight: 4, dashArray: '8, 8' }}
                    />

                    {/* Harashwar Marker */}
                    <Marker position={[13.0827, 80.2707]} icon={createHeartMarkerIcon(AVATARS.Harashwar, 'Harashwar ❤️')}>
                      <Popup>
                        <div className="p-1 text-xs font-bold text-[#09060F]">
                          Harashwar's Location ❤️
                        </div>
                      </Popup>
                    </Marker>

                    {/* Dharunya Marker */}
                    <Marker position={[11.0168, 76.9558]} icon={createHeartMarkerIcon(AVATARS.Dharunya, 'Dharunya ❤️')}>
                      <Popup>
                        <div className="p-1 text-xs font-bold text-[#09060F]">
                          Dharunya's Location ❤️
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </motion.div>
              )}

              {/* TAB 3: Session Analytics */}
              {activeTab === 'analytics' && (
                <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto p-5 space-y-6">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2 font-['Outfit']">
                    <BarChart2 className="w-5 h-5 text-pink-400" />
                    Session Stream Stats
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Active Viewers', value: analytics.activeViewers, color: 'text-white' },
                      { label: 'Peak Viewers', value: analytics.peakUsers, color: 'text-white' },
                      { label: 'Avg Latency', value: `${analytics.averageLatency.toFixed(1)} ms`, color: 'text-pink-400' },
                      { label: 'Sync Status', value: analytics.playbackStatus, color: 'text-purple-400' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="p-4 glass-love rounded-2xl border border-pink-500/15">
                        <span className="text-[10px] font-bold text-pink-300/60 uppercase block tracking-wider">{label}</span>
                        <span className={`text-xl font-extrabold mt-1 block ${color} font-['Outfit']`}>{value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="glass-love p-4 rounded-2xl border border-pink-500/15 space-y-3">
                    <h4 className="text-xs font-bold text-white flex items-center gap-2 font-['Outfit']">
                      <Users className="w-4 h-4 text-pink-400" />
                      Connected Lovers ({participants.length})
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {participants.map((member) => (
                        <div key={member} className="flex justify-between items-center p-2 rounded-xl bg-pink-950/20 border border-pink-500/10">
                          <span className="text-xs text-white font-bold">{member} ❤️</span>
                          {isAdmin && member !== username && (
                            <button onClick={() => handleKickUser(member)} className="text-[10px] px-2 py-0.5 bg-red-500/20 text-red-300 rounded-lg">
                              Kick
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* Select Video Modal */}
      <AnimatePresence>
        {showVideoModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-love-heavy border border-pink-500/30 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-pink-500/15 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-white font-['Outfit']">Select Romantic Movie ❤️</h3>
                  <p className="text-xs text-pink-200/70 mt-1">Choose a video for Harashwar & Dharunya's watch party</p>
                </div>
                <button onClick={() => setShowVideoModal(false)} className="text-xs text-pink-300/60 hover:text-white">Close</button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {videoLibrary.map((vid) => (
                  <div
                    key={vid.id}
                    onClick={() => handleSelectVideo(vid.id)}
                    className="p-4 glass-love border border-pink-500/20 hover:border-pink-500 rounded-2xl flex justify-between items-center cursor-pointer transition-all hover:scale-[1.01]"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-white font-['Outfit']">{vid.title}</h4>
                      <p className="text-xs text-pink-200/60 mt-1">{vid.description || 'No description'}</p>
                    </div>
                    <button className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold text-xs rounded-xl shadow-md shadow-pink-600/20">
                      Play Now ❤️
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
