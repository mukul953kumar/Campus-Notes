import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { resourceService } from '../../services/api';
import ResourceRow from '../../components/resources/ResourceRow';
import Pagination from '../../components/common/Pagination';
import SearchInput from '../../components/common/SearchInput';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Select from '../../components/common/Select';
import {
  HelpCircle,
  Calendar,
  Filter,
  Upload,
  RefreshCw,
  FolderOpen,
  SearchX,
  FileText,
  GraduationCap
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

  const [savedIds, setSavedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('campus_notes_saved_ids') || '[]');
    } catch {
      return [];
    }
  });

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

  const handleToggleSave = (resourceId) => {
    setSavedIds((prev) => {
      const exists = prev.includes(resourceId);
      const next = exists ? prev.filter((id) => id !== resourceId) : [...prev, resourceId];
      localStorage.setItem('campus_notes_saved_ids', JSON.stringify(next));
      return next;
    });
  };

  const hasActiveFilters = Boolean(
    searchQuery || currentExamType || currentExamYear || currentBranch || currentSemester
  );

  return (
    <div className="space-y-6 py-2">
      
      {/* Hero Banner for PYQ Hub */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
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
              className="bg-white text-purple-900 hover:bg-purple-50 border-white font-bold"
            >
              Upload PYQ Paper
            </Button>
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <SearchInput
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Search PYQ by subject (e.g. DBMS, DAA, OS, BCS-501)..."
      />

      {/* Exam Type Tabs & Year Pills */}
      <div className="space-y-3">
        {/* Exam Type Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 scrollbar-none">
          {EXAM_TYPE_TABS.map((tab) => {
            const isActive = currentExamType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleExamTypeChange(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-purple-700 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-white border border-slate-200'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filter Strip: Year Selector + Branch + Semester */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-wrap items-center gap-3">
          
          {/* Exam Year Pills */}
          <div className="flex items-center gap-1 overflow-x-auto">
            <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Year:</span>
            </span>
            {YEAR_OPTIONS.map((yr) => (
              <button
                key={yr || 'all'}
                type="button"
                onClick={() => handleYearChange(yr)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  currentExamYear === yr
                    ? 'bg-purple-100 text-purple-800 font-bold border border-purple-200'
                    : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                }`}
              >
                {yr || 'All Years'}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

          {/* Branch & Semester Dropdowns */}
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Select
              placeholder=""
              value={currentBranch}
              onChange={(e) => handleParamChange('branch', e.target.value)}
              options={BRANCH_OPTIONS}
              className="text-xs py-1"
            />
            <Select
              placeholder=""
              value={currentSemester}
              onChange={(e) => handleParamChange('semester', e.target.value)}
              options={SEMESTER_OPTIONS}
              className="text-xs py-1"
            />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs text-rose-600 font-medium hover:underline cursor-pointer ml-auto"
            >
              Reset Filters
            </button>
          )}

        </div>
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

      {/* PYQ Papers Dense List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-4 sm:px-6 py-3 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 font-medium">
          <span>
            {isLoading
              ? 'Loading PYQ papers...'
              : `${pyqs.length} Question ${pyqs.length === 1 ? 'Paper' : 'Papers'} Available`}
          </span>
          <button
            type="button"
            onClick={fetchPYQs}
            className="flex items-center gap-1 hover:text-purple-700 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {isLoading ? (
          <div className="py-16">
            <Loader message="Loading examination archives..." size="md" />
          </div>
        ) : pyqs.length === 0 ? (
          <div className="p-8">
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
