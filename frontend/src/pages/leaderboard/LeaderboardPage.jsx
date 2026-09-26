import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../../services/api';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import {
  Trophy,
  Upload,
  Download,
  Star,
  BookOpen,
  Filter,
  Users,
  ChevronDown,
  ArrowUpDown
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

// Helper to extract uppercase first letter of user's name
function getUserInitial(name) {
  if (!name || typeof name !== 'string') return 'S';
  const cleanName = name.trim();
  return cleanName.charAt(0).toUpperCase();
}

// Helper to get consistent background colors for initial avatars
function getAvatarColorClass(name, rank) {
  if (rank === 1) return 'bg-amber-500 text-white';
  if (rank === 2) return 'bg-slate-700 text-white';
  if (rank === 3) return 'bg-orange-600 text-white';

  const colors = [
    'bg-blue-700 text-white',
    'bg-purple-700 text-white',
    'bg-rose-700 text-white',
    'bg-emerald-700 text-white',
    'bg-indigo-700 text-white',
    'bg-cyan-700 text-white',
    'bg-teal-700 text-white',
    'bg-amber-700 text-white'
  ];

  let hash = 0;
  if (name) {
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

// Short branch name acronym helper
function getShortBranch(branch) {
  if (!branch) return 'KNIT';
  const b = branch.toLowerCase();
  if (b.includes('computer science') || b.includes('cse')) return 'CSE';
  if (b.includes('information technology') || b.includes('it')) return 'IT';
  if (b.includes('electronics') || b.includes('ece')) return 'ECE';
  if (b.includes('electrical') || b.includes('ee')) return 'EE';
  if (b.includes('mechanical') || b.includes('me')) return 'ME';
  if (b.includes('civil') || b.includes('ce')) return 'CE';
  if (b.includes('master of computer applications') || b.includes('mca')) return 'MCA';
  return branch;
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

  const top1 = contributors[0];
  const top2 = contributors[1];
  const top3 = contributors[2];

  return (
    <div className="space-y-8 py-4 max-w-7xl mx-auto">
      
      {/* 1. Header Banner (Dark Navy Gradient matching exact reference UI) */}
      <div className="bg-gradient-to-r from-[#172554] via-[#1e3a8a] to-[#1e1b4b] rounded-3xl p-6 sm:p-8 shadow-xl text-white relative overflow-hidden">
        {/* Subtle background glow highlights */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          {/* Left Title & Metadata */}
          <div className="flex items-start gap-4 max-w-2xl">
            <div className="w-12 h-12 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-400 flex items-center justify-center shrink-0 shadow-lg mt-1">
              <Trophy className="w-6 h-6 fill-amber-400 text-amber-500" />
            </div>

            <div className="space-y-1.5">
              <p className="text-blue-200 text-xs font-semibold tracking-wide uppercase">
                Campus Academic Honor Roll
              </p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                Top Contributors Leaderboard
              </h1>
              <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed font-normal">
                Recognizing dedicated KNITians who empower junior and peer batches with verified handwritten lecture notes, exam guides, and solved question papers.
              </p>
            </div>
          </div>

          {/* Right Cursive Script & CTA Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 shrink-0 w-full lg:w-auto justify-between lg:justify-end">
            <div className="hidden lg:block text-right">
              <span className="font-serif italic text-blue-100/90 text-xl tracking-widest block select-none drop-shadow-xs">
                Learn • Share • Grow
              </span>
              <div className="w-36 h-0.5 bg-gradient-to-r from-transparent via-blue-300/40 to-transparent ml-auto mt-1"></div>
            </div>

            <Link to="/upload" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="md"
                icon={Upload}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg border-transparent cursor-pointer"
              >
                Upload & Join Leaderboard
              </Button>
            </Link>
          </div>

        </div>
      </div>

      {/* 2. Filter and Sorting Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        
        {/* Sort Criteria Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none min-w-0">
          {SORT_OPTIONS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedSort === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedSort(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/90 font-medium'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Branch Selector Filter */}
        <div className="flex items-center gap-2.5 sm:max-w-xs w-full justify-end">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="relative w-full">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full text-xs py-2 pl-3.5 pr-8 bg-slate-50 border border-slate-200/90 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none cursor-pointer"
            >
              {BRANCH_OPTIONS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="py-24">
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
        <div className="py-16 bg-white border border-slate-200 rounded-3xl text-center">
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
          
          {/* 3. Top 3 Contributors Podium Showcase (Sleek, Compact, & Modern) */}
          <div className="bg-gradient-to-b from-slate-900/5 via-blue-50/40 to-slate-50/80 rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs">
            <div className="text-center mb-5">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-700 bg-blue-100/80 px-3 py-1 rounded-full border border-blue-200">
                Top Student Contributors
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end max-w-4xl mx-auto">
              
              {/* RANK 2 (Left - Silver) */}
              <div className="order-2 sm:order-1">
                {top2 ? (
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col items-center text-center relative overflow-hidden group hover:border-slate-300 transition-all">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-300 via-slate-400 to-slate-300"></div>
                    
                    {/* Rank Badge */}
                    <div className="flex items-center gap-1 bg-slate-100 text-slate-700 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full border border-slate-200 mb-3">
                      <span>🥈</span> Rank #2
                    </div>

                    {/* Avatar */}
                    <div className={`w-14 h-14 rounded-full border-2 border-slate-300 ${getAvatarColorClass(top2.user?.name, 2)} flex items-center justify-center font-extrabold text-xl shadow-xs mb-2`}>
                      {getUserInitial(top2.user?.name)}
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-sm truncate w-full">
                      {top2.user?.name || 'Contributor'}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium truncate w-full mb-3">
                      {getShortBranch(top2.user?.branch)} • Sem {top2.user?.semester || '5'}
                    </p>

                    <div className="grid grid-cols-3 gap-1 w-full pt-2.5 border-t border-slate-100 text-center">
                      <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                        <p className="text-[8px] text-slate-400 font-bold uppercase">NOTES</p>
                        <p className="font-extrabold text-xs text-slate-900 mt-0.5">{top2.verifiedUploads}</p>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                        <p className="text-[8px] text-slate-400 font-bold uppercase">DOWNLOADS</p>
                        <p className="font-extrabold text-xs text-slate-900 mt-0.5">{top2.totalDownloads}</p>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                        <p className="text-[8px] text-slate-400 font-bold uppercase">RATING</p>
                        <p className="font-extrabold text-xs text-amber-600 flex items-center justify-center gap-0.5 mt-0.5">
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500" />
                          <span>{top2.averageRating > 0 ? top2.averageRating.toFixed(1) : '4.5'}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/70 border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-400 text-xs font-semibold flex flex-col items-center justify-center gap-1 h-[210px]">
                    <span className="text-xl">🥈</span>
                    <span className="font-bold text-slate-600">Spot #2 Open</span>
                    <span className="text-[10px] text-slate-400">Upload notes to claim</span>
                  </div>
                )}
              </div>

              {/* RANK 1 (Center - Gold Champion) */}
              <div className="order-1 sm:order-2">
                {top1 ? (
                  <div className="bg-gradient-to-b from-amber-500/10 via-white to-amber-50/40 rounded-2xl p-4 border-2 border-amber-400 shadow-md flex flex-col items-center text-center relative overflow-hidden group hover:shadow-lg transition-all sm:-translate-y-2">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500"></div>

                    {/* Champion Badge */}
                    <div className="flex items-center gap-1 bg-amber-400 text-amber-950 font-black text-[10px] px-3 py-0.5 rounded-full shadow-2xs uppercase tracking-wider mb-2.5">
                      <span>👑</span> #1 Top Champion
                    </div>

                    {/* Avatar */}
                    <div className={`w-16 h-16 rounded-full border-4 border-amber-400 ${getAvatarColorClass(top1.user?.name, 1)} flex items-center justify-center font-extrabold text-2xl shadow-md mb-2`}>
                      {getUserInitial(top1.user?.name)}
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-base truncate w-full flex items-center justify-center gap-1">
                      <span>{top1.user?.name || 'Top Contributor'}</span>
                      <span className="text-xs">🏅</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium truncate w-full mb-3">
                      {getShortBranch(top1.user?.branch)} • Sem {top1.user?.semester || '5'}
                    </p>

                    <div className="grid grid-cols-3 gap-1 w-full pt-2.5 border-t border-amber-200/60 text-center">
                      <div className="bg-amber-50/80 p-1.5 rounded-xl border border-amber-100">
                        <p className="text-[8px] text-slate-400 font-bold uppercase">NOTES</p>
                        <p className="font-extrabold text-xs text-slate-900 mt-0.5">{top1.verifiedUploads}</p>
                      </div>
                      <div className="bg-amber-50/80 p-1.5 rounded-xl border border-amber-100">
                        <p className="text-[8px] text-slate-400 font-bold uppercase">DOWNLOADS</p>
                        <p className="font-extrabold text-xs text-slate-900 mt-0.5">{top1.totalDownloads}</p>
                      </div>
                      <div className="bg-amber-50/80 p-1.5 rounded-xl border border-amber-100">
                        <p className="text-[8px] text-slate-400 font-bold uppercase">RATING</p>
                        <p className="font-extrabold text-xs text-amber-700 flex items-center justify-center gap-0.5 mt-0.5">
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500" />
                          <span>{top1.averageRating > 0 ? top1.averageRating.toFixed(1) : '3.0'}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/70 border-2 border-dashed border-amber-300 rounded-2xl p-6 text-center text-slate-400 text-xs font-semibold flex flex-col items-center justify-center gap-1 h-[225px]">
                    <span className="text-2xl">👑</span>
                    <span className="font-bold text-slate-700">Spot #1 Open</span>
                    <span className="text-[10px] text-slate-400">Be the first to upload</span>
                  </div>
                )}
              </div>

              {/* RANK 3 (Right - Bronze) */}
              <div className="order-3">
                {top3 ? (
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col items-center text-center relative overflow-hidden group hover:border-slate-300 transition-all">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700"></div>

                    {/* Rank Badge */}
                    <div className="flex items-center gap-1 bg-amber-100 text-amber-900 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full border border-amber-200 mb-3">
                      <span>🥉</span> Rank #3
                    </div>

                    {/* Avatar */}
                    <div className={`w-14 h-14 rounded-full border-2 border-amber-600/60 ${getAvatarColorClass(top3.user?.name, 3)} flex items-center justify-center font-extrabold text-xl shadow-xs mb-2`}>
                      {getUserInitial(top3.user?.name)}
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-sm truncate w-full">
                      {top3.user?.name || 'Contributor'}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium truncate w-full mb-3">
                      {getShortBranch(top3.user?.branch)} • Sem {top3.user?.semester || '5'}
                    </p>

                    <div className="grid grid-cols-3 gap-1 w-full pt-2.5 border-t border-slate-100 text-center">
                      <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                        <p className="text-[8px] text-slate-400 font-bold uppercase">NOTES</p>
                        <p className="font-extrabold text-xs text-slate-900 mt-0.5">{top3.verifiedUploads}</p>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                        <p className="text-[8px] text-slate-400 font-bold uppercase">DOWNLOADS</p>
                        <p className="font-extrabold text-xs text-slate-900 mt-0.5">{top3.totalDownloads}</p>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                        <p className="text-[8px] text-slate-400 font-bold uppercase">RATING</p>
                        <p className="font-extrabold text-xs text-amber-600 flex items-center justify-center gap-0.5 mt-0.5">
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500" />
                          <span>{top3.averageRating > 0 ? top3.averageRating.toFixed(1) : '4.2'}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/70 border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-400 text-xs font-semibold flex flex-col items-center justify-center gap-1 h-[210px]">
                    <span className="text-xl">🥉</span>
                    <span className="font-bold text-slate-600">Spot #3 Open</span>
                    <span className="text-[10px] text-slate-400">Upload notes to claim</span>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* 4. All Contributor Rankings Table */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            
            {/* Table Header Console */}
            <div className="p-4 sm:p-5 bg-white border-b border-slate-200/80 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    All Contributor Rankings
                  </h3>
                  <p className="text-xs text-slate-400">
                    {contributors.length} verified student {contributors.length === 1 ? 'contributor' : 'contributors'} ranked
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50/80 px-3 py-1 rounded-full border border-blue-200/80">
                <span>📍 KNIT Sultanpur</span>
              </div>
            </div>

            {/* Desktop Table Headers */}
            <div className="hidden md:grid grid-cols-12 gap-2 bg-slate-50/80 px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200/80 items-center">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-4">Contributor</div>
              <div className="col-span-2 flex items-center gap-1">
                <span>Branch</span>
                <ArrowUpDown className="w-3 h-3 text-slate-300" />
              </div>
              <div className="col-span-1 text-center flex items-center justify-center gap-1">
                <span>Semester</span>
                <ArrowUpDown className="w-3 h-3 text-slate-300" />
              </div>
              <div className="col-span-1 text-center flex items-center justify-center gap-1">
                <span>Notes</span>
                <ArrowUpDown className="w-3 h-3 text-slate-300" />
              </div>
              <div className="col-span-1 text-center flex items-center justify-center gap-1">
                <span>Downloads</span>
                <ArrowUpDown className="w-3 h-3 text-slate-300" />
              </div>
              <div className="col-span-1 text-center flex items-center justify-center gap-1">
                <span>Rating</span>
                <ArrowUpDown className="w-3 h-3 text-slate-300" />
              </div>
              <div className="col-span-1 text-right">Badge</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-slate-100">
              {contributors.map((item) => {
                const rank = item.rank;
                const user = item.user || {};
                const name = user.name || 'Contributor';
                const initial = getUserInitial(name);

                // Row Highlights based on Rank
                const isRank1 = rank === 1;
                const isRank2 = rank === 2;
                const isRank3 = rank === 3;

                const rowBgClass = isRank1
                  ? 'bg-[#FFFDF0] hover:bg-[#FFF9E6] border-l-4 border-amber-400'
                  : isRank2
                  ? 'bg-slate-50/50 hover:bg-slate-100/60 border-l-4 border-slate-300'
                  : isRank3
                  ? 'bg-amber-50/20 hover:bg-amber-50/40 border-l-4 border-orange-300'
                  : 'hover:bg-slate-50/70 border-l-4 border-transparent';

                return (
                  <div
                    key={item._id}
                    className={`p-4 sm:px-5 transition-colors ${rowBgClass}`}
                  >
                    {/* Desktop Single Line Grid Layout */}
                    <div className="hidden md:grid grid-cols-12 gap-2 items-center text-xs">
                      
                      {/* Rank # */}
                      <div className="col-span-1 text-center font-bold">
                        {isRank1 ? (
                          <span className="w-7 h-7 rounded-full bg-amber-400 text-amber-950 font-extrabold flex items-center justify-center mx-auto text-xs shadow-2xs">
                            1
                          </span>
                        ) : isRank2 ? (
                          <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-800 font-extrabold flex items-center justify-center mx-auto text-xs shadow-2xs">
                            2
                          </span>
                        ) : isRank3 ? (
                          <span className="w-7 h-7 rounded-full bg-orange-200 text-orange-900 font-extrabold flex items-center justify-center mx-auto text-xs shadow-2xs">
                            3
                          </span>
                        ) : (
                          <span className="text-slate-400 font-bold text-xs">
                            {rank}
                          </span>
                        )}
                      </div>

                      {/* Contributor Profile (Initial Avatar + Name) */}
                      <div className="col-span-4 flex items-center gap-3 min-w-0">
                        {/* Circular Avatar displaying First-Letter Initial */}
                        <div className={`w-9 h-9 rounded-full ${getAvatarColorClass(name, rank)} flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs`}>
                          {initial}
                        </div>

                        <div className="min-w-0 truncate space-y-0.5">
                          <p className="font-bold text-slate-900 text-sm truncate flex items-center gap-1">
                            <span>{name}</span>
                            {isRank1 && <span className="text-xs">🏅</span>}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate font-medium">
                            {user.branch || 'KNIT'} {user.semester ? `• Sem ${user.semester}` : ''}
                          </p>
                        </div>
                      </div>

                      {/* Branch */}
                      <div className="col-span-2 font-bold text-slate-800 text-xs">
                        {getShortBranch(user.branch)}
                      </div>

                      {/* Semester */}
                      <div className="col-span-1 text-center font-semibold text-slate-700 text-xs">
                        {user.semester || '-'}
                      </div>

                      {/* Notes */}
                      <div className="col-span-1 text-center font-bold text-slate-900 text-xs flex items-center justify-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.verifiedUploads}</span>
                      </div>

                      {/* Downloads */}
                      <div className="col-span-1 text-center font-bold text-slate-900 text-xs flex items-center justify-center gap-1">
                        <Download className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.totalDownloads}</span>
                      </div>

                      {/* Rating */}
                      <div className="col-span-1 text-center font-bold text-amber-700 text-xs flex items-center justify-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        <span>{item.averageRating > 0 ? item.averageRating.toFixed(1) : '3.0'}</span>
                      </div>

                      {/* Role Tag / Badge */}
                      <div className="col-span-1 text-right">
                        {isRank1 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold">
                            <span>👑</span> Top Contributor
                          </span>
                        ) : isRank2 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-300 text-[10px] font-bold">
                            <span>★</span> Rising Star
                          </span>
                        ) : isRank3 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-900 border border-orange-300 text-[10px] font-bold">
                            <span>★</span> Top Rated
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs font-semibold">-</span>
                        )}
                      </div>

                    </div>

                    {/* Mobile Card Layout (< md screens) */}
                    <div className="md:hidden space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="font-extrabold text-xs text-slate-400 w-5">
                            #{rank}
                          </span>
                          <div className={`w-8 h-8 rounded-full ${getAvatarColorClass(name, rank)} flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}>
                            {initial}
                          </div>
                          <div className="min-w-0 truncate">
                            <p className="font-bold text-slate-900 text-xs truncate">{name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{getShortBranch(user.branch)} • Sem {user.semester || '5'}</p>
                          </div>
                        </div>

                        <div>
                          {isRank1 ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-bold">
                              Top Contributor
                            </span>
                          ) : isRank2 ? (
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-300 text-[9px] font-bold">
                              Rising Star
                            </span>
                          ) : isRank3 ? (
                            <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-900 border border-orange-300 text-[9px] font-bold">
                              Top Rated
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100/80 text-center text-xs">
                        <div className="bg-slate-50/90 p-1.5 rounded-lg border border-slate-100">
                          <p className="text-[9px] text-slate-400 font-semibold uppercase">Notes</p>
                          <p className="font-bold text-slate-900 mt-0.5">{item.verifiedUploads}</p>
                        </div>
                        <div className="bg-slate-50/90 p-1.5 rounded-lg border border-slate-100">
                          <p className="text-[9px] text-slate-400 font-semibold uppercase">Downloads</p>
                          <p className="font-bold text-slate-900 mt-0.5">{item.totalDownloads}</p>
                        </div>
                        <div className="bg-slate-50/90 p-1.5 rounded-lg border border-slate-100">
                          <p className="text-[9px] text-slate-400 font-semibold uppercase">Rating</p>
                          <p className="font-bold text-amber-600 flex items-center justify-center gap-0.5 mt-0.5">
                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500" />
                            <span>{item.averageRating > 0 ? item.averageRating.toFixed(1) : '3.0'}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
