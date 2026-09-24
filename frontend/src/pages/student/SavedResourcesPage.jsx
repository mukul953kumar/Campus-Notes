import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookmarkService } from '../../services/api';
import ResourceRow from '../../components/resources/ResourceRow';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import {
  Bookmark,
  BookOpen,
  HelpCircle,
  FileCheck,
  Code,
  FileText,
  Search
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
    <div className="space-y-6 py-2">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Bookmark className="w-4 h-4 fill-blue-700" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Saved Bookmarks
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Access your bookmarked study materials, PYQ sets, and assignments anytime.
          </p>
        </div>

        <Link to="/resources">
          <Button variant="outline" size="md">
            Browse More Resources
          </Button>
        </Link>
      </div>

      {/* Search & Tabs Strip */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {TYPE_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const TabIcon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
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

        {/* Quick Search within saved */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved..."
            className="w-full pl-8.5 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100"
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

      {/* Bookmarks List Container */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-4 sm:px-6 py-3 bg-slate-50/70 border-b border-slate-200 text-xs font-semibold text-slate-700">
          {isLoading
            ? 'Loading saved bookmarks...'
            : `${filteredBookmarks.length} ${filteredBookmarks.length === 1 ? 'Bookmark' : 'Bookmarks'}`}
        </div>

        {isLoading ? (
          <div className="py-16">
            <Loader message="Loading saved materials..." size="md" />
          </div>
        ) : filteredBookmarks.length === 0 ? (
          <div className="p-8">
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
        ) : (
          <div className="divide-y divide-slate-100">
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
