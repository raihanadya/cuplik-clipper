import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { formatDuration } from '../../utils/formatters.js';

export function VideoPlayer({
  src,
  poster,
  title,
  subtitles = [],
  currentTimeOverride,
  onTimeUpdateCallback,
  className,
  autoPlay = false,
  loop = false,
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hasError, setHasError] = useState(false);
  const controlsTimeoutRef = useRef(null);

  useEffect(() => {
    if (currentTimeOverride !== undefined && videoRef.current) {
      videoRef.current.currentTime = currentTimeOverride;
    }
  }, [currentTimeOverride]);

  const togglePlay = () => {
    if (!videoRef.current || !src) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {
        // Autoplay policy or error
        setIsPlaying(false);
      });
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e) => {
    if (!videoRef.current || !duration) return;
    const seekTime = parseFloat(e.target.value);
    videoRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 2500);
  };

  // Find active subtitle word based on currentTime
  const activeWordIndex = subtitles && subtitles.length > 0
    ? subtitles.findIndex(
        (sub) => currentTime >= Number(sub.start_time) && currentTime <= Number(sub.end_time)
      )
    : -1;

  if (!src) {
    return (
      <div
        className={clsx(
          'relative aspect-[9/16] w-full max-w-sm mx-auto rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col items-center justify-center p-6 text-center text-slate-400',
          className
        )}
      >
        <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center mb-3">
          <AlertCircle className="h-6 w-6 text-indigo-400" />
        </div>
        <p className="text-sm font-medium text-slate-300">Pratinjau Video Belum Siap</p>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          Video sedang dalam tahap rendering atau tautan pratinjau belum diterbitkan oleh backend.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className={clsx(
        'group relative aspect-[9/16] w-full max-w-sm mx-auto rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl select-none',
        className
      )}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        loop={loop}
        autoPlay={autoPlay}
        playsInline
        onTimeUpdate={() => {
          if (videoRef.current) {
            const t = videoRef.current.currentTime;
            setCurrentTime(t);
            onTimeUpdateCallback?.(t);
          }
        }}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration || 0);
          }
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onError={() => setHasError(true)}
        onClick={togglePlay}
        className="h-full w-full object-cover cursor-pointer"
      />

      {/* Subtitle active word display preview if provided */}
      {subtitles && subtitles.length > 0 && (
        <div className="pointer-events-none absolute bottom-16 inset-x-4 flex justify-center text-center z-10">
          <div className="bg-black/75 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-lg max-w-[90%] shadow-lg">
            <p className="text-xs sm:text-sm font-semibold flex flex-wrap justify-center gap-1 leading-relaxed">
              {subtitles.slice(0, 15).map((sub, idx) => (
                <span
                  key={idx}
                  className={clsx(
                    'transition-colors duration-150',
                    idx === activeWordIndex
                      ? 'text-yellow-300 font-bold underline decoration-yellow-400 decoration-2'
                      : 'text-slate-200'
                  )}
                >
                  {sub.word}
                </span>
              ))}
            </p>
          </div>
        </div>
      )}

      {/* Play/Pause center overlay when paused */}
      {!isPlaying && !hasError && (
        <button
          onClick={togglePlay}
          aria-label="Putar video"
          className="absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600/90 text-white shadow-xl backdrop-blur-sm transition-transform hover:scale-110 active:scale-95 focus:outline-none"
        >
          <Play className="h-7 w-7 fill-white ml-0.5" />
        </button>
      )}

      {hasError && (
        <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center text-rose-300">
          <AlertCircle className="h-8 w-8 mb-2 text-rose-500" />
          <p className="text-xs font-semibold">Gagal memuat video.</p>
          <p className="text-[10px] text-slate-400 mt-1">Periksa tautan atau status rendering klip.</p>
        </div>
      )}

      {/* Player Controls Bar */}
      <div
        className={clsx(
          'absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-6 transition-opacity duration-300 z-20',
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        {/* Scrubber Progress Bar */}
        <div className="relative flex items-center mb-2">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            aria-label="Posisi pemutaran video"
            className="w-full h-1.5 bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between text-slate-200 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? 'Jeda' : 'Putar'}
              className="hover:text-white p-1"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
            </button>
            <button
              onClick={toggleMute}
              aria-label={isMuted ? 'Aktifkan suara' : 'Bisukan suara'}
              className="hover:text-white p-1"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <span className="font-mono text-[11px] text-slate-400">
              {formatDuration(currentTime)} / {formatDuration(duration)}
            </span>
          </div>

          <button
            onClick={toggleFullscreen}
            aria-label="Layar penuh"
            className="hover:text-white p-1"
          >
            <Maximize className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer;
