import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Shield, Zap, Layers } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { HeroProductMockup } from './HeroProductMockup.jsx';
import { ScreenshotScrollReveal } from './ScreenshotScrollReveal.jsx';
import { ROUTES } from '../../constants/routes.js';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js';

export function HeroSection() {
  const prefersReducedMotion = usePrefersReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.1,
        delayChildren: prefersReducedMotion ? 0 : 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  return (
    <section className="relative overflow-hidden pt-10 pb-18 md:pt-16 md:pb-24 bg-[#F7F5F0]">
      {/* Subtle warm ambient lighting */}
      <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-gradient-to-b from-[#F2DED5]/60 via-[#F7F5F0]/20 to-transparent blur-3xl rounded-full" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Editorial Stagger Hero Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-5"
        >
          {/* Eyebrow badge */}
          <motion.div variants={itemVariants}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#DEDAD2] bg-[#FCFBF8] text-[#C65D3A] text-xs font-semibold shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-[#C65D3A]" />
              <span>Otomasi Klip Video Edukasi & Pelatihan</span>
            </div>
          </motion.div>

          {/* Masked Editorial Headline */}
          <motion.div variants={itemVariants} className="overflow-hidden">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#242321] font-display leading-[1.12]">
              Ubah Video Webinar Menjadi Klip Vertikal Utuh
            </h1>
          </motion.div>

          {/* Supporting Copy */}
          <motion.div variants={itemVariants}>
            <p className="text-base sm:text-lg text-[#6F6B63] leading-relaxed font-normal max-w-2xl">
              Konversi rekaman pelatihan horizontal 16:9 menjadi klip vertikal 9:16 berprinsip <strong className="text-[#242321] font-semibold">Concept Completeness</strong>—tanpa potongan kalimat terputus di tengah jalan, ditenagai ASR Bahasa Indonesia otomatis.
            </p>
          </motion.div>

          {/* Primary CTA with Magnetic Button */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link to={ROUTES.REGISTER}>
              <Button size="lg" variant="primary" magnetic className="gap-2.5 shadow-md shadow-[#C65D3A]/20 text-base font-semibold">
                Mulai Cuplik Sekarang <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button size="lg" variant="secondary" className="text-base font-medium">
                Lihat Cara Kerja
              </Button>
            </a>
          </motion.div>

          {/* Supporting Trust & Architecture Points */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-6 pt-3 text-xs text-[#6F6B63]"
          >
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-[#3F7D55]" />
              <span>Retensi Media 24 Jam</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-[#C65D3A]" />
              <span>3 Template Deterministik</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-[#A86F24]" />
              <span>Transkripsi ASR Bahasa Indonesia</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Hero Product Demonstration with Screenshot Scroll Reveal */}
        <div className="mt-12 sm:mt-16">
          <ScreenshotScrollReveal>
            <HeroProductMockup />
          </ScreenshotScrollReveal>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
