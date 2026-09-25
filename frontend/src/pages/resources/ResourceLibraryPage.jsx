import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { resourceService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ResourceRow from '../../components/resources/ResourceRow';
import Pagination from '../../components/common/Pagination';
import SearchInput from '../../components/common/SearchInput';
import Select from '../../components/common/Select';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import {
  BookOpen,
  Filter,
  Upload,
  RefreshCw,
  FolderOpen,
  HelpCircle,
  FileCheck,
  Code,
  FileText,
  SearchX,
  X,
  Sparkles,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

const TYPE_TABS = [
  { id: '', label: 'All Resources' },
  { id: 'notes', label: 'Notes', icon: BookOpen },
  { id: 'pyq', label: 'PYQ Papers', icon: HelpCircle },
  { id: 'assignment', label: 'Assignments', icon: FileCheck },
  { id: 'practical', label: 'Practicals', icon: Code },
  { id: 'syllabus', label: 'Syllabus', icon: FileText },
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

const UNIT_OPTIONS = [
  { value: '', label: 'All Units' },
  { value: '1', label: 'Unit 1' },
  { value: '2', label: 'Unit 2' },
  { value: '3', label: 'Unit 3' },
  { value: '4', label: 'Unit 4' },
  { value: '5', label: 'Unit 5' },
];

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popular', label: 'Most Downloaded' },
  { value: 'title', label: 'Title (A-Z)' },
];

export default function ResourceLibraryPage() {
  const { user, savedIds, toggleBookmark } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get('q') || searchParams.get('search') || '';
  const currentType = searchParams.get('type') || '';
  const currentBranch = searchParams.get('branch') || '';
  const currentSemester = searchParams.get('semester') || '';
  const currentUnit = searchParams.get('unit') || '';
  const currentSortBy = searchParams.get('sortBy') || 'recent';
  const currentPage = Number(searchParams.get('page')) || 1;

  const [resources, setResources] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isFilterExpandedMobile, setIsFilterExpandedMobile] = useState(false);

  const fetchResources = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await resourceService.getResources({
        search: searchQuery,
        resourceType: currentType,
        branch: currentBranch,
        semester: currentSemester,
        unit: currentUnit,
        sortBy: currentSortBy,
        page: currentPage,
        limit: 20,
      });

      if (response && response.data) {
        setResources(response.data);
        if (response.meta) {
          setMeta(response.meta);
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to fetch academic resources.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, currentType, currentBranch, currentSemester, currentUnit, currentSortBy, currentPage]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleSearchChange = (term) => {
    const nextParams = new URLSearchParams(searchParams);
    if (term.trim()) {
      nextParams.set('q', term.trim());
    } else {
      nextParams.delete('q');
      nextParams.delete('search');
    }
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const handleTabChange = (typeId) => {
    const nextParams = new URLSearchParams(searchParams);
    if (typeId) {
      nextParams.set('type', typeId);
    } else {
      nextParams.delete('type');
    }
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const handleFilterChange = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const handleResetFilters = () => {
    const nextParams = new URLSearchParams();
    if (searchQuery) nextParams.set('q', searchQuery);
    if (currentType) nextParams.set('type', currentType);
    setSearchParams(nextParams);
  };

  const handleClearAll = () => {
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

  const activeFiltersCount = [currentBranch, currentSemester, currentUnit].filter(Boolean).length;
  const hasActiveFilters = Boolean(
    searchQuery || currentType || currentBranch || currentSemester || currentUnit || (currentSortBy && currentSortBy !== 'recent')
  );

  return (
    <div className="space-y-8 py-4">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-blue-800 bg-blue-50/90 px-3 py-1 rounded-full font-semibold mb-2 border border-blue-200">
            <BookOpen className="w-3.5 h-3.5 text-blue-700" />
            <span>KNIT Academic Repository</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Academic Resource Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Search, filter, and explore lecture notes, PYQs, assignments, and lab manuals organized by engineering branch and semester.
          </p>
        </div>

        <Link to="/upload" className="shrink-0 self-start sm:self-auto">
          <Button variant="primary" size="md" icon={Upload}>
            Upload Material
          </Button>
        </Link>
      </div>

      {/* Unified Search & Discovery Console */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
        
        {/* Main Search Input */}
        <div>
          <SearchInput
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by title, subject code (e.g. DBMS, BCS-501, OS), or unit topic..."
          />
        </div>

        {/* Personalized Semester Quick Bar (if logged-in student has branch & semester) */}
        {user?.branch && user?.semester && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs bg-blue-50/80 border border-blue-200/90 rounded-xl px-4 py-3">
            <span className="flex items-center gap-2 text-blue-900 font-medium">
              <Sparkles className="w-4 h-4 text-blue-700 shrink-0" />
              <span>Recommended for your class: <strong className="font-bold text-blue-950">{user.branch} • Sem {user.semester}</strong></span>
            </span>

            <button
              type="button"
              onClick={() => {
                const nextParams = new URLSearchParams(searchParams);
                nextParams.set('branch', user.branch);
                nextParams.set('semester', String(user.semester));
                nextParams.set('page', '1');
                setSearchParams(nextParams);
              }}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 bg-white hover:bg-blue-100/70 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
            >
              Filter My Semester Notes
            </button>
          </div>
        )}

        {/* Resource Type Segmented Navigation Tabs */}
        <div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {TYPE_TABS.map((tab) => {
              const isActive = currentType === tab.id;
              const TabIcon = tab.icon;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-blue-700 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-slate-50 border border-slate-200/80 font-medium'
                  }`}
                >
                  {TabIcon && <TabIcon className="w-3.5 h-3.5" />}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed Academic Dropdown Filters Strip */}
        <div className="pt-2 border-t border-slate-100">
          
          {/* Mobile Filter Toggle */}
          <div className="flex sm:hidden items-center justify-between">
            <button
              type="button"
              onClick={() => setIsFilterExpandedMobile(!isFilterExpandedMobile)}
              className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-700" />
              <span>Academic Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isFilterExpandedMobile ? 'rotate-180' : ''}`} />
            </button>

            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-rose-600 font-semibold hover:underline"
              >
                Reset
              </button>
            )}
          </div>

          {/* Desktop Filters Grid */}
          <div className={`${isFilterExpandedMobile ? 'block' : 'hidden'} sm:grid sm:grid-cols-4 lg:grid-cols-5 gap-3 pt-3 sm:pt-0`}>
            {/* Branch Filter */}
            <div className="col-span-1 sm:col-span-1 lg:col-span-2">
              <Select
                placeholder=""
                value={currentBranch}
                onChange={(e) => handleFilterChange('branch', e.target.value)}
                options={BRANCH_OPTIONS}
                className="text-xs py-2"
              />
            </div>

            {/* Semester Filter */}
            <div>
              <Select
                placeholder=""
                value={currentSemester}
                onChange={(e) => handleFilterChange('semester', e.target.value)}
                options={SEMESTER_OPTIONS}
                className="text-xs py-2"
              />
            </div>

            {/* Unit Filter */}
            <div>
              <Select
                placeholder=""
                value={currentUnit}
                onChange={(e) => handleFilterChange('unit', e.target.value)}
                options={UNIT_OPTIONS}
                className="text-xs py-2"
              />
            </div>

            {/* Sort By Filter */}
            <div className="flex items-center gap-2">
              <Select
                placeholder=""
                value={currentSortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                options={SORT_OPTIONS}
                className="text-xs py-2"
              />

              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  title="Reset filter dropdowns"
                  className="hidden lg:flex p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200 transition-colors shrink-0 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Active Applied Filters Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-400 font-semibold">Active Criteria:</span>
            {searchQuery && (
              <span className="bg-blue-50 text-blue-800 px-2.5 py-1 rounded-lg border border-blue-200 flex items-center gap-1.5 font-medium">
                <span>Search: "{searchQuery}"</span>
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  className="hover:text-blue-950 cursor-pointer"
                  title="Remove search filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {currentType && (
              <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 font-medium">
                Type: {currentType.toUpperCase()}
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
            {currentUnit && (
              <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 font-medium">
                Unit {currentUnit}
              </span>
            )}
            {currentSortBy && currentSortBy !== 'recent' && (
              <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 font-medium">
                Sort: {currentSortBy === 'popular' ? 'Downloads' : currentSortBy === 'rating' ? 'Rating' : 'Title'}
              </span>
            )}
            <button
              type="button"
              onClick={handleClearAll}
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
          <Button size="sm" variant="outline" onClick={fetchResources}>
            Retry
          </Button>
        </div>
      )}

      {/* Results Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        
        {/* Results Header Bar */}
        <div className="px-5 sm:px-6 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-sm">
              {isLoading
                ? 'Searching materials...'
                : `${meta.total || 0} ${meta.total === 1 ? 'Material' : 'Materials'} Found`}
            </span>
            {currentType && (
              <span className="hidden sm:inline text-slate-400 font-medium">
                in {currentType.toUpperCase()}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={fetchResources}
            className="flex items-center gap-1.5 hover:text-blue-700 transition-colors cursor-pointer font-medium"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Content Body */}
        {isLoading ? (
          <div className="py-20">
            <Loader message="Searching academic repository..." size="md" />
          </div>
        ) : resources.length === 0 ? (
          <div className="p-8 sm:p-12">
            <EmptyState
              icon={searchQuery ? SearchX : FolderOpen}
              title={searchQuery ? `No matches for "${searchQuery}"` : 'No study materials found'}
              description={
                searchQuery
                  ? 'Try searching with subject acronyms (e.g. DBMS, OS, DAA), course codes (e.g. BCS-501), or check for spelling errors.'
                  : hasActiveFilters
                  ? 'No materials match the selected filters. Try broadening your criteria or reset the filters.'
                  : 'Be the first to upload lecture notes or PYQs for this category.'
              }
              actionLabel={hasActiveFilters ? 'Reset Filters' : 'Upload Study Material'}
              onAction={hasActiveFilters ? handleClearAll : () => (window.location.href = '/upload')}
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {resources.map((item) => (
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
      {!isLoading && resources.length > 0 && (
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
