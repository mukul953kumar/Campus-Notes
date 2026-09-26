import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfilePage from './pages/profile/ProfilePage';
import UploadResourcePage from './pages/upload/UploadResourcePage';
import ResourceLibraryPage from './pages/resources/ResourceLibraryPage';
import ResourceDetailsPage from './pages/resources/ResourceDetailsPage';
import SavedResourcesPage from './pages/student/SavedResourcesPage';
import MyUploadsPage from './pages/student/MyUploadsPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import PYQPage from './pages/pyq/PYQPage';
import SubjectsPage from './pages/subjects/SubjectsPage';
import SubjectDetailsPage from './pages/subjects/SubjectDetailsPage';
import LeaderboardPage from './pages/leaderboard/LeaderboardPage';
import AcademicSetupPage from './pages/auth/AcademicSetupPage';
import Button from './components/common/Button';
import Badge from './components/common/Badge';
import EmptyState from './components/common/EmptyState';
import {
  Search,
  BookOpen,
  FileText,
  Upload,
  Download,
  Sparkles,
  ArrowRight,
  Layers,
  CheckCircle2,
  Trophy,
  Award,
  Star,
  Eye,
  GraduationCap,
  Bookmark,
  HelpCircle
} from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { resourceService, userService } from './services/api';
import ResourceRow from './components/resources/ResourceRow';
import ResourceCard from './components/resources/ResourceCard';

const BRANCH_SHORT_CODES = {
  'Information Technology': 'IT',
  'Computer Science & Engineering': 'CSE',
  'Computer Science and Engineering': 'CSE',
  'Electronics Engineering': 'ECE',
  'Electrical Engineering': 'EE',
  'Mechanical Engineering': 'ME',
  'Civil Engineering': 'CE',
  'Master of Computer Applications': 'MCA',
};

function getShortBranch(branch) {
  if (!branch) return '';
  return BRANCH_SHORT_CODES[branch] || branch;
}

function HomePage() {
  const navigate = useNavigate();
  const { user, savedIds, toggleBookmark } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentUploads, setRecentUploads] = useState([]);
  const [recommendedUploads, setRecommendedUploads] = useState([]);
  const [topContributors, setTopContributors] = useState([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);
  const [isLoadingRecommended, setIsLoadingRecommended] = useState(false);
  const [isLoadingContributors, setIsLoadingContributors] = useState(true);

  const branches = [
    { code: 'CSE', name: 'Computer Science & Engineering', count: '1st - 8th Sem' },
    { code: 'IT', name: 'Information Technology', count: '1st - 8th Sem' },
    { code: 'ECE', name: 'Electronics Engineering', count: '1st - 8th Sem' },
    { code: 'EE', name: 'Electrical Engineering', count: '1st - 8th Sem' },
    { code: 'ME', name: 'Mechanical Engineering', count: '1st - 8th Sem' },
    { code: 'CE', name: 'Civil Engineering', count: '1st - 8th Sem' },
    { code: 'MCA', name: 'Master of Computer Applications', count: '1st - 4th Sem' },
  ];

  // Load live campus recent uploads (Top 4)
  useEffect(() => {
    async function loadRecent() {
      setIsLoadingRecent(true);
      try {
        const res = await resourceService.getResources({ limit: 4, sortBy: 'recent' });
        if (res?.data) {
          setRecentUploads(res.data);
        }
      } catch (err) {
        console.error('Failed to load recent uploads:', err);
      } finally {
        setIsLoadingRecent(false);
      }
    }
    loadRecent();
  }, []);

  // Load personalized semester recommendations dynamically based on student branch & sem (Top 4)
  useEffect(() => {
    if (user?.branch && user?.semester) {
      async function loadRecommended() {
        setIsLoadingRecommended(true);
        try {
          const res = await resourceService.getResources({
            branch: user.branch,
            semester: user.semester,
            limit: 4,
            sortBy: 'popular'
          });
          if (res?.data) {
            setRecommendedUploads(res.data);
          }
        } catch (err) {
          console.error('Failed to load personalized recommendations:', err);
        } finally {
          setIsLoadingRecommended(false);
        }
      }
      loadRecommended();
    } else {
      setRecommendedUploads([]);
    }
  }, [user?.branch, user?.semester]);

  // Load top contributors leaderboard highlight (Top 4)
  useEffect(() => {
    async function loadContributors() {
      setIsLoadingContributors(true);
      try {
        const res = await userService.getLeaderboard({ limit: 4 });
        if (res?.data) {
          setTopContributors(res.data);
        }
      } catch (err) {
        console.error('Failed to load top contributors:', err);
      } finally {
        setIsLoadingContributors(false);
      }
    }
    loadContributors();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/resources?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/resources');
    }
  };

  const handleQuickSearch = (term) => {
    navigate(`/resources?q=${encodeURIComponent(term)}`);
  };

  const handleToggleSave = async (resourceId) => {
    try {
      await toggleBookmark(resourceId);
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-12">
      {/* Top Welcome / Hero Section */}
      <section className="max-w-3xl mx-auto pt-1 sm:pt-6 pb-1 sm:pb-4 text-center">
        {user ? (
          // Logged-in Personalized Mobile Header
          <div className="sm:hidden text-left mb-4 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Welcome back,</p>
                <h1 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
                  <span>{user.name?.split(' ')[0] || 'Student'}</span>
                  <span className="text-base">👋</span>
                </h1>
              </div>
              {user.branch && (
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 rounded-full">
                    {getShortBranch(user.branch)} • Sem {user.semester}
                  </span>
                  <Link to="/profile" className="text-[10px] text-slate-400 hover:text-blue-700 mt-0.5 underline">
                    Edit Profile
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Guest User Mobile Header
          <div className="sm:hidden mb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-medium mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>KNIT Academic Portal</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Academic Notes & <span className="text-blue-700">PYQs</span>
            </h1>
          </div>
        )}

        {/* Desktop Hero Headline (Shown on sm: and up) */}
        <div className="hidden sm:block">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-medium mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated for Kamla Nehru Institute of Technology</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Verified Academic Resources for <span className="text-blue-700">KNITians</span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Access high-quality lecture notes, previous year question papers (PYQs), and assignment guides shared by top-ranking students.
          </p>
        </div>

        {/* Streamlined Search Form (Single-line on mobile with integrated button) */}
        <form onSubmit={handleSearchSubmit} className="mt-3 sm:mt-8 max-w-xl mx-auto">
          <div className="flex items-center bg-white p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border border-slate-300 shadow-2xs focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <div className="relative flex-1 flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 shrink-0 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subject code (e.g. BCS-501, DBMS)..."
                className="w-full pl-9 pr-2 py-1.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-none"
              />
            </div>
            <Button
              type="submit"
              size="sm"
              variant="primary"
              className="shrink-0 px-3.5 sm:px-5 py-1.5 sm:py-2 text-xs font-semibold rounded-lg sm:rounded-xl cursor-pointer"
            >
              Search
            </Button>
          </div>

          {/* Popular Subject Chips (Horizontal scrollable on mobile) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 mt-2 text-xs text-slate-500">
            <span className="shrink-0 text-slate-400 font-medium text-[11px]">Popular:</span>
            {['DBMS', 'DAA', 'OS', 'Compiler Design', 'CN', 'Maths'].map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => handleQuickSearch(term)}
                className="shrink-0 px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 font-medium text-[11px] transition-colors cursor-pointer border border-transparent hover:border-blue-200"
              >
                {term}
              </button>
            ))}
          </div>
        </form>

        {/* Mobile Quick Action Hub (4 Essential Academic Shortcuts) */}
        <div className="grid grid-cols-4 gap-2 sm:hidden pt-3 text-left">
          <Link
            to={user?.branch && user?.semester ? `/resources?branch=${encodeURIComponent(user.branch)}&semester=${user.semester}` : '/resources'}
            className="flex flex-col items-center justify-center p-2.5 bg-white border border-slate-200/90 rounded-xl hover:border-blue-300 transition-all shadow-2xs text-center group active:scale-95"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 line-clamp-1">
              {user?.semester ? `Sem ${user.semester}` : 'Notes'}
            </span>
            <span className="text-[9px] text-slate-400">Materials</span>
          </Link>

          <Link
            to="/pyqs"
            className="flex flex-col items-center justify-center p-2.5 bg-white border border-slate-200/90 rounded-xl hover:border-purple-300 transition-all shadow-2xs text-center group active:scale-95"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <HelpCircle className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 line-clamp-1">PYQs</span>
            <span className="text-[9px] text-slate-400">Papers</span>
          </Link>

          <Link
            to={user ? '/saved' : '/login'}
            className="flex flex-col items-center justify-center p-2.5 bg-white border border-slate-200/90 rounded-xl hover:border-amber-300 transition-all shadow-2xs text-center group active:scale-95"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <Bookmark className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 line-clamp-1">Saved</span>
            <span className="text-[9px] text-slate-400">Bookmarks</span>
          </Link>

          <Link
            to="/leaderboard"
            className="flex flex-col items-center justify-center p-2.5 bg-white border border-slate-200/90 rounded-xl hover:border-emerald-300 transition-all shadow-2xs text-center group active:scale-95"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <Trophy className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 line-clamp-1">Ranks</span>
            <span className="text-[9px] text-slate-400">Top Stars</span>
          </Link>
        </div>
      </section>

      {/* Personalized Semester Recommendations (if student has branch & semester set) */}
      {user?.branch && user?.semester && (
        <section className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-4 sm:p-7 space-y-3.5 sm:space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
            <div className="space-y-0.5 sm:space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] sm:text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-200/80">
                  {getShortBranch(user.branch)} • Sem {user.semester}
                </span>
                <Link
                  to="/profile"
                  className="text-xs text-slate-500 hover:text-blue-700 font-medium underline"
                >
                  Change
                </Link>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Recommended for Your Semester Exams
              </h2>
            </div>

            <Link
              to={`/resources?branch=${encodeURIComponent(user.branch)}&semester=${user.semester}`}
              className="text-xs font-semibold text-blue-700 hover:text-blue-800 inline-flex items-center gap-1 shrink-0"
            >
              <span>Explore all Sem {user.semester} notes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoadingRecommended ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 text-center text-xs text-slate-500 shadow-xs">
              Curating your semester study materials...
            </div>
          ) : recommendedUploads.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 text-center text-xs text-slate-500 space-y-3 shadow-xs">
              <p>No verified notes uploaded for {user.branch} Semester {user.semester} yet.</p>
              <Link to="/upload">
                <Button size="sm" variant="primary" icon={Upload}>
                  Be the First to Upload for Your Class
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {/* Horizontal swipeable carousel on mobile, responsive 4-column grid on tablet/desktop */}
              <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible snap-x snap-mandatory">
                {recommendedUploads.slice(0, 4).map((item) => (
                  <div key={item._id} className="w-[285px] sm:w-auto shrink-0 snap-start">
                    <ResourceCard
                      resource={item}
                      isSaved={savedIds.includes(item._id)}
                      onToggleSave={handleToggleSave}
                    />
                  </div>
                ))}
              </div>

              <div className="pt-1 text-center">
                <Link
                  to={`/resources?branch=${encodeURIComponent(user.branch)}&semester=${user.semester}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-blue-50 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition-colors shadow-2xs"
                >
                  <span>View All Semester {user.semester} Notes ({getShortBranch(user.branch)})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Engineering Branches Catalog */}
      <section>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Explore by Branch</h2>
            <p className="text-[11px] sm:text-xs text-slate-500">Official B.Tech & MCA curriculums</p>
          </div>
          <Link
            to="/subjects"
            className="text-xs font-semibold text-blue-700 hover:text-blue-800 inline-flex items-center gap-1"
          >
            All Subjects <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
          {branches.map((b) => (
            <Link
              key={b.code}
              to={`/resources?branch=${encodeURIComponent(b.name)}`}
              className="p-3 sm:p-4 rounded-xl bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-xs transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                  {b.code}
                </span>
                <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 bg-slate-100 px-1.5 sm:px-2 py-0.5 rounded-full">
                  {b.count}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-1">{b.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Recently Verified Resources List (Top 4) */}
      <section className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Recent Materials</h2>
            <Badge variant="verified" size="sm" showIcon>
              Latest 4 Live
            </Badge>
          </div>
          <Link
            to="/resources"
            className="text-xs font-semibold text-blue-700 hover:text-blue-800 inline-flex items-center gap-1"
          >
            View Full Library <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoadingRecent ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 text-center text-xs text-slate-500 shadow-xs">
            Loading recent verified materials...
          </div>
        ) : recentUploads.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 text-center text-xs text-slate-500 shadow-xs">
            No verified materials available yet. Be the first to upload!
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {/* Horizontal swipeable carousel on mobile, responsive 4-column grid on tablet/desktop */}
            <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible snap-x snap-mandatory">
              {recentUploads.slice(0, 4).map((item) => (
                <div key={item._id} className="w-[285px] sm:w-auto shrink-0 snap-start">
                  <ResourceCard
                    resource={item}
                    isSaved={savedIds.includes(item._id)}
                    onToggleSave={handleToggleSave}
                  />
                </div>
              ))}
            </div>

            <div className="pt-1 text-center">
              <Link
                to="/resources"
                className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition-colors shadow-2xs"
              >
                <span>Explore Full Resource Library ({Math.min(recentUploads.length, 4)} shown)</span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-700" />
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Top Academic Contributors Showcase (Priority 2) */}
      <section className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Campus Champions</h2>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Honor Roll</span>
            </div>
          </div>
          <Link
            to="/leaderboard"
            className="text-xs font-semibold text-blue-700 hover:text-blue-800 inline-flex items-center gap-1"
          >
            Full Leaderboard <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoadingContributors ? (
          <div className="py-6 text-center text-xs text-slate-400">Loading top contributors...</div>
        ) : topContributors.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-500 shadow-xs">
            No contributors ranked yet. Upload notes to become the first campus champion!
          </div>
        ) : (
          <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible snap-x snap-mandatory">
            {topContributors.map((c) => {
              const isFirst = c.rank === 1;
              const isSecond = c.rank === 2;
              const isThird = c.rank === 3;

              const rankBadgeColor = isFirst
                ? 'bg-amber-100 text-amber-950 border-amber-300'
                : isSecond
                ? 'bg-slate-100 text-slate-800 border-slate-300'
                : isThird
                ? 'bg-amber-50 text-amber-900 border-amber-200'
                : 'bg-blue-50 text-blue-800 border-blue-200';

              const medal = isFirst ? '🥇 #1' : isSecond ? '🥈 #2' : isThird ? '🥉 #3' : `#${c.rank}`;

              return (
                <div
                  key={c._id}
                  className={`w-[260px] sm:w-auto shrink-0 snap-start bg-white rounded-2xl p-4 border transition-all shadow-2xs hover:shadow-xs space-y-3 ${
                    isFirst ? 'border-amber-300 ring-1 ring-amber-200/70' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden shadow-2xs">
                        {c.user?.avatar ? (
                          <img src={c.user.avatar} alt={c.user.name} className="w-full h-full object-cover" />
                        ) : (
                          c.user?.name ? c.user.name.slice(0, 2).toUpperCase() : 'ST'
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {c.user?.name || 'Contributor'}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate">
                          {c.user?.branch || 'KNIT'} {c.user?.semester ? `• Sem ${c.user.semester}` : ''}
                        </p>
                      </div>
                    </div>

                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border shrink-0 ${rankBadgeColor}`}>
                      {medal}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {c.badge}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      <strong>{c.verifiedUploads}</strong> notes • <strong>{c.totalDownloads}</strong> dl
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Call to action for Student Uploads */}
      <section className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-2xl p-5 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 shadow-sm text-center sm:text-left">
        <div className="space-y-1.5 sm:space-y-2">
          <h3 className="text-lg sm:text-xl font-bold">Have handwritten notes or PYQs?</h3>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
            Upload your academic materials to earn contributor badges and help junior batches excel in their semester exams.
          </p>
        </div>
        <Link to="/upload" className="shrink-0 w-full sm:w-auto">
          <Button
            size="md"
            variant="outline"
            icon={Upload}
            className="w-full sm:w-auto bg-white text-blue-800 hover:bg-blue-50 border-white font-semibold cursor-pointer"
          >
            Upload Material
          </Button>
        </Link>
      </section>
    </div>
  );
}

function PlaceholderPage({ title, description }) {
  return (
    <div className="py-12">
      <EmptyState
        title={title}
        description={description}
        actionLabel="Back to Home"
        onAction={() => (window.location.href = '/')}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            
            {/* Public catalog routes */}
            <Route path="resources" element={<ResourceLibraryPage />} />
            <Route
              path="resources/:id"
              element={
                <ProtectedRoute>
                  <ResourceDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route path="pyqs" element={<PYQPage />} />
            <Route path="subjects" element={<SubjectsPage />} />
            <Route path="subjects/:id" element={<SubjectDetailsPage />} />
            <Route path="leaderboard" element={<LeaderboardPage />} />

            {/* Authentication routes */}
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />

            {/* Protected Student routes */}
            <Route
              path="onboarding"
              element={
                <ProtectedRoute>
                  <AcademicSetupPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="upload"
              element={
                <ProtectedRoute>
                  <UploadResourcePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="saved"
              element={
                <ProtectedRoute>
                  <SavedResourcesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="my-uploads"
              element={
                <ProtectedRoute>
                  <MyUploadsPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Moderation route */}
            <Route
              path="admin"
              element={
                <AdminRoute>
                  <AdminDashboardPage />
                </AdminRoute>
              }
            />

            {/* 404 Route */}
            <Route
              path="*"
              element={
                <PlaceholderPage
                  title="Page Not Found"
                  description="The academic page you are looking for does not exist."
                />
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
