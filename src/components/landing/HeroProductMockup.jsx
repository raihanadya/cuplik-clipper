import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Film, Sparkles, Volume2, VolumeX, CheckCircle2, ArrowRight } from 'lucide-react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js';

const SUBTITLE_CUES = [
  'Setelah itu, kita bisa mulai melihat hasilnya.',
  'Jadi, hal pertama yang perlu kita lakukan adalah...',
  'Pastikan materi utama sudah tersusun dengan jelas.',
  'Ini bagian yang paling sering dilewatkan.',
];

export function HeroProductMockup() {
  const [subtitleIndex, setSubtitleIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const landscapeVideoRef = useRef(null);
  const canvasRef = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Automatic subtitle rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setSubtitleIndex((prev) => (prev + 1) % SUBTITLE_CUES.length);
    }, 3600);
    return () => clearInterval(interval);
  }, []);

  // Sync landscape video with real-time canvas crop
  useEffect(() => {
    let animFrameId;

    const renderCrop = () => {
      const video = landscapeVideoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState >= 2) {
        const ctx = canvas.getContext('2d');
        const vWidth = video.videoWidth;
        const vHeight = video.videoHeight;

        // Target 9:16 phone mockup resolution
        const targetW = 360;
        const targetH = 640;

        if (canvas.width !== targetW || canvas.height !== targetH) {
          canvas.width = targetW;
          canvas.height = targetH;
        }

        // Tighter zoom window with 9:16 aspect ratio
        const cropW = vWidth * 0.035;
        const cropH = cropW * (16 / 9);

        const cropX = vWidth * 0.915; // Centered X on face
        const cropY = vHeight * 0.005; // Shifted higher to include top of head

        ctx.clearRect(0, 0, targetW, targetH);
        ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, targetW, targetH);
      }
      animFrameId = requestAnimationFrame(renderCrop);
    };

    renderCrop();
    return () => cancelAnimationFrame(animFrameId);
  }, []);

  const toggleMute = () => {
    const newMuted = !isMuted;
    if (landscapeVideoRef.current) landscapeVideoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto rounded-3xl border border-[#DEDAD2] bg-[#FCFBF8] p-4 sm:p-6 lg:p-8 shadow-xl shadow-stone-900/5">
      {/* Transformation Pipeline Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between pb-5 mb-6 border-b border-[#DEDAD2] gap-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#B54A43]" />
          <div className="w-3 h-3 rounded-full bg-[#A86F24]" />
          <div className="w-3 h-3 rounded-full bg-[#3F7D55]" />
          <span className="ml-2 text-xs font-mono font-medium text-[#6F6B63]">cuplik-pipeline-preview</span>
        </div>

        {/* Visual Transformation Flow Header */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-medium text-[#6F6B63] overflow-x-auto py-1">
          <span className="font-semibold text-[#242321] whitespace-nowrap">
            Rekaman Webinar Asli (16:9 Landscape)
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-[#C65D3A] shrink-0" />
          <span className="font-semibold text-[#C65D3A] bg-[#F2DED5] px-2 py-0.5 rounded-md whitespace-nowrap">
            Cuplik
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-[#C65D3A] shrink-0" />
          <span className="font-semibold text-[#242321] whitespace-nowrap">
            Hasil Vertikal 9:16 Otomatis
          </span>
        </div>
      </div>

      {/* Main Before / After Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column (7 cols): 16:9 Landscape Source Video */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between text-xs text-[#6F6B63]">
            <span className="flex items-center gap-1.5 font-semibold text-[#242321]">
              <Film className="h-4 w-4 text-[#C65D3A]" />
              Rekaman Webinar Asli (16:9 Landscape)
            </span>
            <span className="bg-[#F7F5F0] border border-[#DEDAD2] px-2 py-0.5 rounded text-[11px] font-mono text-[#6F6B63]">
              1280x720 • HD
            </span>
          </div>

          {/* 16:9 Landscape Video Frame */}
          <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-[#DEDAD2] bg-stone-900 shadow-inner group">
            <video
              ref={landscapeVideoRef}
              src="/videos/hero-webinar.mp4"
              poster="/videos/hero-webinar-poster.jpg"
              autoPlay
              muted={isMuted}
              loop
              playsInline
              className="w-full h-full object-cover"
            />

            {/* Red 9:16 bounding box matching the exact zoom crop region */}
            <div className="pointer-events-none absolute top-[0.5%] right-[5%] w-[3.5%] aspect-[9/16] border-2 border-[#C65D3A] rounded-xs bg-[#C65D3A]/20">
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-[#242321] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md shadow-md whitespace-nowrap border border-[#C65D3A]">
                Area Cuplik 9:16
              </span>
            </div>

            {/* Video Controls Overlay */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="p-1.5 rounded-lg bg-black/50 hover:bg-black/80 text-white transition-colors border border-white/20"
                  aria-label={isMuted ? 'Aktifkan audio' : 'Bisukan audio'}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <span className="text-[11px] text-stone-200 font-mono hidden sm:inline">
                  Sesi Kuliah & Presentasi Online
                </span>
              </div>
              <span className="text-[10px] bg-[#C65D3A]/90 text-white font-mono px-2 py-0.5 rounded font-semibold">
                ASR: Bahasa Indonesia
              </span>
            </div>
          </div>

          {/* Real Process Metrics */}
          <div className="grid grid-cols-3 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-white border border-[#DEDAD2]">
              <div className="text-[#969189] text-[10px] font-semibold uppercase tracking-wider">
                Transkripsi ASR
              </div>
              <div className="text-[#3F7D55] font-bold mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 shrink-0" /> Akurasi 98.4%
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#DEDAD2]">
              <div className="text-[#969189] text-[10px] font-semibold uppercase tracking-wider">
                Kurasi Cerdas
              </div>
              <div className="text-[#C65D3A] font-bold mt-0.5 flex items-center gap-1">
                <Sparkles className="h-3 w-3 shrink-0" /> Concept Complete
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#DEDAD2]">
              <div className="text-[#969189] text-[10px] font-semibold uppercase tracking-wider">
                Hasil Otomatis
              </div>
              <div className="text-[#242321] font-bold mt-0.5">
                3 Klip Vertikal 9:16
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Vertical 9:16 Phone Mockup */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full flex items-center justify-between text-xs text-[#6F6B63] mb-2 px-1">
            <span className="font-semibold text-[#242321] flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#C65D3A]" />
              Hasil Vertikal 9:16 Otomatis
            </span>
            <span className="text-[11px] font-mono font-medium text-[#3F7D55] bg-[#3F7D55]/10 px-2 py-0.5 rounded">
              Siap Ekspor
            </span>
          </div>

          {/* Smartphone Frame */}
          <div className="relative w-full max-w-[270px] aspect-[9/16] rounded-3xl overflow-hidden border-4 border-[#242321] bg-black shadow-2xl flex flex-col justify-between">
            {/* Real-time Canvas Crop rendering speaker headshot */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Top Bar Overlay */}
            <div className="relative z-10 p-3 bg-gradient-to-b from-black/70 via-black/20 to-transparent flex items-center justify-between">
              <span className="text-[10px] font-bold font-mono text-white/90 bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded">
                Talking Head 9:16
              </span>
              <span className="text-[10px] font-mono text-white/80 bg-black/40 px-1.5 py-0.5 rounded">
                00:28
              </span>
            </div>

            {/* Subtitle Overlay */}
            <div className="relative z-20 pb-8 px-3.5 pointer-events-none">
              <AnimatePresence mode="wait">
                <motion.div
                  key={subtitleIndex}
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -4 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-xl bg-black/85 backdrop-blur-xs px-3 py-2 text-center border border-white/15 shadow-xl"
                >
                  <p className="text-xs sm:text-[13px] font-semibold text-white tracking-wide leading-snug">
                    "{SUBTITLE_CUES[subtitleIndex]}"
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Footer Label */}
          <p className="text-xs text-[#6F6B63] mt-3 text-center font-medium">
            *Demonstrasi layout: Talking Head
          </p>
        </div>
      </div>
    </div>
  );
}

export default HeroProductMockup;