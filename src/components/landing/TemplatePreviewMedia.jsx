 import React, { useRef, useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import { clsx } from 'clsx';
import { TemplateDiagram } from '../media/TemplateDiagram.jsx';

const TEMPLATE_SUBTITLES = {
  slide_pembicara: 'Ini poin paling fundamental dalam materi ini.',
  talking_head: 'Pastikan audiens memahami alur berpikirnya.',
  slide_saja: 'Perhatikan struktur arsitektur pada diagram.',
};

export function TemplatePreviewMedia({
  template,
  isActive = false,
  onSelect,
  videoSrc,
  posterSrc,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  // Real-time canvas crop engine for the 3 distinct templates
  useEffect(() => {
    let animFrameId;

    const renderTemplateFrame = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState >= 2) {
        const ctx = canvas.getContext('2d');
        const vWidth = video.videoWidth;
        const vHeight = video.videoHeight;

        const targetW = 360;
        const targetH = 640;

        if (canvas.width !== targetW || canvas.height !== targetH) {
          canvas.width = targetW;
          canvas.height = targetH;
        }

        ctx.clearRect(0, 0, targetW, targetH);

        if (template.id === 'talking_head') {
          // --- 1. TALKING HEAD: Proportional Full Face Zoom ---
          const cropW = vWidth * 0.035;
          const cropH = cropW * (16 / 9);
          const cropX = vWidth * 0.915;
          const cropY = vHeight * 0.005;

          ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, targetW, targetH);
        } else if (template.id === 'slide_pembicara') {
          // --- 2. SLIDE + SPEAKER: Unstretched Split Screen ---
          const topH = targetH * 0.65;
          const bottomH = targetH * 0.35;

          // Top 65%: Letterboxed Presentation Slide
          ctx.fillStyle = '#0f0f10';
          ctx.fillRect(0, 0, targetW, topH);

          const slideH = targetW * (9 / 16);
          const slideY = (topH - slideH) / 2;
          ctx.drawImage(video, 0, 0, vWidth, vHeight, 0, slideY, targetW, slideH);

          // Bottom 35%: Zoomed out Speaker Face (Full Headshot)
          const spkW = vWidth * 0.11; // Wider width to zoom out
          const spkH = spkW * (bottomH / targetW);
          const spkX = vWidth * 0.88; // Shifted left to center the crop box
          const spkY = vHeight * 0.005;

          ctx.drawImage(video, spkX, spkY, spkW, spkH, 0, topH, targetW, bottomH);
        } else {
          // --- 3. SLIDE SAJA: Letterboxed Slide ---
          ctx.fillStyle = '#0f0f10';
          ctx.fillRect(0, 0, targetW, targetH);

          const slideH = targetW * (9 / 16);
          const slideY = (targetH - slideH) / 2;
          ctx.drawImage(video, 0, 0, vWidth, vHeight, 0, slideY, targetW, slideH);
        }
      }
      animFrameId = requestAnimationFrame(renderTemplateFrame);
    };

    renderTemplateFrame();
    return () => cancelAnimationFrame(animFrameId);
  }, [template.id]);

  const subtitleText = TEMPLATE_SUBTITLES[template.id] || 'Kutipan materi edukasi penting dari sesi ini.';

  return (
    <div
      onClick={onSelect}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={clsx(
        'group cursor-pointer rounded-2xl border p-5 transition-all duration-300 flex flex-col justify-between shadow-sm',
        isActive
          ? 'bg-[#FCFBF8] border-[#C65D3A] ring-2 ring-[#C65D3A]/20 shadow-md shadow-[#C65D3A]/10'
          : 'bg-white border-[#DEDAD2] hover:border-[#969189] hover:bg-[#FCFBF8]'
      )}
    >
      <div>
        {/* Header Tag and Aspect Ratio */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span
              className={clsx(
                'px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider uppercase border',
                isActive
                  ? 'bg-[#F2DED5] text-[#C65D3A] border-[#C65D3A]/30'
                  : 'bg-[#F7F5F0] text-[#6F6B63] border-[#DEDAD2]'
              )}
            >
              {template.tag || 'DEFAULT'}
            </span>
            <span className="text-[10px] text-[#969189] font-mono">16:9 → 9:16</span>
          </div>

          <span className="text-xs font-mono font-medium text-[#6F6B63]">
            {template.aspect || '9:16 Vertical'}
          </span>
        </div>

        {/* Visual Preview Frame */}
        <div className="relative aspect-[9/16] w-full max-w-[210px] mx-auto rounded-xl overflow-hidden border border-[#DEDAD2] mb-4 bg-stone-900 shadow-inner">
          {videoSrc ? (
            <>
              {/* Offscreen Video Element (Not display:none) */}
              <video
                ref={videoRef}
                src={videoSrc}
                poster={posterSrc}
                playsInline
                loop
                muted
                className="absolute w-0 h-0 opacity-0 pointer-events-none"
              />
              {/* Rendered Template Output Canvas */}
              <canvas ref={canvasRef} className="w-full h-full object-cover" />
            </>
          ) : (
            <TemplateDiagram templateId={template.id} active={isActive} />
          )}

          {/* Subtitle Caption Bar */}
          <div className="absolute inset-x-2 bottom-3 pointer-events-none text-center">
            <div className="inline-block bg-black/85 border border-white/15 px-2.5 py-1 rounded text-[9px] font-semibold text-white shadow-md">
              "{subtitleText}"
            </div>
          </div>

          {/* Hover Play Indicator */}
          {videoSrc && (
            <div
              className={clsx(
                'absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity duration-200 pointer-events-none',
                isHovered ? 'opacity-0' : 'opacity-100'
              )}
            >
              <div className="h-9 w-9 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center text-white border border-white/20">
                <Play className="h-3.5 w-3.5 fill-white ml-0.5" />
              </div>
            </div>
          )}
        </div>

        {/* Title and Explanation */}
        <h4 className="text-base font-bold text-[#242321] font-display">
          {template.label}
        </h4>
        <p className="mt-1 text-xs text-[#6F6B63] leading-relaxed">
          {template.description}
        </p>
      </div>

      {/* Footer info */}
      <div className="mt-4 pt-3 border-t border-[#DEDAD2] flex items-center justify-between text-xs text-[#6F6B63]">
        <span>Cocok untuk: {template.suitableFor || template.bestFor}</span>
      </div>
    </div>
  );
}

export default TemplatePreviewMedia;