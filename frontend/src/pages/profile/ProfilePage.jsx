import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService, resourceService, bookmarkService, ratingService } from '../../services/api';
import ResourceRow from '../../components/resources/ResourceRow';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import {
  User,
  Mail,
  GraduationCap,
  Award,
  Upload,
  CheckCircle2,
  Calendar,
  LogOut,
  Save,
  ShieldCheck,
  AlertCircle,
  Bookmark,
  Star,
  FileText,
  Clock,
  Edit3,
  X,
  Layers,
  ArrowRight,
  BookOpen,
  Sparkles,
  Download,
  Check
} from 'lucide-react';

const BRANCH_OPTIONS = [
  { value: 'Computer Science & Engineering', label: 'Computer Science & Engineering (CSE)' },
  { value: 'Information Technology', label: 'Information Technology (IT)' },
  { value: 'Electronics Engineering', label: 'Electronics Engineering (ECE)' },
  { value: 'Electrical Engineering', label: 'Electrical Engineering (EE)' },
  { value: 'Mechanical Engineering', label: 'Mechanical Engineering (ME)' },
  { value: 'Civil Engineering', label: 'Civil Engineering (CE)' },
  { value: 'Master of Computer Applications', label: 'Master of Computer Applications (MCA)' },
];

const SEMESTER_OPTIONS = [
  { value: '1', label: 'Semester 1' },
  { value: '2', label: 'Semester 2' },
  { value: '3', label: 'Semester 3' },
  { value: '4', label: 'Semester 4' },
  { value: '5', label: 'Semester 5' },
  { value: '6', label: 'Semester 6' },
  { value: '7', label: 'Semester 7' },
  { value: '8', label: 'Semester 8' },
];

export default function ProfilePage() {
  const { user, updateUser, logout, savedIds, toggleBookmark } = useAuth();

  // Active Tab state
  const [activeTab, setActiveTab] = useState('uploads'); // 'uploads' | 'saved' | 'reviews' | 'academic'
  const [uploadStatusFilter, setUploadStatusFilter] = useState(''); // '' = all, 'verified', 'pending', 'rejected'
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Profile Edit Form state
  const [branch, setBranch] = useState(user?.branch || '');
  const [semester, setSemester] = useState(user?.semester ? String(user.semester) : '5');
  const [graduationYear, setGraduationYear] = useState(
    user?.graduationYear ? String(user.graduationYear) : String(new Date().getFullYear() + 1)
  );

  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Data Collections
  const [myUploads, setMyUploads] = useState([]);
  const [savedBookmarks, setSavedBookmarks] = useState([]);
  const [myReviews, setMyReviews] = useState([]);

  // Loaders
  const [isLoadingUploads, setIsLoadingUploads] = useState(false);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.branch) setBranch(user.branch);
      if (user.semester) setSemester(String(user.semester));
      if (user.graduationYear) setGraduationYear(String(user.graduationYear));
    }
  }, [user]);

  // Fetch My Uploads
  const loadUploads = async () => {
    setIsLoadingUploads(true);
    try {
      const res = await resourceService.getMyUploads();
      if (res && res.data) {
        setMyUploads(res.data);
      }
    } catch (err) {
      console.error('Failed to load uploads:', err);
    } finally {
      setIsLoadingUploads(false);
    }
  };

  // Fetch Saved Bookmarks
  const loadSavedBookmarks = async () => {
    setIsLoadingSaved(true);
    try {
      const res = await bookmarkService.getBookmarks();
      if (res && res.data) {
        setSavedBookmarks(res.data);
      }
    } catch (err) {
      console.error('Failed to load bookmarks:', err);
    } finally {
      setIsLoadingSaved(false);
    }
  };

  // Fetch My Reviews & Ratings
  const loadMyReviews = async () => {
    setIsLoadingReviews(true);
    try {
      const res = await ratingService.getMyReviews();
      if (res && res.data) {
        setMyReviews(res.data);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  useEffect(() => {
    loadUploads();
    loadSavedBookmarks();
    loadMyReviews();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });
    setIsSaving(true);

    try {
      const response = await authService.updateProfile({
        branch,
        semester: Number(semester),
        graduationYear: Number(graduationYear),
      });

      if (response && response.data) {
        updateUser(response.data);
        setStatusMessage({ type: 'success', text: 'Academic details updated successfully!' });
        setTimeout(() => {
          setIsEditingProfile(false);
          setStatusMessage({ type: '', text: '' });
        }, 1200);
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleSave = async (resourceId) => {
    try {
      await toggleBookmark(resourceId);
      setSavedBookmarks((prev) => prev.filter((b) => b._id !== resourceId));
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : 'Recent';

  // Filtered uploads by tab status
  const filteredUploads = uploadStatusFilter
    ? myUploads.filter((u) => u.verificationStatus === uploadStatusFilter)
    : myUploads;

  const verifiedUploadsCount = myUploads.filter((u) => u.verificationStatus === 'verified').length;
  const pendingUploadsCount = myUploads.filter((u) => u.verificationStatus === 'pending').length;
  const rejectedUploadsCount = myUploads.filter((u) => u.verificationStatus === 'rejected').length;

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      
      {/* 1. Top Student Identity Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Avatar & Student Info */}
          <div className="flex items-start sm:items-center gap-4.5 min-w-0 flex-1">
            <div className="w-18 h-18 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-800 text-white flex items-center justify-center text-2xl font-extrabold shadow-sm shrink-0 overflow-hidden border-2 border-white">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.name?.slice(0, 2).toUpperCase() || 'ST'
              )}
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {user?.name}
                </h1>
                {user?.role === 'admin' ? (
                  <Badge variant="notes" size="sm">
                    Admin
                  </Badge>
                ) : (
                  <Badge variant="verified" size="sm" showIcon>
                    Verified Student
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user?.email}</span>
                </span>
                {user?.rollNumber && (
                  <>
                    <span>•</span>
                    <span className="font-mono bg-blue-50 text-blue-900 px-2 py-0.5 rounded border border-blue-200 text-[11px] font-bold">
                      ID: {user.rollNumber}
                    </span>
                  </>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs pt-0.5">
                <span className="font-semibold text-blue-800 bg-blue-50/90 px-2.5 py-0.5 rounded-lg border border-blue-200">
                  {user?.branch || 'KNIT Student'} {user?.semester ? `• Sem ${user.semester}` : ''}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500 flex items-center gap-1 font-medium">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-700" />
                  <span>Kamla Nehru Institute of Technology, Sultanpur</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-center pt-2 md:pt-0">
            <Button
              variant={isEditingProfile ? 'primary' : 'outline'}
              size="sm"
              icon={isEditingProfile ? X : Edit3}
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="font-semibold"
            >
              {isEditingProfile ? 'Close Editor' : 'Edit Academic Profile'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon={LogOut}
              onClick={logout}
              className="text-rose-700 hover:text-rose-800 hover:bg-rose-50 border-rose-200 font-semibold cursor-pointer"
            >
              Sign Out
            </Button>
          </div>

        </div>
      </div>

      {/* 2. Key Academic Stats Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        {/* Uploads Card */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('uploads');
            setUploadStatusFilter('');
          }}
          className={`text-left p-4 rounded-2xl border transition-all cursor-pointer shadow-2xs hover:shadow-xs ${
            activeTab === 'uploads' && !uploadStatusFilter
              ? 'bg-blue-50/60 border-blue-300 ring-2 ring-blue-100'
              : 'bg-white border-slate-200 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Uploaded</span>
            <Upload className="w-4 h-4 text-blue-700" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {myUploads.length || user?.stats?.uploadsCount || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Total documents submitted</p>
        </button>

        {/* Approved Card */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('uploads');
            setUploadStatusFilter('verified');
          }}
          className={`text-left p-4 rounded-2xl border transition-all cursor-pointer shadow-2xs hover:shadow-xs ${
            activeTab === 'uploads' && uploadStatusFilter === 'verified'
              ? 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-100'
              : 'bg-white border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Approved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {verifiedUploadsCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Verified & live on campus</p>
        </button>

        {/* Impact Downloads */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Impact</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-blue-700">
            {user?.stats?.downloadsReceived ?? user?.stats?.downloadsCount ?? 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Downloads by batchmates</p>
        </div>

        {/* Member / Reviews Stats */}
        <button
          type="button"
          onClick={() => setActiveTab('reviews')}
          className={`text-left p-4 rounded-2xl border transition-all cursor-pointer shadow-2xs hover:shadow-xs ${
            activeTab === 'reviews'
              ? 'bg-purple-50/60 border-purple-300 ring-2 ring-purple-100'
              : 'bg-white border-slate-200 hover:border-purple-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Reviews</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {myReviews.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Ratings shared by you</p>
        </button>

      </div>

      {/* 3. Collapsible Edit Profile Form (Only shown when user clicks Edit Profile) */}
      {isEditingProfile && (
        <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 sm:p-8 shadow-md space-y-6 transition-all animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-700" />
                <span>Update Academic Details</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Keep your branch and semester accurate to receive personalized notes and syllabus recommendations.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsEditingProfile(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {statusMessage.text && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-start gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Select
                label="Engineering Branch / Department"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                options={BRANCH_OPTIONS}
                required
              />

              <Select
                label="Current Semester"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                options={SEMESTER_OPTIONS}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Expected Graduation Year"
                type="number"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                placeholder="e.g. 2026"
                min="2020"
                max="2032"
                required
              />

              <Input
                label="Registered College"
                type="text"
                value="Kamla Nehru Institute of Technology, Sultanpur"
                disabled
                helperText="Affiliated college is linked to your verified student account"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setIsEditingProfile(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                icon={Save}
                isLoading={isSaving}
              >
                Save Profile Changes
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* 4. Multi-Tab Student Activity Hub Console */}
      <div className="space-y-6">
        
        {/* Navigation Tabs Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          
          <button
            type="button"
            onClick={() => setActiveTab('uploads')}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'uploads'
                ? 'bg-blue-700 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>My Uploads</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'uploads' ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {myUploads.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'saved'
                ? 'bg-blue-700 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved Bookmarks</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'saved' ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {savedBookmarks.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'reviews'
                ? 'bg-blue-700 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>My Reviews & Ratings</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'reviews' ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {myReviews.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('academic')}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'academic'
                ? 'bg-blue-700 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Academic Overview</span>
          </button>

        </div>

        {/* TAB 1: MY UPLOADS */}
        {activeTab === 'uploads' && (
          <div className="space-y-4">
            
            {/* Status Filter Sub-bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setUploadStatusFilter('')}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                    uploadStatusFilter === ''
                      ? 'bg-blue-50 text-blue-800 font-bold border border-blue-200'
                      : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  All ({myUploads.length})
                </button>
                <button
                  type="button"
                  onClick={() => setUploadStatusFilter('verified')}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                    uploadStatusFilter === 'verified'
                      ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                      : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  Verified ({verifiedUploadsCount})
                </button>
                <button
                  type="button"
                  onClick={() => setUploadStatusFilter('pending')}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                    uploadStatusFilter === 'pending'
                      ? 'bg-amber-50 text-amber-800 font-bold border border-amber-200'
                      : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  Under Review ({pendingUploadsCount})
                </button>
                {rejectedUploadsCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setUploadStatusFilter('rejected')}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                      uploadStatusFilter === 'rejected'
                        ? 'bg-rose-50 text-rose-800 font-bold border border-rose-200'
                        : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                    }`}
                  >
                    Rejected ({rejectedUploadsCount})
                  </button>
                )}
              </div>

              <Link to="/upload" className="shrink-0 self-start sm:self-auto">
                <Button size="sm" variant="primary" icon={Upload}>
                  Upload New Material
                </Button>
              </Link>
            </div>

            {/* List */}
            {isLoadingUploads ? (
              <div className="bg-white border border-slate-200 rounded-2xl py-16 text-center shadow-xs">
                <Loader message="Loading your uploads..." size="md" />
              </div>
            ) : filteredUploads.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 shadow-xs">
                <EmptyState
                  icon={Upload}
                  title={
                    uploadStatusFilter
                      ? `No ${uploadStatusFilter} uploads found`
                      : 'You have not uploaded any study materials yet'
                  }
                  description="Share your handwritten lecture notes, past exam papers, or practical files to help junior students excel."
                  actionLabel="Upload First Note"
                  onAction={() => (window.location.href = '/upload')}
                />
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredUploads.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white hover:bg-slate-50/50 border border-slate-200/90 hover:border-blue-300 rounded-2xl p-4.5 sm:p-5 shadow-2xs hover:shadow-xs transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            to={`/resources/${item._id}`}
                            className="font-bold text-sm sm:text-base text-slate-900 hover:text-blue-700 transition-colors line-clamp-1"
                          >
                            {item.title}
                          </Link>
                          {item.verificationStatus === 'verified' && (
                            <Badge variant="verified" size="sm" showIcon>
                              Verified & Live
                            </Badge>
                          )}
                          {item.verificationStatus === 'pending' && (
                            <Badge variant="pending" size="sm" showIcon>
                              Under Review
                            </Badge>
                          )}
                          {item.verificationStatus === 'rejected' && (
                            <Badge variant="rejected" size="sm" showIcon>
                              Rejected
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-slate-500">
                          <span className="font-bold text-blue-900 bg-blue-50/90 px-2 py-0.5 rounded border border-blue-200/90 text-[11px]">
                            {item.subjectId?.shortName || item.subjectId?.code || 'KNIT'}
                          </span>
                          <Badge variant={item.resourceType} size="sm">
                            {item.resourceType?.toUpperCase()}
                          </Badge>
                          {item.unit && (
                            <span className="text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 text-[11px]">
                              Unit {item.unit}
                            </span>
                          )}
                          <span>•</span>
                          <span>{item.branch}</span>
                          <span>•</span>
                          <span>Sem {item.semester}</span>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                          <span className="flex items-center gap-1">
                            <Download className="w-3 h-3 text-slate-400" />
                            {item.downloadsCount || 0} downloads
                          </span>
                          <span>•</span>
                          <span>
                            Uploaded on{' '}
                            {new Date(item.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <Link to={`/resources/${item._id}`}>
                          <Button variant="secondary" size="sm" className="font-semibold text-slate-700">
                            View Details
                          </Button>
                        </Link>

                        {item.fileUrl && (
                          <a href={item.fileUrl} target="_blank" rel="noopener noreferrer">
                            <Button
                              variant="outline"
                              size="sm"
                              icon={Download}
                              className="font-semibold text-slate-800 border-slate-200 hover:border-blue-600 hover:text-blue-700"
                            >
                              PDF
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Moderator Rejection Feedback if any */}
                    {item.verificationStatus === 'rejected' && item.rejectionReason && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Moderator Feedback: </span>
                          <span>{item.rejectionReason}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* TAB 2: SAVED BOOKMARKS */}
        {activeTab === 'saved' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1 text-xs text-slate-600">
              <span className="font-bold text-slate-900 text-sm sm:text-base">
                {savedBookmarks.length} Bookmarked {savedBookmarks.length === 1 ? 'Resource' : 'Resources'}
              </span>
              <Link to="/resources">
                <Button size="sm" variant="outline">
                  Browse More Notes
                </Button>
              </Link>
            </div>

            {isLoadingSaved ? (
              <div className="bg-white border border-slate-200 rounded-2xl py-16 text-center shadow-xs">
                <Loader message="Loading saved bookmarks..." size="md" />
              </div>
            ) : savedBookmarks.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 shadow-xs">
                <EmptyState
                  icon={Bookmark}
                  title="No Saved Bookmarks Yet"
                  description="Bookmark study materials and previous year question papers in the library for quick 1-click exam revision."
                  actionLabel="Explore Academic Library"
                  onAction={() => (window.location.href = '/resources')}
                />
              </div>
            ) : (
              <div className="space-y-3.5">
                {savedBookmarks.map((item) => (
                  <ResourceRow
                    key={item._id}
                    resource={item}
                    isSaved={true}
                    onToggleSave={() => handleToggleSave(item._id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MY REVIEWS & RATINGS */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1 text-xs text-slate-600">
              <span className="font-bold text-slate-900 text-sm sm:text-base">
                {myReviews.length} {myReviews.length === 1 ? 'Review' : 'Reviews'} & Ratings Shared
              </span>
              <span className="text-slate-400">Community Feedback</span>
            </div>

            {isLoadingReviews ? (
              <div className="bg-white border border-slate-200 rounded-2xl py-16 text-center shadow-xs">
                <Loader message="Loading your submitted reviews..." size="md" />
              </div>
            ) : myReviews.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 shadow-xs">
                <EmptyState
                  icon={Star}
                  title="No Ratings or Reviews Yet"
                  description="Help other KNITians by rating notes, sharing feedback on handwriting quality, or verifying syllabus accuracy."
                  actionLabel="Browse Notes to Rate"
                  onAction={() => (window.location.href = '/resources')}
                />
              </div>
            ) : (
              <div className="space-y-3.5">
                {myReviews.map((rev) => {
                  const res = rev.resourceId;
                  return (
                    <div
                      key={rev._id}
                      className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm sm:text-base line-clamp-1">
                              {res?.title || 'Academic Resource'}
                            </span>
                            {res?.subjectId?.shortName && (
                              <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                {res.subjectId.shortName}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span>{res?.branch || 'KNIT'}</span>
                            <span>•</span>
                            <span>Sem {res?.semester || 'Syllabus'}</span>
                            <span>•</span>
                            <span>
                              Rated on{' '}
                              {new Date(rev.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Star Rating Badge */}
                        <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 text-amber-900 font-extrabold text-sm shrink-0 self-start">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                          <span>{rev.rating}.0 / 5</span>
                        </div>
                      </div>

                      {/* Review text if provided */}
                      {rev.review ? (
                        <p className="text-xs sm:text-sm text-slate-700 bg-slate-50/80 p-3 rounded-xl border border-slate-100 leading-relaxed italic">
                          "{rev.review}"
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No written review commentary provided.</p>
                      )}

                      <div className="flex justify-end pt-1">
                        {res?._id && (
                          <Link to={`/resources/${res._id}`}>
                            <Button size="sm" variant="secondary" className="font-semibold text-slate-700">
                              View Resource Page <ArrowRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ACADEMIC OVERVIEW */}
        {activeTab === 'academic' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Academic & Institutional Profile</h3>
                <p className="text-xs text-slate-500">Official college record and active syllabus synchronization.</p>
              </div>

              <Button
                variant="primary"
                size="sm"
                icon={Edit3}
                onClick={() => setIsEditingProfile(true)}
              >
                Edit Details
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Engineering Department</span>
                <p className="text-sm font-bold text-slate-900">{user?.branch || 'Not Set'}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Current Semester</span>
                <p className="text-sm font-bold text-slate-900">Semester {user?.semester || 'Not Set'}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Expected Graduation</span>
                <p className="text-sm font-bold text-slate-900">Class of {user?.graduationYear || '2028'}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Student ID</span>
                <p className="text-sm font-mono font-bold text-blue-900">{user?.rollNumber || 'N/A'}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1 sm:col-span-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Affiliated Institution</span>
                <p className="text-sm font-bold text-slate-900">Kamla Nehru Institute of Technology, Sultanpur (U.P.)</p>
              </div>
            </div>

            <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4 flex items-start gap-3 text-xs text-blue-900">
              <Sparkles className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Dynamic Personalization Active: </span>
                <span>Your home page and resource library feeds are continuously curated for <strong>{user?.branch} Semester {user?.semester}</strong>.</span>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
