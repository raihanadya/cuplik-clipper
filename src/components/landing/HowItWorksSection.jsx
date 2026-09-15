import React from 'react';
import { motion } from 'motion/react';
import { UploadCloud, Cpu, Download, Check, Sparkles, SlidersHorizontal, FileText, Film } from 'lucide-react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js';

export function HowItWorksSection() {
  const prefersReducedMotion = usePrefersReducedMotion();

  const steps = [
    {
      number: '01',
      title: '01 — Unggah Webinar',
      description:
        'Unggah rekaman webinar atau presentasi format MP4/MOV hingga 1 GB. Pilih satu dari 3 template layout resmi dan masukkan kamus istilah khusus (custom vocabulary) untuk istilah teknis yang spesifik.',
      icon: UploadCloud,
      highlights: ['Format MP4 / MOV ≤ 1 GB', '3 Pilihan Template Deterministik', 'Kamus Istilah Khusus (200 karakter)'],
      renderVisual: () => (
        <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-[#DEDAD2] bg-[#F7F5F0] group shadow-inner">
          <img
            src="/images/cara_kerja_upload.jpg"
            alt="Unggah Webinar"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
          />
          {/* Dropzone floating UI badge */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent flex flex-col justify-end p-3.5 text-white">
            <div className="bg-white/95 backdrop-blur-md rounded-lg p-2.5 text-[#242321] border border-[#DEDAD2] shadow-md flex items-center gap-2.5">
              <div className="p-1.5 rounded-md bg-[#F2DED5] text-[#C65D3A]">
                <Film className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate">webinar-arsitektur-cloud.mp4</p>
                <p className="text-[10px] text-[#6F6B63]">720p • 45 Menit • MP4</p>
              </div>
              <span className="text-[10px] bg-[#3F7D55]/15 text-[#3F7D55] font-semibold px-2 py-0.5 rounded">
                Valid
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      number: '02',
      title: '02 — Cuplik Memproses',
      description:
        'Pipeline Cuplik menjalankan transkripsi ASR Bahasa Indonesia berakurasi tinggi. Algoritma kurasi menyeleksi 1 hingga 3 poin materi yang memiliki awal dan akhir konseptual yang utuh (Concept Completeness).',
      icon: Cpu,
      highlights: ['Transkripsi ASR Bahasa Indonesia', 'Kurasi Berprinsip Concept Completeness', 'Pemantauan Status REST Polling 5 Detik'],
      renderVisual: () => (
        <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-[#DEDAD2] bg-white p-3.5 flex flex-col justify-between shadow-xs">
          {/* Pipeline UI Mockup */}
          <div className="flex items-center justify-between border-b border-[#DEDAD2] pb-2 text-[11px]">
            <span className="font-semibold text-[#242321] flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#C65D3A]" /> Pipeline Cuplik AI
            </span>
            <span className="bg-[#F2DED5] text-[#C65D3A] text-[10px] font-bold px-2 py-0.5 rounded">
              Memproses
            </span>
          </div>

          <div className="space-y-2 py-1">
            {/* Stage 1 */}
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-[#6F6B63]">1. Transkripsi ASR Indonesia</span>
              <span className="text-[#3F7D55] font-semibold flex items-center gap-1">
                <Check className="h-3 w-3" /> Selesai (98.4%)
              </span>
            </div>
            {/* Stage 2 */}
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-[#242321] font-semibold">2. Concept Completeness</span>
              <span className="text-[#C65D3A] font-bold">Menganalisis...</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-[#F7F5F0] h-1.5 rounded-full overflow-hidden border border-[#DEDAD2]">
              <div className="bg-[#C65D3A] h-full w-[72%] rounded-full animate-pulse" />
            </div>
            {/* Stage 3 */}
            <div className="flex items-center justify-between text-[10px] text-[#969189]">
              <span>3. Komposisi Layout 9:16</span>
              <span>Antrean</span>
            </div>
          </div>

          <div className="bg-[#F7F5F0] rounded-lg px-2.5 py-1.5 border border-[#DEDAD2] text-[10px] text-[#6F6B63] flex items-center justify-between">
            <span className="truncate">Topik Terdeteksi: 3 Segmen Utuh</span>
            <span className="font-mono text-[#242321] font-medium">35-65s</span>
          </div>
        </div>
      ),
    },
    {
      number: '03',
      title: '03 — Klip Siap Dibagikan',
      description:
        'Pratinjau klip vertikal 9:16 dengan subtitle otomatis. Anda dapat melakukan penyelarasan halus waktu (nudge ±0.5 detik), mengoreksi kata subtitle, lalu mengunduh video MP4 ter-render atau file subtitle SRT terpisah.',
      icon: Download,
      highlights: ['Editor Penyelarasan Waktu Halus ±0.5s', 'Unduh Video MP4 9:16 Siap Upload', 'Ekspor File Subtitle SRT Terpisah'],
      renderVisual: () => (
        <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-[#DEDAD2] bg-[#242321] p-3 text-white flex flex-col justify-between shadow-xs">
          {/* Header */}
          <div className="flex items-center justify-between text-[11px] border-b border-white/10 pb-1.5">
            <span className="font-semibold text-white flex items-center gap-1">
              Klip 01 • Durasi 42s
            </span>
            <span className="bg-[#3F7D55] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
              Siap Unduh
            </span>
          </div>

          {/* Subtitle preview bar */}
          <div className="my-auto bg-black/60 backdrop-blur-xs border border-white/15 rounded-lg p-2 text-center">
            <p className="text-[11px] font-bold text-white leading-snug">
              "Ini adalah bagian paling fundamental dalam arsitektur sistem."
            </p>
          </div>

          {/* Action buttons mockup */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="bg-[#C65D3A] text-white rounded-md py-1.5 px-2 text-[10px] font-semibold flex items-center justify-center gap-1 shadow-xs">
              <Download className="h-3 w-3" /> Unduh MP4 9:16
            </div>
            <div className="bg-white/15 hover:bg-white/25 text-white rounded-md py-1.5 px-2 text-[10px] font-medium flex items-center justify-center gap-1 border border-white/15">
              <FileText className="h-3 w-3" /> Unduh SRT
            </div>
          </div>
        </div>
      ),
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.12,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  return (
    <section id="how-it-works" className="py-20 md:py-28 border-t border-[#DEDAD2] bg-[#FCFBF8] relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold text-[#C65D3A] uppercase tracking-wider font-mono">
            Workflow Sederhana
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-[#242321] font-display">
            3 Langkah Otomatis Dari Webinar ke Klip Vertikal
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#6F6B63] leading-relaxed">
            Tidak perlu memotong video secara manual di timeline software yang rumit. Cuplik mengotomasi kurasi berdasarkan substansi pedagogis materi.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                variants={itemVariants}
                className="relative rounded-2xl border border-[#DEDAD2] bg-white p-6 flex flex-col justify-between hover:border-[#969189] transition-all shadow-sm shadow-stone-900/5"
              >
                <div>
                  {/* Step Visual Illustration Mockup */}
                  <div className="mb-5">
                    {step.renderVisual()}
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F2DED5] text-[#C65D3A]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-xs font-bold text-[#969189] bg-[#F7F5F0] px-2.5 py-1 rounded-md border border-[#DEDAD2]">
                      Langkah {step.number}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#242321] font-display mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#6F6B63] leading-relaxed mb-6">
                    {step.description}
                  </p>
                </div>

                <ul className="pt-4 border-t border-[#DEDAD2] space-y-2">
                  {step.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-[#242321]">
                      <Check className="h-3.5 w-3.5 text-[#3F7D55] shrink-0" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
