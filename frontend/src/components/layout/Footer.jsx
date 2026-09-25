import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileText, Heart } from 'lucide-react';
import BrandLogo from '../common/BrandLogo';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-24 md:pb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <BrandLogo size="md" />
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              Curated, peer-reviewed academic resource repository built specifically for students of Kamla Nehru Institute of Technology (KNIT), Sultanpur.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 w-fit">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Verified Syllabus & Notes</span>
            </div>
          </div>

          {/* Quick Academic Links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
              Academic Library
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link to="/resources" className="hover:text-blue-700 transition-colors">
                  All Resources
                </Link>
              </li>
              <li>
                <Link to="/resources?type=pyq" className="hover:text-blue-700 transition-colors">
                  Previous Year Papers (PYQ)
                </Link>
              </li>
              <li>
                <Link to="/subjects" className="hover:text-blue-700 transition-colors">
                  Subject Catalog
                </Link>
              </li>
              <li>
                <Link to="/upload" className="hover:text-blue-700 transition-colors">
                  Upload Notes
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Community */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
              Community & Guidelines
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link to="/guidelines" className="hover:text-blue-700 transition-colors">
                  Upload Guidelines
                </Link>
              </li>
              <li>
                <Link to="/saved" className="hover:text-blue-700 transition-colors">
                  Saved Bookmarks
                </Link>
              </li>
              <li>
                <span className="text-slate-400 text-xs">
                  Login restricted to verified student accounts
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright row */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {currentYear} CampusNotes. Designed for KNIT Sultanpur students.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Built with care for academic excellence</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
