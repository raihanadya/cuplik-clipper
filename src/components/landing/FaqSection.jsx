import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js';

const FAQ_ITEMS = [
  {
    id: 'faq-1',
    question: 'Video apa saja yang cocok untuk diproses di Cuplik?',
    answer:
      'Cuplik dioptimalkan untuk rekaman webinar, sesi pelatihan edukasi, kelas online (Zoom atau Google Meet), workshop teknis, dan kuliah daring yang memiliki materi presentasi (slide) dan/atau pembicara. Format yang didukung adalah MP4 dan MOV dengan ukuran maksimal 1 GB serta resolusi 720p atau lebih tinggi.',
  },
  {
    id: 'faq-2',
    question: 'Bagaimana cara kerja seleksi klip "Concept Completeness"?',
    answer:
      'Berbeda dari pemotong video biasa yang memotong acak berdasarkan deteksi jeda volume audio, pipeline Cuplik menganalisis transkripsi ASR Bahasa Indonesia untuk mendeteksi batas penalaran konsep yang utuh. Setiap klip (durasi 25–75 detik) dipilih agar memiliki pengantar argumen dan kesimpulan yang tuntas tanpa kalimat terputus di tengah jalan.',
  },
  {
    id: 'faq-3',
    question: 'Apakah video webinar saya disimpan secara permanen di server?',
    answer:
      'Tidak. Cuplik menerapkan kebijakan privasi zero-retention 24 jam yang ketat. Seluruh file video mentah yang diunggah dan klip hasil render akan dihapus secara otomatis dan permanen dari penyimpanan server setelah 24 jam demi melindungi hak cipta serta kerahasiaan materi pelatihan Anda.',
  },
  {
    id: 'faq-4',
    question: 'Apa perbedaan antara ketiga pilihan template layout?',
    answer:
      'Cuplik menyediakan tiga template deterministik tanpa risiko wajah tertutup: Slide + Pembicara (area atas ~60% untuk slide materi dan area tengah ~30% untuk webcam pemateri), Talking Head (fokus vertikal 9:16 pada pembicara/kreator), dan Slide Saja (tampilan layar materi letterbox 16:9 dengan strip subtitle).',
  },
  {
    id: 'faq-5',
    question: 'Apakah saya bisa mengoreksi teks subtitle atau durasi klip?',
    answer:
      'Tentu saja. Setelah proses kurasi selesai, Anda dapat meninjau setiap klip di editor interaktif Cuplik. Tersedia tombol penyelarasan waktu halus (nudge ±0.5 detik) untuk menyempurnakan titik potong awal/akhir, serta editor teks untuk menyunting kata-kata subtitle secara langsung sebelum render ulang.',
  },
  {
    id: 'faq-6',
    question: 'Format apa saja yang dapat saya unduh?',
    answer:
      'Anda dapat mengunduh video MP4 rasio 9:16 vertikal beresolusi jernih yang siap diunggah langsung ke platform TikTok, Instagram Reels, dan YouTube Shorts. Selain itu, Anda juga dapat mengunduh file transkripsi subtitle berformat SRT terpisah untuk arsip atau keperluan lainnya.',
  },
];

export function FaqSection() {
  const [openId, setOpenId] = useState(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const toggleItem = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="py-20 md:py-28 border-t border-[#DEDAD2] bg-[#F7F5F0]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#DEDAD2] bg-[#FCFBF8] text-[#C65D3A] text-xs font-semibold mb-3 font-mono shadow-xs">
            <HelpCircle className="h-3.5 w-3.5" /> Pertanyaan Umum
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#242321] font-display">
            Hal yang Sering Ditanyakan
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#6F6B63] leading-relaxed">
            Informasi lengkap seputar alur kerja, keamanan data, dan kapabilitas teknologi Cuplik.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className={clsx(
                  'rounded-2xl border transition-all duration-200 overflow-hidden',
                  isOpen
                    ? 'border-[#C65D3A]/40 bg-white shadow-sm'
                    : 'border-[#DEDAD2] bg-[#FCFBF8] hover:border-[#969189] hover:bg-white'
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className="w-full px-5 sm:px-6 py-4.5 sm:py-5 flex items-center justify-between text-left gap-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3A]"
                  aria-expanded={isOpen}
                  aria-controls={`answer-${item.id}`}
                >
                  <span className="text-base font-semibold text-[#242321] leading-snug">
                    {item.question}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                    className={clsx(
                      'shrink-0 p-1.5 rounded-full border transition-colors',
                      isOpen
                        ? 'bg-[#F2DED5] border-[#C65D3A]/30 text-[#C65D3A]'
                        : 'bg-[#F7F5F0] border-[#DEDAD2] text-[#6F6B63]'
                    )}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`answer-${item.id}`}
                      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                      animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, height: 'auto' }}
                      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 sm:px-6 pb-5 pt-1 border-t border-[#DEDAD2]/50 text-sm text-[#6F6B63] leading-relaxed">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FaqSection;
