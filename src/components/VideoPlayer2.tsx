import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RefreshCw, AlertTriangle, Cloud, Headphones } from 'lucide-react';

export type VideoSource = 'local' | 'drive' | 'remote';

export interface AudioTrackInfo {
  id: string;
  label: string;
  language: string;
  enabled: boolean;
  index: number;
}

interface VideoPlayerProps {
  videoUrl: string;
  isAdmin?: boolean;
  videoSource?: VideoSource;
  isPreloading?: boolean;
  isPlayDisabled?: boolean;
  onPlaybackChange?: (action: 'PLAY' | 'PAUSE' | 'SEEK' | 'BUFFERING' | 'ERROR', time: number) => void;
  onDurationLoaded?: (duration: number) => void;
  onCanPlayReady?: () => void;
  onBufferedReady?: (bufferedSeconds: number) => void;
  syncState?: {
    action: 'PLAY' | 'PAUSE' | 'SEEK' | 'BUFFERING' | 'ERROR' | 'CHANGE_VIDEO' | 'SYNC_STATE';
    playing: boolean;
    currentTime: number;
    updatedAt: number;
  };
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  videoSource = 'remote',
  isPreloading = false,
  isPlayDisabled = false,
  onPlaybackChange,
  onDurationLoaded,
  onCanPlayReady,
  onBufferedReady,
  syncState,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [latencyText, setLatencyText] = useState('Synced');
  const [localError, setLocalError] = useState<string | null>(null);

  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHoveringControls, setIsHoveringControls] = useState(false);
  const [isDraggingScrubber, setIsDraggingScrubber] = useState(false);

  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [audioTracks, setAudioTracks] = useState<AudioTrackInfo[]>([]);
  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const [hasAudioTrackSupport, setHasAudioTrackSupport] = useState(false);
  const audioMenuRef = useRef<HTMLDivElement>(null);

  const updateAudioTracks = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const tracksList = (video as any).audioTracks;
    if (tracksList) {
      const tracks: AudioTrackInfo[] = [];
      for (let i = 0; i < tracksList.length; i++) {
        const t = tracksList[i];
        tracks.push({
          id: t.id || `track-${i}`,
          label: t.label || `Track ${i + 1}`,
          language: t.language || 'unknown',
          enabled: t.enabled,
          index: i
        });
      }
      setAudioTracks(tracks);
    } else {
      setAudioTracks([]);
    }
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      setHasAudioTrackSupport(typeof (videoRef.current as any).audioTracks !== 'undefined');
    } else {
      const tempVideo = document.createElement('video');
      setHasAudioTrackSupport(typeof (tempVideo as any).audioTracks !== 'undefined');
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tracksList = (video as any).audioTracks;
    if (tracksList) {
      const handleTrackChange = () => {
        updateAudioTracks();
      };

      tracksList.addEventListener('addtrack', handleTrackChange);
      tracksList.addEventListener('removetrack', handleTrackChange);
      tracksList.addEventListener('change', handleTrackChange);

      updateAudioTracks();

      return () => {
        tracksList.removeEventListener('addtrack', handleTrackChange);
        tracksList.removeEventListener('removetrack', handleTrackChange);
        tracksList.removeEventListener('change', handleTrackChange);
      };
    }
  }, [videoUrl, updateAudioTracks]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (audioMenuRef.current && !audioMenuRef.current.contains(event.target as Node)) {
        setShowAudioMenu(false);
      }
    };

    if (showAudioMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAudioMenu]);

  const selectAudioTrack = (index: number) => {
    const video = videoRef.current;
    if (!video) return;

    const tracksList = (video as any).audioTracks;
    if (tracksList && tracksList[index]) {
      for (let i = 0; i < tracksList.length; i++) {
        tracksList[i].enabled = (i === index);
      }
      updateAudioTracks();
    }
    setShowAudioMenu(false);
  };

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }

    setShowControls(true);

    if (!isPlaying || isHoveringControls || isDraggingScrubber) {
      return;
    }

    inactivityTimerRef.current = setTimeout(() => {
      setShowControls(false);
    }, 2500);
  }, [isPlaying, isHoveringControls, isDraggingScrubber]);

  const handleInteraction = useCallback(() => {
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  useEffect(() => {
    if (!isDraggingScrubber) return;
    const handleMouseUp = () => {
      setIsDraggingScrubber(false);
    };
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDraggingScrubber]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!(
        document.fullscreenElement &&
        (document.fullscreenElement === containerRef.current ||
          containerRef.current?.contains(document.fullscreenElement))
      );
      setIsFullscreen(isFull);
      handleInteraction();
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [handleInteraction]);

  useEffect(() => {
    resetInactivityTimer();
  }, [isPlaying, isHoveringControls, isDraggingScrubber, resetInactivityTimer]);

  useEffect(() => {
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, []);

  const [showDriveLoader, setShowDriveLoader] = useState(isPreloading);
  const [driveProgress, setDriveProgress] = useState(0);
  const driveProgressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [hostBuffering, setHostBuffering] = useState(false);
  const [hostError, setHostError] = useState(false);

  const viewerReadySentRef = useRef(false);
  const MIN_BUFFER_SECONDS = 5;

  const isLocal = videoSource === 'local';

  useEffect(() => {
    setDuration(0);
    setCurrentTime(0);
    setIsBuffering(false);
    viewerReadySentRef.current = false;
    setAudioTracks([]);
    setShowAudioMenu(false);
    setLocalError(null);
  }, [videoUrl]);

  useEffect(() => {
    if (isLocal) return;

    if (isPreloading) {
      setShowDriveLoader(true);
      setDriveProgress(0);
      let progress = 0;
      driveProgressRef.current = setInterval(() => {
        progress += Math.max(0.5, (90 - progress) * 0.04);
        if (progress >= 90) {
          progress = 90;
          if (driveProgressRef.current) clearInterval(driveProgressRef.current);
        }
        setDriveProgress(Math.round(progress));
      }, 150);
    } else {
      if (driveProgressRef.current) clearInterval(driveProgressRef.current);
      setDriveProgress(100);
      setTimeout(() => setShowDriveLoader(false), 600);
    }
    return () => {
      if (driveProgressRef.current) clearInterval(driveProgressRef.current);
    };
  }, [isPreloading, isLocal]);

  const isSyncingRef = useRef(false);

  useEffect(() => {
    if (!videoRef.current || !syncState) return;

    const video = videoRef.current;
    const action = syncState.action;

    if (action === 'BUFFERING') {
      if (!isLocal) {
        setHostBuffering(true);
        setHostError(false);
        if (!video.paused) video.pause();
        setIsPlaying(false);
      }
      return;
    } else if (action === 'ERROR') {
      setHostError(true);
      setHostBuffering(false);
      if (!video.paused) video.pause();
      setIsPlaying(false);
      return;
    } else {
      setHostBuffering(false);
      setHostError(false);
    }

    let targetTime = syncState.currentTime;
    if (syncState.playing) {
      const timeElapsed = (Date.now() - syncState.updatedAt) / 1000;
      targetTime += timeElapsed;
      const latency = Math.round(timeElapsed * 1000);
      setLatencyText(`${latency > 0 ? latency : 5}ms`);
    } else {
      setLatencyText('Synced');
    }

    isSyncingRef.current = true;

    if (syncState.playing) {
      if (video.paused) {
        video.play()
          .catch(() => {
            setIsMuted(true);
            video.muted = true;
            video.play().catch(() => {});
          });
      }
    } else {
      if (!video.paused) video.pause();
    }

    const drift = Math.abs(video.currentTime - targetTime);
    if (drift > 1.0) {
      video.currentTime = Math.min(targetTime, video.duration || targetTime);
    }

    setIsPlaying(syncState.playing);
    setTimeout(() => { isSyncingRef.current = false; }, 100);
  }, [syncState, isLocal]);

  const handleWaiting = () => {
    if (isLocal) return;
    setIsBuffering(true);
  };

  const handlePlaying = () => {
    setIsPlaying(true);
    if (!isLocal) setIsBuffering(false);
  };

  const handleNativeError = () => {
    const errorObj = videoRef.current?.error;
    let message = "A media loading error occurred.";
    if (errorObj) {
      if (errorObj.code === 3) {
        message = "Playback failed: The video is corrupted or uses codecs not supported by your browser.";
      } else if (errorObj.code === 4) {
        message = "Playback failed: Format not supported natively. Please use MP4 (H.264 + AAC).";
      }
    }
    setLocalError(message);
  };

  const handlePlay = () => {
    setIsPlaying(true);
    if (!isSyncingRef.current) {
      onPlaybackChange?.('PLAY', videoRef.current?.currentTime || 0);
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (!isSyncingRef.current) {
      onPlaybackChange?.('PAUSE', videoRef.current?.currentTime || 0);
    }
  };

  const handleSeeked = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    if (isLocal) setIsBuffering(false);
    if (!isSyncingRef.current) {
      onPlaybackChange?.('SEEK', videoRef.current.currentTime);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleDurationChange = () => {
    if (!videoRef.current) return;
    const dur = videoRef.current.duration;
    setDuration(dur);
    onDurationLoaded?.(dur);
  };

  const handleSeeking = () => {
    if (!isLocal) setIsBuffering(true);
  };

  const handleCanPlay = useCallback(() => {
    setIsBuffering(false);
    updateAudioTracks();

    if (isLocal) {
      if (!viewerReadySentRef.current) {
        viewerReadySentRef.current = true;
        onBufferedReady?.(videoRef.current?.duration || 999);
      }
      onCanPlayReady?.();
      return;
    }

    if (showDriveLoader) {
      if (driveProgressRef.current) clearInterval(driveProgressRef.current);
      setDriveProgress(100);
      setTimeout(() => setShowDriveLoader(false), 500);
    }
    onCanPlayReady?.();

    const video = videoRef.current;
    if (video && !viewerReadySentRef.current && video.buffered.length > 0) {
      const buf = video.buffered.end(video.buffered.length - 1) - video.buffered.start(0);
      if (buf >= MIN_BUFFER_SECONDS) {
        viewerReadySentRef.current = true;
        onBufferedReady?.(buf);
      }
    }
  }, [showDriveLoader, onCanPlayReady, onBufferedReady, isLocal]);

  const handleProgress = useCallback(() => {
    if (isLocal) return;
    const video = videoRef.current;
    if (!video || viewerReadySentRef.current || video.buffered.length === 0) return;
    const buf = video.buffered.end(video.buffered.length - 1) - video.buffered.start(0);
    if (buf >= MIN_BUFFER_SECONDS) {
      viewerReadySentRef.current = true;
      onBufferedReady?.(buf);
    }
  }, [onBufferedReady, isLocal]);

  const togglePlay = () => {
    if (isPlayDisabled || !videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    videoRef.current.muted = nextMuted;
    if (!nextMuted && volume === 0) {
      setVolume(0.5);
      videoRef.current.volume = 0.5;
    }
  };

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const seekTarget = parseFloat(e.target.value);
    isSyncingRef.current = true;
    videoRef.current.currentTime = seekTarget;
    setCurrentTime(seekTarget);
    onPlaybackChange?.('SEEK', seekTarget);
    setTimeout(() => { isSyncingRef.current = false; }, isLocal ? 50 : 150);
  };

  const toggleFullScreen = () => {
    if (!videoRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      const container = videoRef.current.parentElement;
      if (container) container.requestFullscreen().catch(() => videoRef.current?.requestFullscreen());
      else videoRef.current.requestFullscreen();
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const showBufferingIndicator = !isLocal && (isBuffering || hostBuffering);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleInteraction}
      onTouchStart={handleInteraction}
      className={`relative w-full aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl transition-all duration-300 ${
        isFullscreen && !showControls ? 'cursor-none' : ''
      }`}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        onPlay={handlePlay}
        onPause={handlePause}
        onSeeked={handleSeeked}
        onTimeUpdate={handleTimeUpdate}
        onDurationChange={handleDurationChange}
        onSeeking={handleSeeking}
        onCanPlay={handleCanPlay}
        onProgress={handleProgress}
        onWaiting={handleWaiting}
        onPlaying={handlePlaying}
        onError={handleNativeError}
        preload="auto"
        playsInline
      />

      {showAudioMenu && showControls && (
        <div
          ref={audioMenuRef}
          className="absolute bottom-20 right-4 bg-slate-950/95 backdrop-blur-md border border-slate-800 p-3.5 rounded-2xl shadow-2xl z-40 w-64 flex flex-col gap-2 transition-all animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-2 mb-1">
            <span className="text-xs font-bold text-slate-200">Audio Language</span>
            <span className="text-[10px] text-slate-500 font-mono">
              {!hasAudioTrackSupport ? 'Experimental' : `${audioTracks.length} tracks`}
            </span>
          </div>

          {!hasAudioTrackSupport ? (
            <div className="text-left text-xs p-2 text-slate-400 bg-slate-900/40 rounded-xl leading-relaxed border border-slate-800/40">
              <p className="font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Browser Setup Required
              </p>
              <p className="text-[10px] text-slate-400 mb-2 leading-normal">
                Native audio track selection is hidden behind a flag in Chrome and Firefox.
              </p>
            </div>
          ) : audioTracks.length === 0 ? (
            <div className="text-center text-xs py-4 text-slate-500">
              Default system audio track
            </div>
          ) : (
            <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
              {audioTracks.map((track) => (
                <button
                  key={track.id}
                  onClick={() => selectAudioTrack(track.index)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                    track.enabled
                      ? 'bg-blue-600/10 border border-blue-500/30 text-blue-400 font-semibold'
                      : 'hover:bg-slate-900/60 border border-transparent text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="capitalize">{track.label}</span>
                    {track.language && track.language !== 'unknown' && (
                      <span className="text-[9px] opacity-60 font-mono">{track.language.toUpperCase()}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {!isLocal && showDriveLoader && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#09060F]/95 backdrop-blur-md z-30 transition-opacity duration-500">
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full bg-pink-600/20 border border-pink-500/30 animate-ping" />
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-pink-600 to-purple-600 border border-pink-500/40 flex items-center justify-center shadow-xl shadow-pink-950/60">
                <Cloud className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-extrabold text-white tracking-wide font-['Outfit']">Preparing Your Beautiful Moment ❤️</p>
              <p className="text-[11px] text-pink-300/70 mt-1">Buffering romantic stream for Harashwar & Dharunya…</p>
            </div>
          </div>
          <div className="w-64">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] text-pink-300/50 font-mono">Buffering</span>
              <span className="text-[10px] text-pink-400 font-mono font-semibold">{driveProgress}%</span>
            </div>
            <div className="h-1.5 w-full bg-pink-950/50 rounded-full overflow-hidden border border-pink-500/20">
              <div
                className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300 ease-out"
                style={{ width: `${driveProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {showBufferingIndicator && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity z-20">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-12 h-12 text-pink-500 animate-spin" />
            <span className="text-sm font-extrabold text-white font-['Outfit']">
              Synchronizing movie playback... ❤️
            </span>
          </div>
        </div>
      )}

      {hostError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/75 backdrop-blur-xs z-25 transition-opacity">
          <div className="flex flex-col items-center gap-3 max-w-sm text-center p-6 bg-[#140C20] border border-pink-500/30 rounded-3xl shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-white">Stream Connection Error</span>
            <span className="text-xs text-pink-200/60 leading-relaxed">
              The stream encountered a network error. Playback is paused.
            </span>
          </div>
        </div>
      )}

      {localError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/85 backdrop-blur-xs z-30 transition-opacity">
          <div className="flex flex-col items-center gap-3 max-w-sm text-center p-6 bg-[#140C20] border border-pink-500/30 rounded-3xl shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 animate-bounce">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-red-400">Media Format Error</span>
            <span className="text-xs text-pink-200/60 leading-relaxed">
              {localError}
            </span>
          </div>
        </div>
      )}

      <div className={`absolute top-4 left-4 bg-[#09060F]/80 backdrop-blur-md border border-pink-500/20 px-3 py-1 rounded-full flex items-center gap-2 transition-opacity duration-300 ${
        showControls && !showBufferingIndicator ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-pink-500 animate-pulse' : 'bg-amber-500'}`} />
        <span className="text-xs text-pink-200 font-mono">
          {isLocal ? 'Synced · Local File' : `Synced Stream · ${latencyText}`}
        </span>
      </div>

      {isLocal && (
        <div className={`absolute top-4 right-4 flex items-center gap-1.5 bg-[#09060F]/80 backdrop-blur-md border border-pink-500/30 px-2.5 py-1 rounded-full transition-opacity duration-300 ${
          showControls && !showBufferingIndicator ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
          <span className="text-[10px] text-pink-400 font-semibold font-mono">Local File</span>
        </div>
      )}

      <div
        onMouseEnter={() => setIsHoveringControls(true)}
        onMouseLeave={() => setIsHoveringControls(false)}
        className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#09060F]/95 via-[#09060F]/60 to-transparent transition-opacity duration-300 flex flex-col gap-3 ${
          showControls && !showBufferingIndicator ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-pink-200">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleScrubberChange}
            onMouseDown={() => setIsDraggingScrubber(true)}
            onTouchStart={() => setIsDraggingScrubber(true)}
            className="w-full h-1 bg-[#140C20] rounded-lg appearance-none cursor-pointer accent-[#FF4F9A] hover:h-2 transition-all"
          />
          <span className="text-xs font-mono text-pink-200">{formatTime(duration)}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              disabled={isPlayDisabled}
              className={`p-2 rounded-full transition-colors text-white ${
                isPlayDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-pink-900/30'
              }`}
              title={isPlayDisabled ? 'Preparing stream' : 'Play/Pause'}
            >
              {isPlaying ? <Pause className="w-5 h-5 text-pink-400" /> : <Play className="w-5 h-5 fill-pink-400 text-pink-400" />}
            </button>

            <div className="flex items-center gap-2">
              <button onClick={toggleMute} className="p-2 hover:bg-pink-900/30 rounded-full transition-colors text-pink-300">
                {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-[#140C20] rounded-lg appearance-none cursor-pointer accent-[#FF4F9A]"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAudioMenu(!showAudioMenu)}
              className={`p-2 hover:bg-pink-900/30 rounded-full transition-colors ${
                showAudioMenu ? 'text-pink-400 bg-pink-950/50' : 'text-pink-300'
              }`}
              title="Audio Tracks"
            >
              <Headphones className="w-5 h-5" />
            </button>
            <button onClick={toggleFullScreen} className="p-2 hover:bg-pink-900/30 rounded-full transition-colors text-pink-300">
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
