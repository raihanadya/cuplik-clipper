import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock } from 'lucide-react';
import { ROUTES } from '../../constants/routes.js';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#DEDAD2] bg-[#F7F5F0] text-[#6F6B63] text-sm">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand section */}
          <div className="md:col-span-2 space-y-3">
            <Link to={ROUTES.HOME} className="flex items-center gap-2">
              <img
                src="/cuplik-logo.png"
                alt="Cuplik Logo"
                className="h-8 w-auto max-w-[120px] object-contain"
              />
            </Link>
            <p className="text-xs text-[#6F6B63] max-w-md leading-relaxed">
              Platform otomasi klip video edukasi & webinar ke format vertikal 9:16 dengan transkripsi ASR Bahasa Indonesia berakurasi tinggi dan seleksi materi berprinsip Concept Completeness.
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-[#6F6B63]">
              <Shield className="h-3.5 w-3.5 text-[#3F7D55]" />
              <span>Privasi Terjamin: File media otomatis dibersihkan permanen dalam 24 jam.</span>
            </div>
          </div>

          {/* Navigation links */}
          <div>
            <h4 className="text-xs font-semibold text-[#242321] uppercase tracking-wider mb-3 font-mono">
              Navigasi
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="/#how-it-works" className="text-[#6F6B63] hover:text-[#242321] transition-colors">
                  Cara Kerja
                </a>
              </li>
              <li>
                <a href="/#features" className="text-[#6F6B63] hover:text-[#242321] transition-colors">
                  Fitur Utama
                </a>
              </li>
              <li>
                <a href="/#templates" className="text-[#6F6B63] hover:text-[#242321] transition-colors">
                  Template Layout
                </a>
              </li>
              <li>
                <a href="/#faq" className="text-[#6F6B63] hover:text-[#242321] transition-colors">
                  Pertanyaan Umum (FAQ)
                </a>
              </li>
            </ul>
          </div>

          {/* System & Auth links */}
          <div>
            <h4 className="text-xs font-semibold text-[#242321] uppercase tracking-wider mb-3 font-mono">
              Akses
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to={ROUTES.LOGIN} className="text-[#6F6B63] hover:text-[#242321] transition-colors">
                  Masuk Pengguna
                </Link>
              </li>
              <li>
                <Link to={ROUTES.REGISTER} className="text-[#6F6B63] hover:text-[#242321] transition-colors">
                  Daftar Akun Baru
                </Link>
              </li>
              <li>
                <Link to={ROUTES.ADMIN_LOGIN} className="text-[#6F6B63] hover:text-[#242321] transition-colors flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Masuk Administrator
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#DEDAD2] flex flex-col sm:flex-row items-center justify-between text-xs text-[#969189] gap-4">
          <p>© {currentYear} Cuplik. Hak cipta dilindungi undang-undang.</p>
          <p className="text-[11px]">Dirancang untuk pemateri mandiri, instruktur, dan lembaga pelatihan Indonesia.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
