import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar.jsx';
import { Footer } from '../components/layout/Footer.jsx';

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5F0] text-[#242321] selection:bg-[#F2DED5] selection:text-[#C65D3A]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default PublicLayout;
