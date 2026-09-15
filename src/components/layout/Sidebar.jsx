import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UploadCloud,
  User,
  LogOut,
  Activity,
  ChevronRight,
  X,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../../features/auth/useAuth.js';
import { ROUTES } from '../../constants/routes.js';
import { CuplikLogo } from '../ui/CuplikLogo.jsx';

export function Sidebar({ variant = 'user', isOpen, onClose, className }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME);
  };

  const userItems = [
    { title: 'Dashboard Proyek', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
    { title: 'Unggah Video Baru', href: ROUTES.UPLOAD, icon: UploadCloud },
    { title: 'Akun Saya', href: ROUTES.ACCOUNT, icon: User },
  ];

  const adminItems = [
    { title: 'Telemetri & Akses', href: ROUTES.ADMIN, icon: Activity },
    { title: 'Mode Pengguna', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  ];

  const items = variant === 'admin' ? adminItems : userItems;

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-4">
      {/* Brand header */}
      <div>
        <div className="flex items-center justify-between px-2 py-3 mb-6">
          <div className="flex items-center gap-2">
            <CuplikLogo size="sm" to={ROUTES.HOME} />
            {variant === 'admin' && (
              <span className="text-[10px] font-bold bg-[#A86F24]/10 text-[#A86F24] border border-[#A86F24]/30 px-1.5 py-0.5 rounded uppercase">
                Admin
              </span>
            )}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-1.5 rounded-lg text-[#6F6B63] hover:text-[#242321] hover:bg-[#F7F5F0]"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation items */}
        <nav className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) =>
                  clsx(
                    'group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all select-none',
                    isActive
                      ? 'bg-[#F2DED5] text-[#C65D3A] font-semibold border border-[#C65D3A]/20'
                      : 'text-[#6F6B63] hover:bg-[#F7F5F0] hover:text-[#242321] border border-transparent'
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User profile & logout footer */}
      <div className="pt-4 border-t border-[#DEDAD2] space-y-3">
        <div className="px-3 py-2 rounded-xl bg-[#F7F5F0] border border-[#DEDAD2] flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFFFFF] text-[#C65D3A] font-semibold text-xs border border-[#DEDAD2]">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-[#242321] truncate">
              {user?.email || 'Pengguna'}
            </p>
            <p className="text-[10px] text-[#6F6B63] uppercase font-mono">
              {user?.role === 'admin' ? 'Administrator' : 'Pengguna Standar'}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#6F6B63] hover:bg-[#B54A43]/10 hover:text-[#B54A43] transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Keluar dari Akun</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={clsx(
          'hidden md:flex flex-col w-64 shrink-0 border-r border-[#DEDAD2] bg-[#FCFBF8] min-h-screen sticky top-0',
          className
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-[#242321]/40 backdrop-blur-xs"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="relative w-72 max-w-[85vw] bg-[#FCFBF8] h-full border-r border-[#DEDAD2] shadow-2xl z-10 flex flex-col">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
