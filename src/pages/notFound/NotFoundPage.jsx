import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { ROUTES } from '../../constants/routes.js';

export function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 mb-6">
        <Sparkles className="h-8 w-8" />
      </div>

      <span className="font-mono text-xs font-bold text-indigo-400 tracking-wider uppercase mb-2">
        Galat 404
      </span>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
        Halaman Tidak Ditemukan
      </h1>

      <p className="mt-3 text-sm text-slate-400 max-w-md leading-relaxed">
        Halaman yang Anda cari mungkin telah dipindahkan, dihapus, atau tautan yang Anda masukkan salah.
      </p>

      <div className="mt-8 flex items-center gap-3">
        <Link to={ROUTES.HOME}>
          <Button variant="primary" className="gap-2">
            <Home className="h-4 w-4" /> Ke Halaman Beranda
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
