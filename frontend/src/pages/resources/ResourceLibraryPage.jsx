import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { resourceService } from '../../services/api';
import ResourceRow from '../../components/resources/ResourceRow';
import Pagination from '../../components/common/Pagination';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import {
  BookOpen,
  Filter,
  Upload,
  RefreshCw,
  FolderOpen,
  HelpCircle,
  FileCheck,
  Code,
  FileText
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
  const [searchParams, setSearchParams] = useSearchParams();

  const currentType = searchParams.get('type') || '';
  const currentBranch = searchParams.get('branch') || '';
  const currentSemester = searchParams.get('semester') || '';
  const currentPage = Number(searchParams.get('page')) || 1;

  const [resources, setResources] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Local saved bookmarks tracking
  const [savedIds, setSavedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('campus_notes_saved_ids') || '[]');
    } catch {
      return [];
    }
  });

  const fetchResources = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await resourceService.getResources({
        resourceType: currentType,
        branch: currentBranch,
        semester: currentSemester,
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
  }, [currentType, currentBranch, currentSemester, currentPage]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

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

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters = Boolean(currentType || currentBranch || currentSemester);

  return (
    <div className="space-y-6 py-2">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Academic Resource Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Peer-reviewed syllabus notes, previous year exam papers, and practical files for KNIT Sultanpur.
          </p>
        </div>

        <Link to="/upload" className="shrink-0 self-start sm:self-auto">
          <Button variant="primary" size="md" icon={Upload}>
            Upload Material
          </Button>
        </Link>
      </div>

      {/* Resource Type Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none">
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

      {/* Active Filter Indicators */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400 font-medium">Active filters:</span>
          {currentType && (
            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 font-medium flex items-center gap-1">
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
              Semester {currentSemester}
            </span>
          )}
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs text-rose-600 hover:text-rose-700 hover:underline cursor-pointer ml-1"
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

      {/* Resource Dense List Container */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        
        {/* List Header Bar */}
        <div className="px-4 sm:px-6 py-3 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold text-slate-700">
            {isLoading ? 'Fetching resources...' : `${meta.total || 0} Materials Available`}
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
            <Loader message="Loading academic repository..." size="md" />
          </div>
        ) : resources.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={FolderOpen}
              title="No study materials found"
              description={
                hasActiveFilters
                  ? 'No documents match the selected filters. Try broadening your criteria or reset filters.'
                  : 'Be the first to upload lecture notes or PYQs for this category.'
              }
              actionLabel={hasActiveFilters ? 'Clear Filters' : 'Upload First Note'}
              onAction={hasActiveFilters ? clearFilters : () => (window.location.href = '/upload')}
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
