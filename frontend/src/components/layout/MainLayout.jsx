import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';
import PwaInstallPrompt from '../common/PwaInstallPrompt';

export default function MainLayout({ children }) {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8ff] text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-8 pb-24 md:pb-8">
        {children || <Outlet />}
      </main>
      {isHomePage && <Footer />}
      <MobileBottomNav />
      <PwaInstallPrompt />
    </div>
  );
}
