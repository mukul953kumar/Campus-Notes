import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#faf8ff] text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 md:pb-8">
        {children || <Outlet />}
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
