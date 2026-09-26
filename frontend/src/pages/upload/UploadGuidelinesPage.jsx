import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Upload,
  FileText,
  RotateCw,
  Sun,
  ShieldCheck,
  Check,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Clock,
  Layers
} from 'lucide-react';

export default function UploadGuidelinesPage() {
  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>KNIT Sultanpur Academic Standards</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Study Material Upload Guidelines
        </h1>
        <p className="text-xs sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Help your fellow KNITians excel by following these verification standards. High-quality submissions get approved quickly and earn top contributor honor.
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <Link to="/upload">
            <Button variant="primary" size="md" icon={Upload}>
              Upload Study Material
            </Button>
          </Link>
          <Link to="/my-uploads">
            <Button variant="outline" size="md">
              View My Uploads
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Core Standards Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1: Readability */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">1. Lighting & Text Clarity</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Notebook scans must be clear, well-lit, and high-contrast. Avoid shadows, flash glare over ink, or blurry motion captures.
            </p>
          </div>
          <ul className="text-xs text-slate-600 space-y-1.5 pt-1 border-t border-slate-100">
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Capture in even daylight or under a desk lamp</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Ensure ink handwriting is dark enough to read</span>
            </li>
          </ul>
        </div>

        {/* Card 2: Orientation */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
            <RotateCw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">2. Page Orientation & Order</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Every page must be right-side up (portrait mode). If photos are rotated sideways, use the 90° rotation button on each page before submitting.
            </p>
          </div>
          <ul className="text-xs text-slate-600 space-y-1.5 pt-1 border-t border-slate-100">
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Rotate upside-down pages upright</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Arrange pages chronologically (Page 1, 2, 3...)</span>
            </li>
          </ul>
        </div>

        {/* Card 3: Tagging */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">3. Correct Subject & Unit Tagging</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Tagging the exact Branch, Semester, and Subject Code ensures your notes appear in relevant search results and semester portals.
            </p>
          </div>
          <ul className="text-xs text-slate-600 space-y-1.5 pt-1 border-t border-slate-100">
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Select specific Unit (1–5) or Full Syllabus</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>PYQs must include exam year (e.g. 2024) and term</span>
            </li>
          </ul>
        </div>

        {/* Card 4: Originality */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">4. Academic Authenticity</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Upload genuine lecture notes, lab manuals, and previous year papers. Do not submit duplicate materials or copyrighted textbooks.
            </p>
          </div>
          <ul className="text-xs text-slate-600 space-y-1.5 pt-1 border-t border-slate-100">
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>No duplicate uploads already in the library</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Free of non-academic doodles or watermarks</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Do's & Don'ts Comparison Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
          <span>Do's and Don'ts Checklist</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Do's */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-3">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Recommended Practices (Do's)</span>
            </div>
            <ul className="space-y-2 text-xs text-emerald-950">
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-700">✓</span>
                <span>Use clear, descriptive titles like <em>"Unit 3: Normalization & SQL Queries Notes"</em></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-700">✓</span>
                <span>Check page order so mathematical proofs or derivations stay sequential</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-700">✓</span>
                <span>Select the exact subject code from the dropdown (e.g. BCS-501 DBMS)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-700">✓</span>
                <span>Compile all pages of an assignment or unit into one complete PDF</span>
              </li>
            </ul>
          </div>

          {/* Don'ts */}
          <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200/80 space-y-3">
            <div className="flex items-center gap-2 text-rose-900 font-bold text-xs uppercase tracking-wider">
              <XCircle className="w-4 h-4 text-rose-700" />
              <span>Reasons for Rejection (Don'ts)</span>
            </div>
            <ul className="space-y-2 text-xs text-rose-950">
              <li className="flex items-start gap-2">
                <span className="font-bold text-rose-700">✕</span>
                <span>Uploading blurry, unfocused photos where handwriting is illegible</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-rose-700">✕</span>
                <span>Uploading pages sideways or upside down without rotating them upright</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-rose-700">✕</span>
                <span>Tagging to the wrong branch or semester (e.g. tagging IT notes as ME)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-rose-700">✕</span>
                <span>Uploading duplicate files already verified and available in the library</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Moderation & Feedback Re-upload Loop Explainer */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              What Happens After You Upload?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Understanding the peer verification and revision process
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center">
              1
            </span>
            <h4 className="font-bold text-slate-900">Peer & Admin Review</h4>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Submissions enter the verification queue where moderators inspect page clarity, orientation, and syllabus relevance.
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center">
              2
            </span>
            <h4 className="font-bold text-slate-900">Approval & Publication</h4>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Compliant notes are instantly verified, published live in the campus library, and earn you contributor honor points.
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-rose-50 text-rose-700 font-bold text-xs flex items-center justify-center">
              3
            </span>
            <h4 className="font-bold text-slate-900">Feedback & Easy Re-upload</h4>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              If revisions are needed, the admin sends you a specific feedback note. A revision alert appears on your dashboard with a 1-click "Fix & Re-upload" button.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action Footer */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          Ready to Share Your Notes with KNIT?
        </h2>
        <p className="text-xs sm:text-sm text-blue-100 max-w-lg mx-auto leading-relaxed">
          Every note you share helps batchmates and juniors clear backlogs and ace sessional & university examinations.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link to="/upload">
            <Button variant="secondary" size="md" icon={Upload} className="bg-white text-blue-900 hover:bg-slate-100 font-bold">
              Upload Now
            </Button>
          </Link>
          <Link to="/resources">
            <Button variant="outline" size="md" className="text-white border-white/40 hover:bg-white/10 font-medium">
              Explore Library
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
