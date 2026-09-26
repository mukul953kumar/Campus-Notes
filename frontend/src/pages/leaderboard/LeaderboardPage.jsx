import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../../services/api';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import {
  Trophy,
  Medal,
  Award,
  Upload,
  Download,
  Star,
  BookOpen,
  Filter,
  ArrowRight,
  Sparkles,
  Users,
  GraduationCap
} from 'lucide-react';

const BRANCH_OPTIONS = [
  { value: '', label: 'All Branches' },
  { value: 'Computer Science & Engineering', label: 'Computer Science (CSE)' },
  { value: 'Information Technology', label: 'Information Technology (IT)' },
  { value: 'Electronics Engineering', label: 'Electronics (ECE)' },
  { value: 'Electrical Engineering', label: 'Electrical (EE)' },
  { value: 'Mechanical Engineering', label: 'Mechanical (ME)' },
  { value: 'Civil Engineering', label: 'Civil (CE)' },
  { value: 'Master of Computer Applications', label: 'MCA' }
];

const SORT_OPTIONS = [
  { id: 'uploads', label: 'Most Verified Notes', icon: BookOpen },
  { id: 'downloads', label: 'Most Downloaded', icon: Download },
  { id: 'rating', label: 'Highest Rated', icon: Star }
];

function getAvatarBg(rank) {
  if (rank === 1) return 'bg-amber-600 text-white';
  if (rank === 2) return 'bg-slate-700 text-white';
  if (rank === 3) return 'bg-orange-600 text-white';
  return 'bg-blue-700 text-white';
}

export default function LeaderboardPage() {
  const [contributors, setContributors] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedSort, setSelectedSort] = useState('uploads');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await userService.getLeaderboard({
        branch: selectedBranch,
        sortBy: selectedSort,
        limit: 30
      });

      if (response && response.data) {
        setContributors(response.data);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load contributor rankings.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedBranch, selectedSort]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const topThree = contributors.slice(0, 3);

  return (
    <div className="space-y-8 py-4">
      
      {/* Top Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Campus Academic Honor Roll</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Top Contributors Leaderboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Recognizing dedicated KNITians who empower junior and peer batches with verified handwritten lecture notes, exam guides, and solved question papers.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3 w-full sm:w-auto">
            <Link to="/upload" className="w-full sm:w-auto">
              <Button variant="primary" size="md" icon={Upload} className="w-full sm:w-auto">
                Upload & Join Leaderboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter and Sorting Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs min-w-0">
        
        {/* Sort Criteria Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none min-w-0">
          {SORT_OPTIONS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedSort === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedSort(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-blue-700 text-white font-bold shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80 font-medium'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Branch Selector Filter */}
        <div className="flex items-center gap-2 sm:max-w-xs w-full">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer"
          >
            {BRANCH_OPTIONS.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="py-20">
          <Loader message="Loading academic leaderboard..." size="lg" />
        </div>
      ) : errorMessage ? (
        <div className="py-12">
          <EmptyState
            title="Unable to load rankings"
            description={errorMessage}
            actionLabel="Try Again"
            onAction={fetchLeaderboard}
          />
        </div>
      ) : contributors.length === 0 ? (
        <div className="py-12 bg-white border border-slate-200 rounded-2xl">
          <EmptyState
            title="No Verified Contributors Yet"
            description={
              selectedBranch
                ? `No study materials uploaded for ${selectedBranch} yet. Be the first to contribute and claim Rank #1!`
                : 'No verified contributors yet. Upload study materials to climb the leaderboard!'
            }
            actionLabel="Upload Study Material"
            onAction={() => (window.location.href = '/upload')}
          />
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Top 3 Podium Showcase */}
          {topThree.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Podium Contributor Honors</span>
                </h2>
                <span className="text-[11px] font-medium text-slate-400">KNIT Sultanpur Academic Hall of Fame</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5 items-stretch">
                {topThree.map((item) => {
                  const rank = item.rank;
                  const user = item.user;

                  // Rank 1: Gold Theme
                  if (rank === 1) {
                    return (
                      <div
                        key={item._id}
                        className="bg-white border border-amber-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between"
                      >
                        {/* Top Rank Badge */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center font-bold">
                            <Trophy className="w-5 h-5 text-amber-600 fill-amber-400" />
                          </div>

                          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            <span>Rank #1 • Campus Champion</span>
                          </span>
                        </div>

                        {/* User Identity */}
                        <div className="flex items-center gap-3.5 mb-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base shrink-0 overflow-hidden shadow-2xs ${getAvatarBg(rank)}`}>
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              user.name?.slice(0, 2).toUpperCase() || 'ST'
                            )}
                          </div>

                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-slate-900 text-base leading-tight truncate">
                                {user.name}
                              </p>
                              <span className="text-xs">🥇</span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium truncate">
                              {user.branch || 'KNIT Student'} {user.semester ? `• Sem ${user.semester}` : ''}
                            </p>
                          </div>
                        </div>

                        {/* Performance Metrics Row */}
                        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
                          <div className="bg-slate-50/80 p-2 rounded-xl border border-slate-200/60">
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Notes</p>
                            <p className="font-bold text-sm text-slate-900 mt-0.5">{item.verifiedUploads}</p>
                          </div>

                          <div className="bg-slate-50/80 p-2 rounded-xl border border-slate-200/60">
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Downloads</p>
                            <p className="font-bold text-sm text-blue-700 mt-0.5">{item.totalDownloads}</p>
                          </div>

                          <div className="bg-slate-50/80 p-2 rounded-xl border border-slate-200/60">
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Rating</p>
                            <p className="font-bold text-sm text-amber-600 flex items-center justify-center gap-1 mt-0.5">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                              <span>{item.averageRating > 0 ? item.averageRating.toFixed(1) : '5.0'}</span>
                            </p>
                          </div>
                        </div>

                      </div>
                    );
                  }

                  // Rank 2: Silver Theme
                  if (rank === 2) {
                    return (
                      <div
                        key={item._id}
                        className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
                      >
                        {/* Top Rank Badge */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold">
                            <Medal className="w-5 h-5 text-slate-500 fill-slate-300" />
                          </div>

                          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
                            Rank #2 • Master Contributor
                          </span>
                        </div>

                        {/* User Identity */}
                        <div className="flex items-center gap-3.5 mb-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base shrink-0 overflow-hidden shadow-2xs ${getAvatarBg(rank)}`}>
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              user.name?.slice(0, 2).toUpperCase() || 'ST'
                            )}
                          </div>

                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-slate-900 text-base leading-tight truncate">
                                {user.name}
                              </p>
                              <span className="text-xs">🥈</span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium truncate">
                              {user.branch || 'KNIT Student'} {user.semester ? `• Sem ${user.semester}` : ''}
                            </p>
                          </div>
                        </div>

                        {/* Performance Metrics Row */}
                        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
                          <div className="bg-slate-50/80 p-2 rounded-xl border border-slate-200/60">
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Notes</p>
                            <p className="font-bold text-sm text-slate-900 mt-0.5">{item.verifiedUploads}</p>
                          </div>

                          <div className="bg-slate-50/80 p-2 rounded-xl border border-slate-200/60">
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Downloads</p>
                            <p className="font-bold text-sm text-blue-700 mt-0.5">{item.totalDownloads}</p>
                          </div>

                          <div className="bg-slate-50/80 p-2 rounded-xl border border-slate-200/60">
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Rating</p>
                            <p className="font-bold text-sm text-amber-600 flex items-center justify-center gap-1 mt-0.5">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                              <span>{item.averageRating > 0 ? item.averageRating.toFixed(1) : '5.0'}</span>
                            </p>
                          </div>
                        </div>

                      </div>
                    );
                  }

                  // Rank 3: Bronze Theme
                  return (
                    <div
                      key={item._id}
                      className="bg-white border border-orange-200/80 rounded-2xl p-5 shadow-2xs hover:shadow-xs hover:border-orange-300 transition-all flex flex-col justify-between"
                    >
                      {/* Top Rank Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 flex items-center justify-center font-bold">
                          <Award className="w-5 h-5 text-orange-600 fill-orange-400" />
                        </div>

                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-orange-50 text-orange-900 border border-orange-200">
                          Rank #3 • Senior Contributor
                        </span>
                      </div>

                      {/* User Identity */}
                      <div className="flex items-center gap-3.5 mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base shrink-0 overflow-hidden shadow-2xs ${getAvatarBg(rank)}`}>
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            user.name?.slice(0, 2).toUpperCase() || 'ST'
                          )}
                        </div>

                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-slate-900 text-base leading-tight truncate">
                              {user.name}
                            </p>
                            <span className="text-xs">🥉</span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium truncate">
                            {user.branch || 'KNIT Student'} {user.semester ? `• Sem ${user.semester}` : ''}
                          </p>
                        </div>
                      </div>

                      {/* Performance Metrics Row */}
                      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
                        <div className="bg-slate-50/80 p-2 rounded-xl border border-slate-200/60">
                          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Notes</p>
                          <p className="font-bold text-sm text-slate-900 mt-0.5">{item.verifiedUploads}</p>
                        </div>

                        <div className="bg-slate-50/80 p-2 rounded-xl border border-slate-200/60">
                          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Downloads</p>
                          <p className="font-bold text-sm text-blue-700 mt-0.5">{item.totalDownloads}</p>
                        </div>

                        <div className="bg-slate-50/80 p-2 rounded-xl border border-slate-200/60">
                          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Rating</p>
                          <p className="font-bold text-sm text-amber-600 flex items-center justify-center gap-1 mt-0.5">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                            <span>{item.averageRating > 0 ? item.averageRating.toFixed(1) : '5.0'}</span>
                          </p>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Full Leaderboard Table / Rankings List */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs space-y-0">
            <div className="p-4 sm:p-5 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  All Contributor Rankings
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {contributors.length} verified student {contributors.length === 1 ? 'contributor' : 'contributors'} ranked
                </p>
              </div>

              <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                KNIT Sultanpur
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {contributors.map((item) => {
                const rank = item.rank;
                const user = item.user;

                return (
                  <div
                    key={item._id}
                    className="p-3.5 sm:p-4.5 hover:bg-slate-50/90 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
                  >
                    {/* Rank + User Identity */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-7 text-center shrink-0">
                        {rank === 1 && <span className="text-base">🥇</span>}
                        {rank === 2 && <span className="text-base">🥈</span>}
                        {rank === 3 && <span className="text-base">🥉</span>}
                        {rank > 3 && (
                          <span className="font-bold text-xs text-slate-400">
                            #{rank}
                          </span>
                        )}
                      </div>

                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden ${getAvatarBg(rank)}`}>
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          user.name?.slice(0, 2).toUpperCase() || 'ST'
                        )}
                      </div>

                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {user.name}
                          </p>
                          <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-sm shrink-0">
                            {item.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          {user.branch || 'KNIT Student'} {user.semester ? `• Sem ${user.semester}` : ''}
                        </p>
                      </div>
                    </div>

                    {/* Stats: Balanced 3-column micro grid on mobile, horizontal row on desktop */}
                    <div className="grid grid-cols-3 sm:flex items-center gap-2 sm:gap-8 pt-2 sm:pt-0 border-t border-slate-100 sm:border-0 text-center sm:text-right shrink-0 bg-slate-50/70 sm:bg-transparent p-2 sm:p-0 rounded-xl sm:rounded-none">
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Notes</p>
                        <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                          {item.verifiedUploads}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Downloads</p>
                        <p className="text-xs sm:text-sm font-bold text-blue-700 mt-0.5">
                          {item.totalDownloads}
                        </p>
                      </div>

                      <div className="sm:w-16">
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Rating</p>
                        <p className="text-xs sm:text-sm font-bold text-amber-700 flex items-center justify-center sm:justify-end gap-1 mt-0.5">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                          <span>{item.averageRating > 0 ? item.averageRating.toFixed(1) : '5.0'}</span>
                        </p>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>

        </div>
      )}

      {/* Motivational Call to Action */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1.5 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 bg-blue-600/60 border border-blue-400/40 px-2.5 py-0.5 rounded-full text-xs font-semibold">
            <Award className="w-3.5 h-3.5" />
            <span>Join the Community of Contributors</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold">Have handwritten notes or solved papers?</h3>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
            Upload your academic materials to earn contributor badges, help batchmates ace their exams, and rank on the Campus Leaderboard.
          </p>
        </div>

        <Link to="/upload" className="shrink-0 w-full sm:w-auto">
          <Button
            size="md"
            variant="outline"
            icon={Upload}
            className="w-full sm:w-auto bg-white text-blue-800 hover:bg-blue-50 border-white font-semibold cursor-pointer"
          >
            Upload Study Material
          </Button>
        </Link>
      </div>

    </div>
  );
}
