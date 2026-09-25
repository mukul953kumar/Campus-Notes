import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { resourceService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ResourceRow from '../../components/resources/ResourceRow';
import Pagination from '../../components/common/Pagination';
import SearchInput from '../../components/common/SearchInput';
import FilterToolbar from '../../components/resources/FilterToolbar';
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
  Sparkles
} from 'lucide-react';

const TYPE_TABS = [
  { id: '', label: 'All Resources' },
  { id: 'notes', label: 'Notes', icon: BookOpen },
  { id: 'pyq', label: 'PYQ Papers', icon: HelpCircle },
  { id: 'assignment', label: 'Assignments', icon: FileCheck },
  { id: 'practical', label: 'Practicals', icon: Code },
  { id: 'syllabus', label: 'Syllabus', icon: FileText },
];

export default function ResourceLibraryPage() {
  const { savedIds, toggleBookmark } = useAuth();
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

  const hasActiveFilters = Boolean(
    searchQuery || currentType || currentBranch || currentSemester || currentUnit || (currentSortBy && currentSortBy !== 'recent')
  );

  return (
    <div className="space-y-6 py-2">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Academic Resource Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search and filter notes, previous year question papers, and lab files across all semesters.
          </p>
        </div>

        <Link to="/upload" className="shrink-0 self-start sm:self-auto">
          <Button variant="primary" size="md" icon={Upload}>
            Upload Material
          </Button>
        </Link>
      </div>

      {/* Search Input Bar */}
      <div className="w-full">
        <SearchInput
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search by title, subject code (e.g. DBMS, BCS-501, OS), or unit topic..."
        />
      </div>

      {/* Quick 1-click filter for student's personalized semester */}
      {user?.branch && user?.semester && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs bg-blue-50/70 border border-blue-200/80 rounded-xl px-3.5 py-2.5 shadow-2xs">
          <span className="flex items-center gap-1.5 text-blue-900 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-blue-700 shrink-0" />
            <span>Curated for your class: <strong>{user.branch} • Sem {user.semester}</strong></span>
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
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 bg-white hover:bg-blue-100/70 border border-blue-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
          >
            Apply My Semester Filter
          </button>
        </div>
      )}

      {/* Resource Type Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 scrollbar-none">
        {TYPE_TABS.map((tab) => {
          const isActive = currentType === tab.id;
          const TabIcon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-blue-700 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-white border border-slate-200'
              }`}
            >
              {TabIcon && <TabIcon className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter Toolbar (Branch, Semester, Unit, SortBy) */}
      <FilterToolbar
        branch={currentBranch}
        semester={currentSemester}
        unit={currentUnit}
        sortBy={currentSortBy}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Applied:</span>
          {searchQuery && (
            <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200 flex items-center gap-1 font-medium">
              Search: "{searchQuery}"
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className="hover:text-blue-950 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {currentType && (
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200 font-medium">
              Type: {currentType.toUpperCase()}
            </span>
          )}
          {currentBranch && (
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200 font-medium">
              Branch: {currentBranch}
            </span>
          )}
          {currentSemester && (
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200 font-medium">
              Sem {currentSemester}
            </span>
          )}
          {currentUnit && (
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200 font-medium">
              Unit {currentUnit}
            </span>
          )}
          {currentSortBy && currentSortBy !== 'recent' && (
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200 font-medium">
              Sort: {currentSortBy === 'popular' ? 'Downloads' : 'Title'}
            </span>
          )}
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs text-rose-600 hover:text-rose-700 hover:underline cursor-pointer ml-1 font-medium"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center justify-between">
          <span>{errorMessage}</span>
          <Button size="sm" variant="outline" onClick={fetchResources}>
            Retry
          </Button>
        </div>
      )}

      {/* Dense Row List Container */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        
        {/* List Header Bar */}
        <div className="px-4 sm:px-6 py-3 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold text-slate-700">
            {isLoading
              ? 'Searching resources...'
              : `${meta.total || 0} ${meta.total === 1 ? 'Material' : 'Materials'} Found`}
          </span>
          <button
            type="button"
            onClick={fetchResources}
            className="flex items-center gap-1 hover:text-blue-700 transition-colors cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Content Body */}
        {isLoading ? (
          <div className="py-16">
            <Loader message="Searching academic repository..." size="md" />
          </div>
        ) : resources.length === 0 ? (
          <div className="p-8">
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
