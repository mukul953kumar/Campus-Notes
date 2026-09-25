import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookmarkService } from '../../services/api';
import ResourceRow from '../../components/resources/ResourceRow';
import ResourceCard from '../../components/resources/ResourceCard';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import {
  Bookmark,
  BookOpen,
  HelpCircle,
  FileCheck,
  Code,
  Search,
  LayoutGrid,
  List
} from 'lucide-react';

const TYPE_TABS = [
  { id: '', label: 'All Saved' },
  { id: 'notes', label: 'Notes', icon: BookOpen },
  { id: 'pyq', label: 'PYQ Papers', icon: HelpCircle },
  { id: 'assignment', label: 'Assignments', icon: FileCheck },
  { id: 'practical', label: 'Practicals', icon: Code },
];

export default function SavedResourcesPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState([]);
  const [activeTab, setActiveTab] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  const loadBookmarks = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await bookmarkService.getBookmarks();
      if (response && response.data) {
        setBookmarks(response.data);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to fetch saved resources.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, []);

  useEffect(() => {
    let result = bookmarks;

    if (activeTab) {
      result = result.filter((b) => b.resourceType === activeTab);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.title?.toLowerCase().includes(q) ||
          b.subjectId?.name?.toLowerCase().includes(q) ||
          b.subjectId?.code?.toLowerCase().includes(q)
      );
    }

    setFilteredBookmarks(result);
  }, [bookmarks, activeTab, searchQuery]);

  const handleRemoveBookmark = async (resourceId) => {
    try {
      await bookmarkService.toggleBookmark(resourceId);
      setBookmarks((prev) => prev.filter((b) => b._id !== resourceId));

      // Also sync local storage
      const savedIds = JSON.parse(localStorage.getItem('campus_notes_saved_ids') || '[]');
      const updatedIds = savedIds.filter((id) => id !== resourceId);
      localStorage.setItem('campus_notes_saved_ids', JSON.stringify(updatedIds));
    } catch (err) {
      console.error('Failed to remove bookmark:', err);
    }
  };

  return (
    <div className="space-y-8 py-4">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
              <Bookmark className="w-4 h-4 fill-blue-700" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Saved Bookmarks
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Access your bookmarked study materials, PYQ sets, and assignments anytime for fast revision.
          </p>
        </div>

        <Link to="/resources">
          <Button variant="outline" size="md">
            Browse More Resources
          </Button>
        </Link>
      </div>

      {/* Filter & Search Console Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {TYPE_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const TabIcon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
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

        {/* Quick Search within saved */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search in saved bookmarks..."
            className="w-full pl-9 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center justify-between">
          <span>{errorMessage}</span>
          <Button size="sm" variant="outline" onClick={loadBookmarks}>
            Retry
          </Button>
        </div>
      )}

      {/* Bookmarks Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1 text-xs text-slate-600">
          <span className="font-bold text-slate-900 text-sm sm:text-base">
            {isLoading
              ? 'Loading saved bookmarks...'
              : `${filteredBookmarks.length} ${filteredBookmarks.length === 1 ? 'Bookmark' : 'Bookmarks'} Saved`}
          </span>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Grid / Square Cards View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Dense List View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white border border-slate-200 rounded-2xl py-20 shadow-xs">
            <Loader message="Loading saved materials..." size="md" />
          </div>
        ) : filteredBookmarks.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 shadow-xs">
            <EmptyState
              icon={Bookmark}
              title={
                searchQuery || activeTab
                  ? 'No matching saved materials'
                  : 'You have not saved any study materials yet'
              }
              description={
                searchQuery || activeTab
                  ? 'Try clearing your search term or switching to "All Saved" tab.'
                  : 'Click the bookmark icon on any document in the resource library to save it here for quick exam revision.'
              }
              actionLabel={searchQuery || activeTab ? 'Reset Filter' : 'Browse Library'}
              onAction={
                searchQuery || activeTab
                  ? () => {
                      setSearchQuery('');
                      setActiveTab('');
                    }
                  : () => (window.location.href = '/resources')
              }
            />
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBookmarks.map((item) => (
              <ResourceCard
                key={item._id}
                resource={item}
                isSaved={true}
                onToggleSave={() => handleRemoveBookmark(item._id)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredBookmarks.map((item) => (
              <ResourceRow
                key={item._id}
                resource={item}
                isSaved={true}
                onToggleSave={() => handleRemoveBookmark(item._id)}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
