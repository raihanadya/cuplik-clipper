import React from 'react';
import { clsx } from 'clsx';

export function TemplateDiagram({ templateId, className, active = false }) {
  if (templateId === 'slide_pembicara') {
    return (
      <div
        className={clsx(
          'relative w-full aspect-[9/16] rounded-xl overflow-hidden border transition-all duration-200 flex flex-col',
          active
            ? 'border-[#C65D3A] bg-[#FCFBF8] shadow-md shadow-[#C65D3A]/10 ring-2 ring-[#C65D3A]/30'
            : 'border-[#DEDAD2] bg-white hover:border-[#969189]'
        )}
      >
        {/* Top 60%: Slide Presentation */}
        <div className="h-[60%] border-b border-dashed border-[#DEDAD2] bg-[#F7F5F0] p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#C65D3A] font-mono tracking-wider uppercase">Slide (~60%)</span>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#C65D3A]/40" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#C65D3A]/40" />
            </div>
          </div>
          <div className="space-y-1.5 my-auto">
            <div className="h-1.5 w-3/4 bg-[#DEDAD2] rounded" />
            <div className="h-1.5 w-1/2 bg-[#DEDAD2]/70 rounded" />
            <div className="h-4 w-full bg-white rounded border border-[#DEDAD2] flex items-center justify-center">
              <span className="text-[9px] font-medium text-[#6F6B63]">Materi Presentasi Pelatihan</span>
            </div>
          </div>
        </div>

        {/* Middle 28%: Webcam Speaker */}
        <div className="h-[28%] border-b border-[#DEDAD2] bg-[#FCFBF8] p-2 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#F2DED5] border border-[#C65D3A]/30 flex items-center justify-center text-xs text-[#C65D3A] font-bold shrink-0">
            RP
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold text-[#242321] uppercase">Webcam (~30%)</div>
            <div className="text-[9px] text-[#6F6B63]">Wajah Pemateri Aktif</div>
          </div>
        </div>

        {/* Bottom 12%: Subtitles with realistic Indonesian text */}
        <div className="h-[12%] bg-[#242321] flex items-center justify-center px-2">
          <p className="text-[9px] font-bold text-white truncate tracking-wide">
            "Ini poin paling fundamental dalam materi ini."
          </p>
        </div>
      </div>
    );
  }

  if (templateId === 'talking_head') {
    return (
      <div
        className={clsx(
          'relative w-full aspect-[9/16] rounded-xl overflow-hidden border transition-all duration-200 flex flex-col',
          active
            ? 'border-[#C65D3A] bg-[#FCFBF8] shadow-md shadow-[#C65D3A]/10 ring-2 ring-[#C65D3A]/30'
            : 'border-[#DEDAD2] bg-white hover:border-[#969189]'
        )}
      >
        {/* Full 9:16 Center-Cropped Speaker */}
        <div className="flex-1 bg-gradient-to-b from-[#F7F5F0] via-white to-[#F2DED5]/40 flex flex-col items-center justify-center p-3 relative">
          <div className="w-14 h-14 rounded-full bg-[#F2DED5] border-2 border-[#C65D3A]/40 flex items-center justify-center shadow-inner mb-2">
            <span className="text-xl">🎙️</span>
          </div>
          <span className="text-[11px] font-bold text-[#242321] font-mono uppercase tracking-wider">
            Talking Head
          </span>
          <span className="text-[9px] text-[#6F6B63] mt-0.5 text-center">
            Fokus vertikal ke pemateri & kreator
          </span>

          {/* Subtitles Overlay with realistic Indonesian text */}
          <div className="absolute bottom-3 inset-x-2 text-center">
            <div className="inline-block bg-[#242321]/90 px-2 py-1 rounded-md text-[9px] font-bold text-white shadow-xs">
              "Pastikan audiens memahami alur berpikirnya."
            </div>
          </div>
        </div>
      </div>
    );
  }

  // slide_saja
  return (
    <div
      className={clsx(
        'relative w-full aspect-[9/16] rounded-xl overflow-hidden border transition-all duration-200 flex flex-col justify-between bg-[#F7F5F0] p-2',
        active
          ? 'border-[#C65D3A] bg-[#FCFBF8] shadow-md shadow-[#C65D3A]/10 ring-2 ring-[#C65D3A]/30'
          : 'border-[#DEDAD2] bg-[#F7F5F0] hover:border-[#969189]'
      )}
    >
      <div className="text-center pt-2">
        <span className="text-[10px] font-bold text-[#6F6B63] font-mono uppercase tracking-wider">
          Slide Saja (Letterbox 16:9)
        </span>
      </div>

      {/* Centered 16:9 Letterboxed Slide */}
      <div className="w-full aspect-[16/9] bg-white border border-[#DEDAD2] rounded-lg p-2 flex flex-col justify-between shadow-xs my-auto">
        <div className="flex items-center justify-between">
          <div className="h-1.5 w-1/3 bg-[#C65D3A]/30 rounded" />
          <span className="text-[8px] text-[#6F6B63] font-mono">16:9 HD</span>
        </div>
        <div className="space-y-1 py-1">
          <div className="h-1 w-3/4 bg-[#DEDAD2] rounded" />
          <div className="h-1 w-1/2 bg-[#DEDAD2] rounded" />
        </div>
        <div className="text-[8px] text-[#242321] text-center font-semibold">Tampilan Layar & Tutorial</div>
      </div>

      {/* Realistic Subtitles */}
      <div className="pb-2 text-center">
        <div className="inline-block bg-[#242321] px-2 py-0.5 rounded text-[9px] font-bold text-white">
          "Perhatikan struktur arsitektur pada diagram."
        </div>
      </div>
    </div>
  );
}

export default TemplateDiagram;
