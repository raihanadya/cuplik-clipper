import React from 'react';
import { Outlet } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { ROUTES } from '../constants/routes.js';
import { useAuth } from '../features/auth/useAuth.js';
import { CuplikLogo } from '../components/ui/CuplikLogo.jsx';

export function AuthLayout() {
  const { flashMessage, clearFlashMessage } = useAuth();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#F7F5F0] p-4 sm:p-6 text-[#242321] relative">
      {/* Brand Header */}
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-3">
          <CuplikLogo size="lg" to={ROUTES.HOME} />
        </div>
        <p className="text-xs text-[#6F6B63]">
          Otomasi klip vertikal untuk konten pelatihan & edukasi Indonesia
        </p>
      </div>

      {/* Flash Notice */}
      {flashMessage && (
        <div className="mb-6 w-full max-w-md p-3.5 rounded-xl border border-[#A86F24]/30 bg-[#FFFFFF] text-[#A86F24] text-xs flex items-center justify-between shadow-xs">
          <span>{flashMessage}</span>
          <button
            onClick={clearFlashMessage}
            className="text-[#A86F24] font-bold ml-2 underline hover:text-[#C65D3A]"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Auth Card Container */}
      <div className="w-full max-w-md">
        <Outlet />
      </div>

      {/* Footer info */}
      <div className="mt-8 text-center text-xs text-[#6F6B63] flex items-center gap-2">
        <ShieldCheck className="h-3.5 w-3.5 text-[#3F7D55]" />
        <span>Koneksi aman terenkripsi & kepatuhan retensi 24 jam</span>
      </div>
    </div>
  );
}

export default AuthLayout;
