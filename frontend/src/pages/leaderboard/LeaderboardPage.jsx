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
  GraduationCap,
  Flame,
  Crown
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
  const remainingContributors = contributors.slice(3);

  return (
    <div className="space-y-8 py-4">
      
      {/* Top Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              <span>Campus Academic Honor Roll</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Top Contributors Leaderboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Recognizing dedicated KNITians who empower junior and peer batches with verified handwritten lecture notes, exam guides, and solved question papers.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <Link to="/upload">
              <Button variant="primary" size="md" icon={Upload}>
                Upload & Join Leaderboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter and Sorting Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        
        {/* Sort Criteria Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
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
        <div className="space-y-10">
          
          {/* Top 3 Podium Showcase */}
          {topThree.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Podium Contributor Honors</span>
                </h2>
                <span className="text-[11px] font-semibold text-slate-400">KNIT Sultanpur Hall of Fame</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
                {topThree.map((item) => {
                  const rank = item.rank;
                  const user = item.user;

                  if (rank === 1) {
                    // GOLD PODIUM CARD (#1)
                    return (
                      <div
                        key={item._id}
                        className="relative overflow-hidden bg-gradient-to-b from-amber-500/[0.14] via-amber-50/60 to-white border-2 border-amber-300/90 rounded-3xl p-6 shadow-[0_12px_40px_rgba(245,158,11,0.22)] ring-4 ring-amber-100/90 flex flex-col justify-between transition-all duration-300 md:-translate-y-2 hover:-translate-y-3.5 hover:shadow-[0_20px_50px_rgba(245,158,11,0.30)] group"
                      >
                        {/* Background Watermark */}
                        <div className="absolute -right-4 -bottom-6 text-9xl font-black text-amber-500/5 select-none pointer-events-none">
                          #1
                        </div>

                        {/* Top Ribbon & Medal */}
                        <div className="flex items-center justify-between mb-5 relative z-10">
                          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-white flex items-center justify-center shadow-lg shadow-amber-500/35 border-2 border-amber-200 shrink-0">
                            <Crown className="w-6 h-6 fill-white text-white drop-shadow-xs" />
                          </div>

                          <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-extrabold text-[11px] px-3.5 py-1.5 rounded-full shadow-md shadow-amber-500/20 tracking-wide">
                            <Sparkles className="w-3.5 h-3.5 fill-white" />
                            <span>{item.badge || 'Campus Champion'}</span>
                          </div>
                        </div>

                        {/* User Identity */}
                        <div className="flex items-center gap-4 mb-5 relative z-10">
                          <div className="w-15 h-15 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-700 to-yellow-600 text-white text-2xl font-black flex items-center justify-center ring-4 ring-amber-300 ring-offset-2 ring-offset-amber-50 shadow-md shrink-0 overflow-hidden">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              user.name?.slice(0, 2).toUpperCase() || 'ST'
                            )}
                          </div>

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-1.5">
                              <p className="font-black text-slate-900 text-lg leading-tight group-hover:text-amber-700 transition-colors truncate">
                                {user.name}
                              </p>
                              <span className="text-xs">🥇</span>
                            </div>
                            <p className="text-xs font-semibold text-amber-950 bg-amber-100/90 px-2.5 py-0.5 rounded-lg border border-amber-200/90 w-fit truncate">
                              {user.branch || 'KNIT Student'} {user.semester ? `• Sem ${user.semester}` : ''}
                            </p>
                          </div>
                        </div>

                        {/* Performance Metrics Row */}
                        <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-amber-200/60 text-center relative z-10">
                          <div className="bg-white/95 backdrop-blur-xs p-2.5 rounded-xl border border-amber-200/90 shadow-2xs">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Notes</p>
                            <p className="font-extrabold text-base text-slate-900 mt-0.5">{item.verifiedUploads}</p>
                          </div>

                          <div className="bg-white/95 backdrop-blur-xs p-2.5 rounded-xl border border-amber-200/90 shadow-2xs">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Downloads</p>
                            <p className="font-extrabold text-base text-blue-700 mt-0.5">{item.totalDownloads}</p>
                          </div>

                          <div className="bg-white/95 backdrop-blur-xs p-2.5 rounded-xl border border-amber-200/90 shadow-2xs">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Rating</p>
                            <p className="font-extrabold text-base text-amber-600 flex items-center justify-center gap-1 mt-0.5">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                              <span>{item.averageRating > 0 ? item.averageRating.toFixed(1) : '5.0'}</span>
                            </p>
                          </div>
                        </div>

                      </div>
                    );
                  }

                  if (rank === 2) {
                    // SILVER PODIUM CARD (#2)
                    return (
                      <div
                        key={item._id}
                        className="relative overflow-hidden bg-gradient-to-b from-slate-400/[0.12] via-slate-100/[0.06] to-white border-2 border-slate-300 rounded-3xl p-6 shadow-[0_10px_30px_rgba(100,116,139,0.14)] ring-4 ring-slate-100 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-lg group"
                      >
                        {/* Background Watermark */}
                        <div className="absolute -right-4 -bottom-6 text-9xl font-black text-slate-500/5 select-none pointer-events-none">
                          #2
                        </div>

                        {/* Top Ribbon & Medal */}
                        <div className="flex items-center justify-between mb-5 relative z-10">
                          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-slate-400 to-slate-600 text-white flex items-center justify-center shadow-md shadow-slate-500/25 border-2 border-slate-200 shrink-0">
                            <Medal className="w-6 h-6 fill-white text-white drop-shadow-xs" />
                          </div>

                          <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white font-extrabold text-[11px] px-3.5 py-1.5 rounded-full shadow-xs tracking-wide">
                            {item.badge || 'Campus Master'}
                          </div>
                        </div>

                        {/* User Identity */}
                        <div className="flex items-center gap-4 mb-5 relative z-10">
                          <div className="w-15 h-15 rounded-2xl bg-gradient-to-tr from-slate-700 via-slate-800 to-slate-950 text-white text-2xl font-black flex items-center justify-center ring-4 ring-slate-200 ring-offset-2 shadow-md shrink-0 overflow-hidden">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              user.name?.slice(0, 2).toUpperCase() || 'ST'
                            )}
                          </div>

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-1.5">
                              <p className="font-black text-slate-900 text-base leading-tight group-hover:text-blue-700 transition-colors truncate">
                                {user.name}
                              </p>
                              <span className="text-xs">🥈</span>
                            </div>
                            <p className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200 w-fit truncate">
                              {user.branch || 'KNIT Student'} {user.semester ? `• Sem ${user.semester}` : ''}
                            </p>
                          </div>
                        </div>

                        {/* Performance Metrics Row */}
                        <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-slate-100 text-center relative z-10">
                          <div className="bg-white/95 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Notes</p>
                            <p className="font-extrabold text-base text-slate-900 mt-0.5">{item.verifiedUploads}</p>
                          </div>

                          <div className="bg-white/95 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Downloads</p>
                            <p className="font-extrabold text-base text-blue-700 mt-0.5">{item.totalDownloads}</p>
                          </div>

                          <div className="bg-white/95 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Rating</p>
                            <p className="font-extrabold text-base text-amber-600 flex items-center justify-center gap-1 mt-0.5">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                              <span>{item.averageRating > 0 ? item.averageRating.toFixed(1) : '5.0'}</span>
                            </p>
                          </div>
                        </div>

                      </div>
                    );
                  }

                  // BRONZE PODIUM CARD (#3)
                  return (
                    <div
                      key={item._id}
                      className="relative overflow-hidden bg-gradient-to-b from-orange-500/[0.12] via-orange-500/[0.04] to-white border-2 border-orange-300/90 rounded-3xl p-6 shadow-[0_10px_30px_rgba(234,88,12,0.14)] ring-4 ring-orange-50 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-lg group"
                    >
                      {/* Background Watermark */}
                      <div className="absolute -right-4 -bottom-6 text-9xl font-black text-orange-500/5 select-none pointer-events-none">
                        #3
                      </div>

                      {/* Top Ribbon & Medal */}
                      <div className="flex items-center justify-between mb-5 relative z-10">
                        <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-600 to-orange-700 text-white flex items-center justify-center shadow-md shadow-orange-500/25 border-2 border-orange-200 shrink-0">
                          <Award className="w-6 h-6 fill-white text-white drop-shadow-xs" />
                        </div>

                        <div className="bg-gradient-to-r from-orange-700 to-amber-800 text-white font-extrabold text-[11px] px-3.5 py-1.5 rounded-full shadow-xs tracking-wide">
                          {item.badge || 'Campus Scholar'}
                        </div>
                      </div>

                      {/* User Identity */}
                      <div className="flex items-center gap-4 mb-5 relative z-10">
                        <div className="w-15 h-15 rounded-2xl bg-gradient-to-tr from-orange-700 via-amber-800 to-amber-950 text-white text-2xl font-black flex items-center justify-center ring-4 ring-orange-200 ring-offset-2 shadow-md shrink-0 overflow-hidden">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            user.name?.slice(0, 2).toUpperCase() || 'ST'
                          )}
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <p className="font-black text-slate-900 text-base leading-tight group-hover:text-amber-800 transition-colors truncate">
                              {user.name}
                            </p>
                            <span className="text-xs">🥉</span>
                          </div>
                          <p className="text-xs font-semibold text-orange-950 bg-orange-100/80 px-2.5 py-0.5 rounded-lg border border-orange-200 w-fit truncate">
                            {user.branch || 'KNIT Student'} {user.semester ? `• Sem ${user.semester}` : ''}
                          </p>
                        </div>
                      </div>

                      {/* Performance Metrics Row */}
                      <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-orange-100 text-center relative z-10">
                        <div className="bg-white/95 backdrop-blur-xs p-2.5 rounded-xl border border-orange-200/80 shadow-2xs">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Notes</p>
                          <p className="font-extrabold text-base text-slate-900 mt-0.5">{item.verifiedUploads}</p>
                        </div>

                        <div className="bg-white/95 backdrop-blur-xs p-2.5 rounded-xl border border-orange-200/80 shadow-2xs">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Downloads</p>
                          <p className="font-extrabold text-base text-blue-700 mt-0.5">{item.totalDownloads}</p>
                        </div>

                        <div className="bg-white/95 backdrop-blur-xs p-2.5 rounded-xl border border-orange-200/80 shadow-2xs">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Rating</p>
                          <p className="font-extrabold text-base text-amber-600 flex items-center justify-center gap-1 mt-0.5">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
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
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs space-y-0">
            <div className="p-5 sm:p-6 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                  All Contributor Rankings
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {contributors.length} verified student {contributors.length === 1 ? 'contributor' : 'contributors'} ranked
                </p>
              </div>

              <span className="text-xs font-bold text-blue-800 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
                KNIT Sultanpur
              </span>
            </div>

            <div className="divide-y divide-slate-100 overflow-x-auto">
              {contributors.map((item) => {
                const rank = item.rank;
                const user = item.user;

                return (
                  <div
                    key={item._id}
                    className="p-4 sm:p-5 hover:bg-slate-50/90 transition-colors flex items-center justify-between gap-4 min-w-[540px]"
                  >
                    {/* Rank + User Identity */}
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="w-9 text-center shrink-0">
                        {rank === 1 && <span className="text-xl">🥇</span>}
                        {rank === 2 && <span className="text-xl">🥈</span>}
                        {rank === 3 && <span className="text-xl">🥉</span>}
                        {rank > 3 && (
                          <span className="font-extrabold text-sm text-slate-400">
                            #{rank}
                          </span>
                        )}
                      </div>

                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-800 text-white flex items-center justify-center font-extrabold text-sm shrink-0 overflow-hidden shadow-2xs">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          user.name?.slice(0, 2).toUpperCase() || 'ST'
                        )}
                      </div>

                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {user.name}
                          </p>
                          <span className="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200/90 px-2 py-0.5 rounded-md shrink-0">
                            {item.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          {user.branch || 'KNIT Student'} {user.semester ? `• Sem ${user.semester}` : ''}
                        </p>
                      </div>
                    </div>

                    {/* Stats columns */}
                    <div className="flex items-center gap-7 sm:gap-9 text-right shrink-0">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Verified Notes</p>
                        <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                          {item.verifiedUploads}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Downloads</p>
                        <p className="text-sm font-extrabold text-blue-700 mt-0.5">
                          {item.totalDownloads}
                        </p>
                      </div>

                      <div className="w-18">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Rating</p>
                        <p className="text-sm font-extrabold text-amber-700 flex items-center justify-end gap-1 mt-0.5">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
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
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 bg-blue-600/60 border border-blue-400/40 px-3 py-1 rounded-full text-xs font-semibold">
            <Award className="w-3.5 h-3.5 text-amber-300" />
            <span>Join the Community of Contributors</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold">Have handwritten notes or solved papers?</h3>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed">
            Upload your academic materials to earn contributor badges, help junior batchmates ace their exams, and rank on the Campus Leaderboard.
          </p>
        </div>

        <Link to="/upload" className="shrink-0">
          <Button
            size="lg"
            variant="outline"
            icon={Upload}
            className="bg-white text-blue-900 hover:bg-blue-50 border-white font-bold cursor-pointer shadow-md"
          >
            Upload Study Material
          </Button>
        </Link>
      </div>

    </div>
  );
}
