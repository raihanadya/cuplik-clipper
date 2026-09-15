import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { ROUTES } from '../../constants/routes.js';

export function CtaBanner() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden bg-[#FCFBF8]">
      {/* Subtle warm ambient backdrop glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-[500px] h-[300px] bg-gradient-to-r from-[#F2DED5]/50 via-[#F7F5F0]/30 to-[#F2DED5]/40 blur-3xl rounded-full" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        <div className="rounded-3xl border border-[#DEDAD2] bg-white p-8 sm:p-14 text-center shadow-lg shadow-stone-900/5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#DEDAD2] bg-[#F7F5F0] text-[#C65D3A] text-xs font-semibold mb-6 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Siap Otomasi Konten Edukasi Anda?</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#242321] font-display max-w-2xl mx-auto leading-tight">
            Mulai Konversi Rekaman Webinar ke Klip Vertikal Hari Ini
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[#6F6B63] max-w-xl mx-auto leading-relaxed">
            Daftar akun gratis, unggah file rekaman materi Anda, dan biarkan pipeline Cuplik menyeleksi sorotan edukatif berkonsep utuh.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={ROUTES.REGISTER}>
              <Button size="lg" variant="primary" magnetic className="gap-2 text-base px-8 py-5.5 shadow-md shadow-[#C65D3A]/20 font-semibold">
                Mulai Cuplik Sekarang <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to={ROUTES.LOGIN}>
              <Button size="lg" variant="secondary" className="text-base px-8 py-5.5 font-medium">
                Sudah Punya Akun? Masuk
              </Button>
            </Link>
          </div>

          <div className="mt-10 pt-8 border-t border-[#DEDAD2] flex flex-wrap items-center justify-center gap-6 text-xs text-[#6F6B63] font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#3F7D55]" />
              Retensi 24 Jam Aman
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-[#C65D3A]" />
              Tanpa Instalasi Software Berat
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-[#A86F24]" />
              Subtitle Bahasa Indonesia Terintegrasi
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CtaBanner;
