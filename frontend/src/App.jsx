import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PwaProvider } from './context/PwaContext';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfilePage from './pages/profile/ProfilePage';
import UploadResourcePage from './pages/upload/UploadResourcePage';
import UploadGuidelinesPage from './pages/upload/UploadGuidelinesPage';
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
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { resourceService, userService, academicService } from './services/api';
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

const DISMISSED_REJECTIONS_STORAGE_KEY = 'campusnotes_dismissed_rejected_ids';

function getDismissedRejectedIds() {
  try {
    const raw = localStorage.getItem(DISMISSED_REJECTIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveDismissedRejectedId(id) {
  try {
    if (!id) return;
    const current = getDismissedRejectedIds();
    if (!current.includes(id)) {
      current.push(id);
      localStorage.setItem(DISMISSED_REJECTIONS_STORAGE_KEY, JSON.stringify(current));
    }
  } catch (e) {
    console.error('Failed to save dismissed rejected note:', e);
  }
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
  const [rejectedUploads, setRejectedUploads] = useState([]);

  const branches = [
    { code: 'CSE', name: 'Computer Science & Engineering', count: '1st - 8th Sem' },
    { code: 'IT', name: 'Information Technology', count: '1st - 8th Sem' },
    { code: 'ECE', name: 'Electronics Engineering', count: '1st - 8th Sem' },
    { code: 'EE', name: 'Electrical Engineering', count: '1st - 8th Sem' },
    { code: 'ME', name: 'Mechanical Engineering', count: '1st - 8th Sem' },
    { code: 'CE', name: 'Civil Engineering', count: '1st - 8th Sem' },
    { code: 'MCA', name: 'Master of Computer Applications', count: '1st - 4th Sem' },
  ];

  const [semesterSubjects, setSemesterSubjects] = useState([]);

  // Load live campus recent uploads (Fetch 8 to allow deduplication against recommendations)
  useEffect(() => {
    async function loadRecent() {
      setIsLoadingRecent(true);
      try {
        const res = await resourceService.getResources({ limit: 8, sortBy: 'recent' });
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

  // Check if student has any rejected submissions needing revision (ignoring dismissed ones)
  useEffect(() => {
    if (!user) {
      setRejectedUploads([]);
      return;
    }
    async function loadRejectedUploads() {
      try {
        const res = await resourceService.getMyUploads('rejected');
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const dismissedIds = getDismissedRejectedIds();
          // Filter out items already dismissed by clicking the cross icon
          const unDismissed = res.data.filter((item) => !dismissedIds.includes(item._id));
          setRejectedUploads(unDismissed);
        } else {
          setRejectedUploads([]);
        }
      } catch (err) {
        console.error('Failed to load rejected uploads:', err);
      }
    }
    loadRejectedUploads();
  }, [user]);

  const handleDismissRejectedNotice = (itemToDismiss) => {
    if (itemToDismiss?._id) {
      saveDismissedRejectedId(itemToDismiss._id);
      setRejectedUploads((prev) => prev.filter((item) => item._id !== itemToDismiss._id));
    } else {
      rejectedUploads.forEach((item) => saveDismissedRejectedId(item._id));
      setRejectedUploads([]);
    }
  };

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

  // Load active semester subjects for the student
  useEffect(() => {
    if (user?.branch && user?.semester) {
      async function loadSubjects() {
        try {
          const res = await academicService.getSubjects({
            branch: user.branch,
            semester: user.semester,
          });
          if (res?.data && Array.isArray(res.data)) {
            setSemesterSubjects(res.data.slice(0, 6));
          }
        } catch (err) {
          console.error('Failed to load semester subjects:', err);
        }
      }
      loadSubjects();
    } else {
      setSemesterSubjects([]);
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

  // Derive student rank on campus
  const userRankItem = topContributors.find(
    (c) => c.user?._id === user?._id || c.user?.email === user?.email
  );
  const userRank = userRankItem?.rank;

  // Deduplicate recent notes so they don't repeat what is already recommended
  const uniqueRecentUploads = recentUploads.filter(
    (item) => !recommendedUploads.some((rec) => rec._id === item._id)
  );
  const finalRecentUploads = uniqueRecentUploads.length > 0
    ? uniqueRecentUploads.slice(0, 4)
    : recentUploads.slice(0, 4);

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
    <div className="space-y-6 sm:space-y-10">
      {/* Top Welcome / Command Center Section */}
      <section className="max-w-5xl mx-auto pt-1 sm:pt-2">
        {user ? (
          <div className="space-y-4">
            {/* Action Required: Note Revision Alert Banner */}
            {rejectedUploads.length > 0 && (
              <div className="bg-rose-50/95 border border-rose-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                      <AlertCircle className="w-5 h-5 text-rose-600" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-bold text-slate-900 text-sm sm:text-base">
                          Action Required: Study Material Needs Revision
                        </h2>
                        <Badge variant="rejected" size="sm">
                          {rejectedUploads.length} {rejectedUploads.length === 1 ? 'Notice' : 'Notices'}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600">
                        A moderator reviewed <span className="font-semibold text-slate-900">"{rejectedUploads[0].title}"</span> and provided feedback for improvement.
                      </p>
                      <div className="mt-2 p-2.5 bg-white/95 border border-rose-200/80 rounded-xl text-xs text-slate-800 space-y-1">
                        <span className="font-bold text-rose-900 flex items-center gap-1.5">
                          <span>Moderator Feedback:</span>
                        </span>
                        <p className="text-slate-700 italic font-medium leading-relaxed">
                          "{rejectedUploads[0].rejectionReason || 'Document did not meet verification standards. Please review academic guidelines and submit an updated document.'}"
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <Link
                      to={`/upload?reupload=true&title=${encodeURIComponent(rejectedUploads[0].title)}&branch=${encodeURIComponent(rejectedUploads[0].branch || '')}&semester=${rejectedUploads[0].semester || ''}&subjectId=${rejectedUploads[0].subjectId?._id || ''}&resourceType=${rejectedUploads[0].resourceType || 'notes'}&unit=${rejectedUploads[0].unit || ''}&feedback=${encodeURIComponent(rejectedUploads[0].rejectionReason || '')}`}
                    >
                      <Button variant="primary" size="sm" icon={Upload} className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs">
                        Fix & Re-upload
                      </Button>
                    </Link>
                    <Link to="/my-uploads">
                      <Button variant="outline" size="sm" className="text-xs font-semibold">
                        View All
                      </Button>
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDismissRejectedNotice(rejectedUploads[0])}
                      className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-rose-100/70 cursor-pointer transition-colors"
                      title="Dismiss this notice (will not show again on refresh)"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Logged-in Student Workspace Command Center (Mobile & Desktop) */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-2xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-blue-700 text-white flex items-center justify-center text-sm sm:text-base font-bold shrink-0 shadow-2xs overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name?.slice(0, 2).toUpperCase() || 'ST'
                    )}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
                        Welcome back, {user.name?.split(' ')[0] || 'Student'} 👋
                      </h1>
                      {user.branch && (
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 rounded-full">
                          {getShortBranch(user.branch)} • Sem {user.semester}
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                      Your semester syllabus, peer-reviewed notes, and exam question papers.
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Link to="/saved">
                    <Button size="sm" variant="outline" icon={Bookmark} className="text-xs font-semibold cursor-pointer">
                      Saved ({savedIds.length})
                    </Button>
                  </Link>
                  <Link to="/profile" className="text-xs text-slate-400 hover:text-blue-700 underline px-1 hidden sm:inline-block">
                    Profile
                  </Link>
                </div>
              </div>

              {/* Live Student Academic Stats Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 pt-3 border-t border-slate-100">
                <div className="bg-slate-50/70 rounded-xl p-2.5 sm:p-3 border border-slate-100 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100/80 text-blue-700 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">Branch & Semester</p>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {getShortBranch(user.branch) || 'KNIT'} • Sem {user.semester || 'All'}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50/70 rounded-xl p-2.5 sm:p-3 border border-slate-100 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">My Uploads</p>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {user.stats?.verifiedUploadsCount ?? user.stats?.uploadsCount ?? 0} Verified
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50/70 rounded-xl p-2.5 sm:p-3 border border-slate-100 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-100/80 text-amber-700 flex items-center justify-center shrink-0">
                    <Bookmark className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">Bookmarked</p>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {savedIds.length} Saved Notes
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50/70 rounded-xl p-2.5 sm:p-3 border border-slate-100 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-100/80 text-purple-700 flex items-center justify-center shrink-0">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">Campus Honor</p>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {userRank ? `#${userRank} Champion` : 'Active Contributor'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Active Semester Subjects 1-Click Quick Navigation */}
              {semesterSubjects.length > 0 && (
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-slate-400 font-medium text-[11px] mr-1">Sem {user.semester} Subjects:</span>
                  {semesterSubjects.map((sub) => (
                    <button
                      key={sub._id || sub.code}
                      type="button"
                      onClick={() => handleQuickSearch(sub.code || sub.name)}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] transition-colors cursor-pointer border border-blue-200/60"
                    >
                      {sub.shortName || sub.code}
                    </button>
                  ))}
                  <Link
                    to="/subjects"
                    className="text-xs text-slate-500 hover:text-blue-700 font-medium ml-1 inline-flex items-center gap-0.5"
                  >
                    All Subjects <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Guest User Public Landing Header
          <div className="text-center py-2 sm:py-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-medium mb-3 sm:mb-5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Curated for Kamla Nehru Institute of Technology</span>
            </div>

            <h1 className="text-2xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Verified Academic Resources for <span className="text-blue-700">KNITians</span>
            </h1>

            <p className="mt-2.5 sm:mt-4 text-xs sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Access high-quality lecture notes, previous year question papers (PYQs), and assignment guides shared by top-ranking students.
            </p>
          </div>
        )}

        {/* Streamlined Quick Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-4 sm:mt-6 max-w-2xl mx-auto">
          <div className="flex items-center bg-white p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border border-slate-300 shadow-2xs focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <div className="relative flex-1 flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 shrink-0 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={user?.semester ? `Search Sem ${user.semester} notes, subject codes (DBMS, DAA, OS)...` : "Search subject code (e.g. BCS-501, DBMS)..."}
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

          {/* Popular Subject Chips */}
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
        <section className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-4 sm:p-6 space-y-3.5 sm:space-y-4 shadow-xs">
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
              <p>No verified notes uploaded for {getShortBranch(user.branch)} Semester {user.semester} yet.</p>
              <Link to="/upload">
                <Button size="sm" variant="primary" icon={Upload}>
                  Be the First to Upload for Your Class
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Adaptive desktop grid (3-column if <=3 cards to avoid blank space, 4-col if 4) */}
              <div className={`flex sm:grid ${recommendedUploads.length <= 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4'} gap-3.5 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible snap-x snap-mandatory`}>
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
            </div>
          )}
        </section>
      )}

      {/* Engineering Branches Catalog (7 branches in 1 clean desktop row) */}
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

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3">
          {branches.map((b) => (
            <Link
              key={b.code}
              to={`/resources?branch=${encodeURIComponent(b.name)}`}
              className="p-3 rounded-xl bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-xs transition-all group text-center"
            >
              <div className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                {b.code}
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">{b.count}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Recently Verified Resources List (Deduplicated against recommended) */}
      <section className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-base sm:text-xl font-bold text-slate-900 truncate">Recent Materials</h2>
            <Badge variant="verified" size="sm" showIcon className="shrink-0">
              Latest Live
            </Badge>
          </div>
          <Link
            to="/resources"
            className="text-xs font-bold text-blue-700 hover:text-blue-800 inline-flex items-center gap-1 shrink-0 whitespace-nowrap"
          >
            <span>View Library</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoadingRecent ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 text-center text-xs text-slate-500 shadow-xs">
            Loading recent verified materials...
          </div>
        ) : finalRecentUploads.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 text-center text-xs text-slate-500 shadow-xs">
            No verified materials available yet. Be the first to upload!
          </div>
        ) : (
          <div className="space-y-4">
            {/* Adaptive grid to prevent empty gaps on desktop */}
            <div className={`flex sm:grid ${finalRecentUploads.length <= 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4'} gap-3.5 overflow-x-auto no-scrollbar pb-2 sm:overflow-visible snap-x snap-mandatory`}>
              {finalRecentUploads.map((item) => (
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
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <span>Explore Full Resource Library</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Top Academic Contributors Showcase (Honor Spotlight if 1, Adaptive Grid if multiple) */}
      <section className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-base sm:text-xl font-bold text-slate-900 truncate">Campus Champions</h2>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold shrink-0">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Honor Roll</span>
            </div>
          </div>
          <Link
            to="/leaderboard"
            className="text-xs font-bold text-blue-700 hover:text-blue-800 inline-flex items-center gap-1 shrink-0 whitespace-nowrap"
          >
            <span>Full Leaderboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoadingContributors ? (
          <div className="py-6 text-center text-xs text-slate-400">Loading top contributors...</div>
        ) : topContributors.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-500 shadow-xs">
            No contributors ranked yet. Upload notes to become the first campus champion!
          </div>
        ) : topContributors.length === 1 ? (
          // Featured Honor Spotlight Banner when 1 champion exists (avoids 3 empty columns)
          <div className="bg-white border border-amber-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                🥇
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                    #1 Campus Champion
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{topContributors[0].badge}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {topContributors[0].user?.name || 'Top Contributor'}
                </h3>
                <p className="text-xs text-slate-500">
                  {getShortBranch(topContributors[0].user?.branch) || 'KNIT'} {topContributors[0].user?.semester ? `• Sem ${topContributors[0].user.semester}` : ''} • <strong>{topContributors[0].verifiedUploads}</strong> verified notes • <strong>{topContributors[0].totalDownloads}</strong> downloads
                </p>
              </div>
            </div>
            <Link
              to="/leaderboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 bg-blue-50/80 hover:bg-blue-100/80 px-3 py-1.5 rounded-xl border border-blue-200 transition-colors cursor-pointer shrink-0 self-start md:self-auto"
            >
              <span>View Leaderboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className={`flex sm:grid ${topContributors.length === 2 ? 'sm:grid-cols-2 max-w-2xl' : topContributors.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4'} gap-3.5 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible snap-x snap-mandatory`}>
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
                  className={`w-[260px] sm:w-auto shrink-0 snap-start bg-white rounded-2xl p-4 border transition-all shadow-2xs hover:shadow-xs space-y-3 ${isFirst ? 'border-amber-300 ring-1 ring-amber-200/70' : 'border-slate-200'
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
                          {getShortBranch(c.user?.branch) || 'KNIT'} {c.user?.semester ? `• Sem ${c.user.semester}` : ''}
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
      <PwaProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />

            {/* Public catalog routes */}
            <Route path="resources" element={<ResourceLibraryPage />} />
            <Route path="resources/:id" element={<ResourceDetailsPage />} />
            <Route path="pyqs" element={<PYQPage />} />
            <Route path="subjects" element={<SubjectsPage />} />
            <Route path="subjects/:id" element={<SubjectDetailsPage />} />
            <Route path="leaderboard" element={<LeaderboardPage />} />
            <Route path="guidelines" element={<UploadGuidelinesPage />} />

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
    </PwaProvider>
  </AuthProvider>
);
}
