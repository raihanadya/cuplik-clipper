import React from 'react';
import { Menu, UploadCloud, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button.jsx';
import { useAuth } from '../../features/auth/useAuth.js';
import { ROUTES } from '../../constants/routes.js';

export function Topbar({ onOpenSidebar, title = 'Workspace' }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#DEDAD2] bg-[#FCFBF8]/90 px-4 sm:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="md:hidden p-2 rounded-xl text-[#6F6B63] hover:text-[#242321] hover:bg-[#F7F5F0]"
          aria-label="Buka menu sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-base sm:text-lg font-bold text-[#242321] font-display">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {user?.role === 'admin' ? (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A86F24]/10 border border-[#A86F24]/30 text-[#A86F24] text-xs font-semibold">
            <Shield className="h-3.5 w-3.5" />
            <span>Admin Console</span>
          </div>
        ) : (
          <Link to={ROUTES.UPLOAD}>
            <Button size="sm" variant="primary" className="hidden sm:inline-flex gap-1.5 shadow-xs">
              <UploadCloud className="h-4 w-4" />
              <span>Unggah Video</span>
            </Button>
          </Link>
        )}

        <div className="flex items-center gap-2 pl-2 border-l border-[#DEDAD2] text-xs text-[#6F6B63]">
          <span className="hidden sm:inline font-medium text-[#242321] truncate max-w-[140px]">
            {user?.email}
          </span>
          <div className="h-8 w-8 rounded-full bg-[#F2DED5] border border-[#C65D3A]/20 flex items-center justify-center text-xs font-bold text-[#C65D3A]">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
