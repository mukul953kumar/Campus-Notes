import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  BookOpen,
  HelpCircle,
  Upload,
  User,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function MobileBottomNav() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const currentPath = location.pathname;

  const isActive = (path) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-lg border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom,0px)]">
      <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto px-2">
        
        {/* 1. Home Tab */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center h-full gap-1 transition-all active:scale-95 cursor-pointer ${
            isActive('/') && currentPath === '/'
              ? 'text-blue-700 font-bold'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <div className="relative">
            <Home className={`w-5 h-5 ${isActive('/') && currentPath === '/' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            {isActive('/') && currentPath === '/' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-700"></span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Home</span>
        </Link>

        {/* 2. Browse Library Tab */}
        <Link
          to="/resources"
          className={`flex flex-col items-center justify-center h-full gap-1 transition-all active:scale-95 cursor-pointer ${
            isActive('/resources')
              ? 'text-blue-700 font-bold'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <div className="relative">
            <BookOpen className={`w-5 h-5 ${isActive('/resources') ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            {isActive('/resources') && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-700"></span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Library</span>
        </Link>

        {/* 3. Center Elevated Upload Action Button */}
        <div className="flex items-center justify-center -mt-5">
          <Link
            to="/upload"
            className="flex flex-col items-center justify-center group active:scale-90 transition-transform cursor-pointer"
            aria-label="Upload Academic Note"
          >
            <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-700/35 border-4 border-white">
              <Plus className="w-6 h-6 stroke-[2.5px] group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[10px] font-bold text-blue-700 mt-0.5">Upload</span>
          </Link>
        </div>

        {/* 4. PYQ Papers Tab */}
        <Link
          to="/pyqs"
          className={`flex flex-col items-center justify-center h-full gap-1 transition-all active:scale-95 cursor-pointer ${
            isActive('/pyqs')
              ? 'text-purple-700 font-bold'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <div className="relative">
            <HelpCircle className={`w-5 h-5 ${isActive('/pyqs') ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            {isActive('/pyqs') && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-purple-700"></span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">PYQs</span>
        </Link>

        {/* 5. Profile / Account Tab */}
        <Link
          to={isAuthenticated ? '/profile' : '/login'}
          className={`flex flex-col items-center justify-center h-full gap-1 transition-all active:scale-95 cursor-pointer ${
            isActive('/profile') || isActive('/login')
              ? 'text-blue-700 font-bold'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <div className="relative">
            {isAuthenticated && user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-5 h-5 rounded-full object-cover border border-slate-300"
              />
            ) : (
              <User className={`w-5 h-5 ${isActive('/profile') || isActive('/login') ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            )}
            {(isActive('/profile') || isActive('/login')) && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-700"></span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">
            {isAuthenticated ? 'Profile' : 'Sign In'}
          </span>
        </Link>

      </div>
    </div>
  );
}
