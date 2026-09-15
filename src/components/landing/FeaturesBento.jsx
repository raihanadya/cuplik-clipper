import React from 'react';
import { motion } from 'motion/react';
import {
  Mic,
  LayoutTemplate,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  DownloadCloud,
} from 'lucide-react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js';

export function FeaturesBento() {
  const prefersReducedMotion = usePrefersReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  return (
    <section id="features" className="py-20 md:py-28 border-t border-[#DEDAD2] bg-[#F7F5F0]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold text-[#C65D3A] uppercase tracking-wider font-mono">
            Keunggulan Khusus
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-[#242321] font-display">
            Dirancang Khusus untuk Konten Edukasi & Pelatihan
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#6F6B63] leading-relaxed">
            Bukan sekadar memotong video secara acak. Fitur Cuplik berfokus pada pemahaman pedagogis materi dan ketepatan istilah Bahasa Indonesia.
          </p>
        </div>

        {/* Bento Grid with light editorial styling */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Card 1: Indonesian ASR & Custom Vocab (Spans 2 cols on desktop) */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-2 rounded-2xl border border-[#DEDAD2] bg-white p-6 sm:p-8 flex flex-col justify-between hover:border-[#969189] transition-colors shadow-sm shadow-stone-900/5"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F2DED5] text-[#C65D3A] mb-4">
                <Mic className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#C65D3A] font-mono">
                Speech-to-Text Spesifik
              </span>
              <h3 className="text-xl font-bold text-[#242321] font-display mt-1 mb-2">
                ASR Bahasa Indonesia & Kamus Istilah Khusus
              </h3>
              <p className="text-sm text-[#6F6B63] leading-relaxed max-w-xl">
                Ditenagai model transkripsi teroptimasi untuk tuturan lisan Indonesia, istilah teknis, akronim, serta istilah bisnis. Mendukung input custom vocabulary hingga 200 karakter untuk mencegah kesalahan pengejaan nama materi atau terminologi teknis asing.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-[#DEDAD2]">
              <span className="px-2.5 py-1 rounded-lg bg-[#F7F5F0] border border-[#DEDAD2] text-[#242321] text-xs font-mono">
                Kamus Khusus (200 Karakter)
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#F2DED5] text-[#C65D3A] text-xs font-mono font-medium">
                Word-Level Timestamps
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#3F7D55]/10 text-[#3F7D55] text-xs font-mono font-medium">
                Subtitle Indonesia Otomatis
              </span>
            </div>
          </motion.div>

          {/* Card 2: Zero-Retention Privacy (1 col) */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-1 rounded-2xl border border-[#DEDAD2] bg-white p-6 sm:p-8 flex flex-col justify-between hover:border-[#969189] transition-colors shadow-sm shadow-stone-900/5"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#3F7D55]/15 text-[#3F7D55] mb-4">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#3F7D55] font-mono">
                Keamanan Materi
              </span>
              <h3 className="text-xl font-bold text-[#242321] font-display mt-1 mb-2">
                Privasi Zero-Retention 24 Jam
              </h3>
              <p className="text-sm text-[#6F6B63] leading-relaxed">
                Materi webinar berharga Anda tetap aman. File video fisik dihapus otomatis secara permanen setelah 24 jam demi kepatuhan hak cipta dan kekayaan intelektual pelatihan.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#DEDAD2] text-xs text-[#3F7D55] font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Kebijakan Pembersihan Otomatis
            </div>
          </motion.div>

          {/* Card 3: Concept Completeness (1 col) */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-1 rounded-2xl border border-[#DEDAD2] bg-white p-6 sm:p-8 flex flex-col justify-between hover:border-[#969189] transition-colors shadow-sm shadow-stone-900/5"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#A86F24]/15 text-[#A86F24] mb-4">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#A86F24] font-mono">
                Logika Kurasi
              </span>
              <h3 className="text-xl font-bold text-[#242321] font-display mt-1 mb-2">
                Concept Completeness
              </h3>
              <p className="text-sm text-[#6F6B63] leading-relaxed">
                Setiap klip memiliki batasan logis yang tuntas dari pembukaan argumen hingga kesimpulan, mencegah video terpotong mendadak di tengah penjelasan pemateri.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#DEDAD2] text-xs text-[#6F6B63] font-mono">
              Target Durasi Klip: 25 - 75 Detik
            </div>
          </motion.div>

          {/* Card 4: Deterministic Layout Templates (1 col) */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-1 rounded-2xl border border-[#DEDAD2] bg-white p-6 sm:p-8 flex flex-col justify-between hover:border-[#969189] transition-colors shadow-sm shadow-stone-900/5"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F2DED5] text-[#C65D3A] mb-4">
                <LayoutTemplate className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#C65D3A] font-mono">
                Tata Letak Konsisten
              </span>
              <h3 className="text-xl font-bold text-[#242321] font-display mt-1 mb-2">
                3 Template Deterministik
              </h3>
              <p className="text-sm text-[#6F6B63] leading-relaxed">
                Bebas dari kegagalan pelacakan wajah (face-tracking). Tiga opsi tata letak proporsional yang dapat diprediksi: Slide + Pembicara, Talking Head, dan Slide Saja.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#DEDAD2] text-xs text-[#242321] font-mono">
              Tanpa Glitch Cropping Otomatis
            </div>
          </motion.div>

          {/* Card 5: Lightweight Nudge Editor & Export (1 col) */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-1 rounded-2xl border border-[#DEDAD2] bg-white p-6 sm:p-8 flex flex-col justify-between hover:border-[#969189] transition-colors shadow-sm shadow-stone-900/5"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#242321]/10 text-[#242321] mb-4">
                <Sliders className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#242321] font-mono">
                Penyelarasan Presisi
              </span>
              <h3 className="text-xl font-bold text-[#242321] font-display mt-1 mb-2">
                Editor Nudge Halus ±0.5 Detik
              </h3>
              <p className="text-sm text-[#6F6B63] leading-relaxed">
                Ingin memajukan titik awal sedikit? Gunakan tombol kontrol waktu halus ±0.5 detik dan koreksi teks subtitle langsung di peramban tanpa software eksternal.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#DEDAD2] flex items-center justify-between text-xs text-[#6F6B63] font-mono">
              <span>Rerender Cepat &lt; 60s</span>
              <DownloadCloud className="h-4 w-4 text-[#C65D3A]" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default FeaturesBento;
