import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar.jsx';
import { Topbar } from '../components/layout/Topbar.jsx';
import { ROUTES } from '../constants/routes.js';

export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (pathname) => {
    if (pathname.includes('/upload')) return 'Unggah Video Baru';
    if (pathname.includes('/clips') && pathname.includes('/edit')) return 'Editor Klip Video';
    if (pathname.includes('/clips')) return 'Hasil Kurasi Klip';
    if (pathname.includes('/session/')) return 'Status Pemrosesan';
    if (pathname.includes('/account')) return 'Pengaturan Akun';
    return 'Dashboard Proyek';
  };

  return (
    <div className="min-h-screen flex bg-[#F7F5F0] text-[#242321] selection:bg-[#F2DED5] selection:text-[#C65D3A]">
      <Sidebar
        variant="user"
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          title={getPageTitle(location.pathname)}
          onOpenSidebar={() => setIsSidebarOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
