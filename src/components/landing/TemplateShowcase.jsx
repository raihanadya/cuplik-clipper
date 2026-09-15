import React, { useState } from 'react';
import { LayoutTemplate, Info } from 'lucide-react';
import { LAYOUT_TEMPLATES } from '../../constants/layoutTemplates.js';
import { TemplatePreviewMedia } from './TemplatePreviewMedia.jsx';

const TEMPLATE_DEMO_MEDIA = {
  slide_pembicara: {
    videoSrc: '/videos/hero-webinar.mp4',
    posterSrc: '/videos/hero-webinar-poster.jpg',
  },
  talking_head: {
    videoSrc: '/videos/hero-webinar.mp4',
    posterSrc: '/videos/hero-webinar-poster.jpg',
  },
  slide_saja: {
    videoSrc: '/videos/hero-webinar.mp4',
    posterSrc: '/videos/hero-webinar-poster.jpg',
  },
};

export function TemplateShowcase() {
  const [selectedTemplateId, setSelectedTemplateId] = useState('slide_pembicara');

  const selectedTemplate =
    LAYOUT_TEMPLATES.find((t) => t.id === selectedTemplateId) || LAYOUT_TEMPLATES[0];

  return (
    <section id="templates" className="py-20 md:py-28 border-t border-[#DEDAD2] bg-[#FCFBF8] relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#DEDAD2] bg-white text-[#C65D3A] text-xs font-semibold mb-3 font-mono shadow-xs">
            <LayoutTemplate className="h-3.5 w-3.5" /> 3 Pilihan Layout Resmi
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#242321] font-display">
            Tata Letak Deterministik Tanpa Glitch
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#6F6B63] leading-relaxed">
            Tidak ada kejutan kamera salah crop atau slide tertutup muka pembicara. Tiga format tata letak proporsional yang dapat diprediksi untuk kebutuhan konten pelatihan Anda.
          </p>
        </div>

        {/* 3 Template Bento Showcase Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {LAYOUT_TEMPLATES.map((template) => {
            const media = TEMPLATE_DEMO_MEDIA[template.id] || {};
            const isSelected = selectedTemplateId === template.id;

            return (
              <TemplatePreviewMedia
                key={template.id}
                template={template}
                isActive={isSelected}
                onSelect={() => setSelectedTemplateId(template.id)}
                videoSrc={media.videoSrc}
                posterSrc={media.posterSrc}
              />
            );
          })}
        </div>

        {/* Selected Template Details Spotlight */}
        <div className="mt-12 rounded-2xl border border-[#DEDAD2] bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold font-mono text-[#C65D3A] uppercase tracking-wider">
                Detail Template Terpilih
              </span>
              <h3 className="text-xl font-bold text-[#242321] font-display mt-0.5">
                {selectedTemplate.label} ({selectedTemplate.id})
              </h3>
              <p className="mt-1 text-sm text-[#6F6B63] max-w-2xl">
                {selectedTemplate.description}
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2 bg-[#F7F5F0] border border-[#DEDAD2] px-3.5 py-1.5 rounded-xl text-xs text-[#242321] font-mono">
              <span className="w-2 h-2 rounded-full bg-[#3F7D55]" />
              <span>Kompatibel: TikTok, Reels, Shorts</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#DEDAD2] flex items-center gap-2 text-xs text-[#969189]">
            <Info className="h-3.5 w-3.5 text-[#6F6B63] shrink-0" />
            <span>*Klip preview di atas memvisualisasikan komposisi proporsional layout deterministik yang dihasilkan oleh engine Cuplik.</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TemplateShowcase;
