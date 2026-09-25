import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { resourceService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ResourceRow from '../../components/resources/ResourceRow';
import Pagination from '../../components/common/Pagination';
import SearchInput from '../../components/common/SearchInput';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import {
  HelpCircle,
  Calendar,
  Upload,
  RefreshCw,
  SearchX,
  GraduationCap,
  SlidersHorizontal,
  ChevronDown,
  X
} from 'lucide-react';

const YEAR_OPTIONS = ['', '2024', '2023', '2022', '2021', '2020', '2019'];

const EXAM_TYPE_TABS = [
  { id: '', label: 'All Exam Papers' },
  { id: 'End-Sem', label: 'End Semester' },
  { id: 'Mid-Sem', label: 'Mid-Sem / Sessional' },
  { id: 'Class Test', label: 'Class Tests' },
];

const BRANCH_OPTIONS = [
  { value: '', label: 'All Branches' },
  { value: 'Computer Science & Engineering', label: 'Computer Science (CSE)' },
  { value: 'Information Technology', label: 'Information Technology (IT)' },
  { value: 'Electronics Engineering', label: 'Electronics (ECE)' },
  { value: 'Electrical Engineering', label: 'Electrical (EE)' },
  { value: 'Mechanical Engineering', label: 'Mechanical (ME)' },
  { value: 'Civil Engineering', label: 'Civil (CE)' },
  { value: 'Master of Computer Applications', label: 'MCA' },
];

const SEMESTER_OPTIONS = [
  { value: '', label: 'All Semesters' },
  { value: '1', label: 'Semester 1' },
  { value: '2', label: 'Semester 2' },
  { value: '3', label: 'Semester 3' },
  { value: '4', label: 'Semester 4' },
  { value: '5', label: 'Semester 5' },
  { value: '6', label: 'Semester 6' },
  { value: '7', label: 'Semester 7' },
  { value: '8', label: 'Semester 8' },
];

export default function PYQPage() {
  const { savedIds, toggleBookmark } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get('q') || '';
  const currentExamType = searchParams.get('examType') || '';
  const currentExamYear = searchParams.get('examYear') || '';
  const currentBranch = searchParams.get('branch') || '';
  const currentSemester = searchParams.get('semester') || '';
  const currentPage = Number(searchParams.get('page')) || 1;

  const [pyqs, setPyqs] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isFilterExpandedMobile, setIsFilterExpandedMobile] = useState(false);

  const fetchPYQs = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await resourceService.getResources({
        resourceType: 'pyq',
        search: searchQuery,
        examYear: currentExamYear,
        branch: currentBranch,
        semester: currentSemester,
        page: currentPage,
        limit: 20,
      });

      if (response && response.data) {
        let items = response.data;
        if (currentExamType) {
          items = items.filter((item) => item.examType === currentExamType);
        }
        setPyqs(items);
        if (response.meta) {
          setMeta(response.meta);
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to fetch PYQ papers.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, currentExamYear, currentExamType, currentBranch, currentSemester, currentPage]);

  useEffect(() => {
    fetchPYQs();
  }, [fetchPYQs]);

  const handleSearchChange = (term) => {
    const nextParams = new URLSearchParams(searchParams);
    if (term.trim()) {
      nextParams.set('q', term.trim());
    } else {
      nextParams.delete('q');
    }
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const handleExamTypeChange = (type) => {
    const nextParams = new URLSearchParams(searchParams);
    if (type) {
      nextParams.set('examType', type);
    } else {
      nextParams.delete('examType');
    }
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const handleYearChange = (year) => {
    const nextParams = new URLSearchParams(searchParams);
    if (year) {
      nextParams.set('examYear', year);
    } else {
      nextParams.delete('examYear');
    }
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const handleParamChange = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const handleClearFilters = () => {
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', String(newPage));
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleSave = async (resourceId) => {
    try {
      await toggleBookmark(resourceId);
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  const hasActiveFilters = Boolean(
    searchQuery || currentExamType || currentExamYear || currentBranch || currentSemester
  );

  return (
    <div className="space-y-8 py-4">
      
      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-purple-200 text-xs font-semibold backdrop-blur-xs">
          <GraduationCap className="w-4 h-4 text-purple-300" />
          <span>Official Examination Papers Archive</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Previous Year Question Papers (PYQ)
            </h1>
            <p className="text-xs sm:text-sm text-purple-200 mt-1.5 max-w-2xl leading-relaxed">
              Solve real End-Semester and Sessional examination papers from past academic years of KNIT Sultanpur.
            </p>
          </div>

          <Link to="/upload" className="shrink-0 self-start sm:self-auto">
            <Button
              variant="outline"
              size="md"
              icon={Upload}
              className="bg-white text-purple-900 hover:bg-purple-50 border-white font-bold cursor-pointer"
            >
              Upload PYQ Paper
            </Button>
          </Link>
        </div>
      </div>

      {/* Unified PYQ Search & Discovery Console */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
        
        {/* Search Input */}
        <div>
          <SearchInput
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search PYQ by subject (e.g. DBMS, DAA, OS, BCS-501)..."
          />
        </div>

        {/* Exam Type Segmented Tabs */}
        <div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {EXAM_TYPE_TABS.map((tab) => {
              const isActive = currentExamType === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleExamTypeChange(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-purple-700 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-slate-50 border border-slate-200/80 font-medium'
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed Academic Filters & Year Pills */}
        <div className="pt-2 border-t border-slate-100">
          
          {/* Mobile Filter Toggle */}
          <div className="flex sm:hidden items-center justify-between">
            <button
              type="button"
              onClick={() => setIsFilterExpandedMobile(!isFilterExpandedMobile)}
              className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-purple-700" />
              <span>Filter by Year & Branch</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isFilterExpandedMobile ? 'rotate-180' : ''}`} />
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs text-rose-600 font-semibold hover:underline"
              >
                Reset
              </button>
            )}
          </div>

          <div className={`${isFilterExpandedMobile ? 'block' : 'hidden'} sm:flex sm:flex-wrap sm:items-center sm:justify-between gap-4 pt-3 sm:pt-0`}>
            
            {/* Exam Year Selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1 shrink-0">
                <Calendar className="w-3.5 h-3.5 text-purple-700" />
                <span>Year:</span>
              </span>
              {YEAR_OPTIONS.map((yr) => (
                <button
                  key={yr || 'all'}
                  type="button"
                  onClick={() => handleYearChange(yr)}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    currentExamYear === yr
                      ? 'bg-purple-100 text-purple-900 font-bold border border-purple-300'
                      : 'text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 font-medium'
                  }`}
                >
                  {yr || 'All Years'}
                </button>
              ))}
            </div>

            {/* Branch & Semester Dropdowns */}
            <div className="flex items-center gap-2 min-w-[260px] sm:min-w-[340px] pt-2 sm:pt-0">
              <Select
                placeholder=""
                value={currentBranch}
                onChange={(e) => handleParamChange('branch', e.target.value)}
                options={BRANCH_OPTIONS}
                className="text-xs py-2"
              />
              <Select
                placeholder=""
                value={currentSemester}
                onChange={(e) => handleParamChange('semester', e.target.value)}
                options={SEMESTER_OPTIONS}
                className="text-xs py-2"
              />
            </div>

          </div>
        </div>

        {/* Active Filters Bar */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-400 font-semibold">Active Criteria:</span>
            {searchQuery && (
              <span className="bg-purple-50 text-purple-800 px-2.5 py-1 rounded-lg border border-purple-200 flex items-center gap-1.5 font-medium">
                <span>Search: "{searchQuery}"</span>
                <button type="button" onClick={() => handleSearchChange('')} className="hover:text-purple-950 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {currentExamType && (
              <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 font-medium">
                Type: {currentExamType}
              </span>
            )}
            {currentExamYear && (
              <span className="bg-purple-50 text-purple-800 px-2.5 py-1 rounded-lg border border-purple-200 font-medium">
                Year: {currentExamYear}
              </span>
            )}
            {currentBranch && (
              <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 font-medium">
                Branch: {currentBranch}
              </span>
            )}
            {currentSemester && (
              <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 font-medium">
                Sem {currentSemester}
              </span>
            )}
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold hover:underline cursor-pointer ml-1"
            >
              Clear all
            </button>
          </div>
        )}

      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center justify-between">
          <span>{errorMessage}</span>
          <Button size="sm" variant="outline" onClick={fetchPYQs}>
            Retry
          </Button>
        </div>
      )}

      {/* PYQ Papers Dense List Card */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 sm:px-6 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-sm">
              {isLoading
                ? 'Loading PYQ papers...'
                : `${pyqs.length} Question ${pyqs.length === 1 ? 'Paper' : 'Papers'} Available`}
            </span>
          </div>

          <button
            type="button"
            onClick={fetchPYQs}
            className="flex items-center gap-1.5 hover:text-purple-700 transition-colors cursor-pointer font-medium"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {isLoading ? (
          <div className="py-20">
            <Loader message="Loading examination archives..." size="md" />
          </div>
        ) : pyqs.length === 0 ? (
          <div className="p-8 sm:p-12">
            <EmptyState
              icon={searchQuery ? SearchX : HelpCircle}
              title={searchQuery ? `No PYQs matching "${searchQuery}"` : 'No Question Papers Found'}
              description={
                hasActiveFilters
                  ? 'No examination papers match the current year or branch filters. Try resetting filters.'
                  : 'Be the first to upload previous year question papers for your branch.'
              }
              actionLabel={hasActiveFilters ? 'Clear Filters' : 'Upload Question Paper'}
              onAction={hasActiveFilters ? handleClearFilters : () => (window.location.href = '/upload')}
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pyqs.map((item) => (
              <ResourceRow
                key={item._id}
                resource={item}
                isSaved={savedIds.includes(item._id)}
                onToggleSave={handleToggleSave}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {!isLoading && pyqs.length > 0 && (
        <Pagination
          currentPage={meta.page}
          totalPages={meta.totalPages}
          totalItems={meta.total}
          itemsPerPage={meta.limit}
          onPageChange={handlePageChange}
        />
      )}

    </div>
  );
}
