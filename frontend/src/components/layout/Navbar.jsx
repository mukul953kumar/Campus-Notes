import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Upload,
  Bookmark,
  User,
  Menu,
  X,
  GraduationCap
} from 'lucide-react';
import Button from '../common/Button';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Browse Library', path: '/resources' },
    { name: 'PYQ Papers', path: '/resources?type=pyq' },
    { name: 'Subjects', path: '/subjects' },
  ];

  const isActive = (path) => {
    if (path.includes('?')) {
      return location.pathname + location.search === path;
    }
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-lg bg-blue-700 flex items-center justify-center text-white shadow-xs group-hover:bg-blue-800 transition-colors">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 text-lg leading-tight tracking-tight">
                Campus<span className="text-blue-700">Notes</span>
              </span>
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                KNIT Sultanpur
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  isActive(link.path)
                    ? 'text-blue-700 bg-blue-50/80 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Quick Search Shortcut & Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/resources"
              className="flex items-center gap-2 text-xs text-slate-400 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 px-3 py-1.5 rounded-lg transition-colors cursor-pointer w-44 lg:w-56"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">Search notes, codes...</span>
              <kbd className="ml-auto font-mono text-[10px] bg-white text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">
                /
              </kbd>
            </Link>

            <Link to="/saved" title="Saved Resources" className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
              <Bookmark className="w-4 h-4" />
            </Link>

            <Link to="/upload">
              <Button size="sm" icon={Upload} variant="outline" className="hidden lg:inline-flex">
                Upload Note
              </Button>
            </Link>

            <Link to="/login">
              <Button size="sm" icon={User} variant="primary">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link to="/upload" className="sm:hidden">
              <Button size="sm" icon={Upload} variant="outline">
                Upload
              </Button>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
          <Link
            to="/resources"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 w-full text-xs text-slate-500 bg-slate-100 p-2.5 rounded-lg mb-2"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span>Search notes, subjects, PYQs...</span>
          </Link>

          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 text-sm font-medium rounded-md ${
                isActive(link.path)
                  ? 'text-blue-700 bg-blue-50 font-semibold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {link.name}
            </Link>
          ))}

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <Link
              to="/saved"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md"
            >
              <Bookmark className="w-4 h-4 text-slate-500" />
              Saved Resources
            </Link>
            <Link
              to="/upload"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md"
            >
              <Upload className="w-4 h-4 text-slate-500" />
              Upload PDF Resource
            </Link>
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-1"
            >
              <Button size="md" variant="primary" className="w-full">
                Sign In with College Email
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
