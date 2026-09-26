import React, { useState, useEffect, useCallback } from 'react';
import { adminService, reportService, academicService } from '../../services/api';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Flag,
  Users,
  Download,
  FileText,
  ExternalLink,
  Eye,
  Check,
  X,
  Trash2,
  RefreshCw,
  Layers,
  Search,
  Filter,
  UserCheck,
  UserX,
  Shield,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  MessageSquare,
  Send,
  Info
} from 'lucide-react';

const REJECTION_PRESETS = [
  'Pages are blurry or handwriting is unreadable. Please upload clearer photos/scans.',
  'Pages are rotated sideways or upside down. Please rotate pages before uploading.',
  'Incomplete notes or missing units. Please upload the complete unit material.',
  'Incorrect subject or branch selected. Please choose the correct academic subject.',
  'Duplicate submission. This exact study material is already available in the library.',
  'Low contrast or poor lighting. Please ensure readable contrast and lighting.',
];

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'resources' | 'reports' | 'users'

  // Platform Metrics
  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    totalAdmins: 0,
    totalResources: 0,
    pendingCount: 0,
    verifiedCount: 0,
    rejectedCount: 0,
    pendingReportsCount: 0,
    totalDownloads: 0,
  });

  // Verification Queue
  const [queue, setQueue] = useState([]);
  const [isLoadingQueue, setIsLoadingQueue] = useState(true);

  // All Resources Catalog
  const [resources, setResources] = useState([]);
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const [resourceSearch, setResourceSearch] = useState('');
  const [resourceStatusFilter, setResourceStatusFilter] = useState('all');
  const [resourceBranchFilter, setResourceBranchFilter] = useState('');
  const [resourceSemesterFilter, setResourceSemesterFilter] = useState('');
  const [resourcePage, setResourcePage] = useState(1);
  const [resourceTotalPages, setResourceTotalPages] = useState(1);
  const [resourceTotalCount, setResourceTotalCount] = useState(0);

  // Reports
  const [reports, setReports] = useState([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);

  // Users Directory
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [userTotalCount, setUserTotalCount] = useState(0);

  // Branches list for filters
  const [branches, setBranches] = useState([]);

  // Modals & Actions
  const [previewResource, setPreviewResource] = useState(null);
  const [rejectingItem, setRejectingItem] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [deletingResource, setDeletingResource] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState({ type: '', message: '' });

  // Load Metrics
  const loadMetrics = useCallback(async () => {
    try {
      const res = await adminService.getMetrics();
      if (res?.data) {
        setMetrics(res.data);
      }
    } catch (err) {
      console.error('Failed to load metrics:', err);
    }
  }, []);

  // Load Queue
  const loadQueue = useCallback(async () => {
    setIsLoadingQueue(true);
    try {
      const res = await adminService.getQueue();
      if (res?.data) {
        setQueue(res.data);
      }
    } catch (err) {
      console.error('Failed to load queue:', err);
    } finally {
      setIsLoadingQueue(false);
    }
  }, []);

  // Load All Resources Catalog
  const loadAllResources = useCallback(async () => {
    setIsLoadingResources(true);
    try {
      const res = await adminService.getAllResources({
        search: resourceSearch,
        status: resourceStatusFilter,
        branch: resourceBranchFilter,
        semester: resourceSemesterFilter,
        page: resourcePage,
        limit: 15,
      });
      if (res?.data) {
        setResources(res.data);
        if (res.meta) {
          setResourceTotalPages(res.meta.totalPages || 1);
          setResourceTotalCount(res.meta.total || 0);
        }
      }
    } catch (err) {
      console.error('Failed to load resources:', err);
    } finally {
      setIsLoadingResources(false);
    }
  }, [resourceSearch, resourceStatusFilter, resourceBranchFilter, resourceSemesterFilter, resourcePage]);

  // Load Reports
  const loadReports = useCallback(async () => {
    setIsLoadingReports(true);
    try {
      const res = await reportService.getReports();
      if (res?.data) {
        setReports(res.data);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setIsLoadingReports(false);
    }
  }, []);

  // Load Users Directory
  const loadUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const res = await adminService.getUsers({
        search: userSearch,
        role: userRoleFilter,
        page: userPage,
        limit: 15,
      });
      if (res?.data) {
        setUsers(res.data);
        if (res.meta) {
          setUserTotalPages(res.meta.totalPages || 1);
          setUserTotalCount(res.meta.total || 0);
        }
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  }, [userSearch, userRoleFilter, userPage]);

  // Load Academic branches
  useEffect(() => {
    async function fetchBranches() {
      try {
        const res = await academicService.getBranches();
        if (res?.data?.branches) setBranches(res.data.branches);
      } catch {
        setBranches([
          'Computer Science & Engineering',
          'Information Technology',
          'Electronics Engineering',
          'Electrical Engineering',
          'Mechanical Engineering',
          'Civil Engineering',
          'Master of Computer Applications',
        ]);
      }
    }
    fetchBranches();
  }, []);

  // Initial Load
  useEffect(() => {
    loadMetrics();
    loadQueue();
  }, [loadMetrics, loadQueue]);

  // Tab Change Triggers
  useEffect(() => {
    if (activeTab === 'resources') loadAllResources();
    if (activeTab === 'reports') loadReports();
    if (activeTab === 'users') loadUsers();
  }, [activeTab, loadAllResources, loadReports, loadUsers]);

  // Approve Resource Handler
  const handleApprove = async (resourceId) => {
    setIsActionLoading(true);
    setActionFeedback({ type: '', message: '' });
    try {
      await adminService.verifyResource(resourceId, 'approve');
      setQueue((prev) => prev.filter((item) => item._id !== resourceId));
      if (activeTab === 'resources') loadAllResources();
      loadMetrics();
      setActionFeedback({ type: 'success', message: 'Document approved and published live in library!' });
      setTimeout(() => setActionFeedback({ type: '', message: '' }), 3000);
    } catch (err) {
      setActionFeedback({ type: 'error', message: err.message || 'Failed to approve resource.' });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Confirm Reject Handler with Improvement Message
  const handleConfirmReject = async () => {
    if (!rejectingItem) return;
    const finalReason = rejectionReason.trim() || 'Document does not conform to academic quality guidelines. Please review guidelines and submit an updated document.';
    setIsActionLoading(true);
    setActionFeedback({ type: '', message: '' });
    try {
      await adminService.verifyResource(rejectingItem._id, 'reject', finalReason);
      setQueue((prev) => prev.filter((item) => item._id !== rejectingItem._id));
      if (activeTab === 'resources') loadAllResources();
      setRejectingItem(null);
      setRejectionReason('');
      loadMetrics();
      setActionFeedback({ type: 'success', message: 'Document rejected. Improvement feedback sent to student.' });
      setTimeout(() => setActionFeedback({ type: '', message: '' }), 3500);
    } catch (err) {
      setActionFeedback({ type: 'error', message: err.message || 'Failed to reject resource.' });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Universal Delete Resource Handler
  const handleConfirmDelete = async () => {
    if (!deletingResource) return;
    setIsActionLoading(true);
    setActionFeedback({ type: '', message: '' });
    try {
      await adminService.deleteResource(deletingResource._id);
      // Update local lists
      setQueue((prev) => prev.filter((item) => item._id !== deletingResource._id));
      setResources((prev) => prev.filter((item) => item._id !== deletingResource._id));
      setDeletingResource(null);
      loadMetrics();
      if (activeTab === 'reports') loadReports();
      setActionFeedback({ type: 'success', message: 'Resource permanently deleted and removed from platform.' });
      setTimeout(() => setActionFeedback({ type: '', message: '' }), 3000);
    } catch (err) {
      setActionFeedback({ type: 'error', message: err.message || 'Failed to delete resource.' });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Report Resolution
  const handleResolveReport = async (reportId, status, resolutionNote = '') => {
    try {
      await reportService.updateReport(reportId, { status, resolutionNote });
      loadReports();
      loadMetrics();
      setActionFeedback({ type: 'success', message: `Report marked as ${status}.` });
      setTimeout(() => setActionFeedback({ type: '', message: '' }), 3000);
    } catch (err) {
      setActionFeedback({ type: 'error', message: err.message || 'Failed to update report.' });
    }
  };

  // User Status / Role Update
  const handleUpdateUser = async (userId, data) => {
    setIsActionLoading(true);
    try {
      await adminService.updateUser(userId, data);
      loadUsers();
      loadMetrics();
      setActionFeedback({ type: 'success', message: 'User account updated successfully.' });
      setTimeout(() => setActionFeedback({ type: '', message: '' }), 3000);
    } catch (err) {
      setActionFeedback({ type: 'error', message: err.message || 'Failed to update user.' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  return (
    <div className="space-y-6 py-4">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Administrative Moderation Portal
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete management suite: Review submissions, delete/moderate materials, monitor student accounts, and resolve peer reports.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            loadMetrics();
            if (activeTab === 'queue') loadQueue();
            else if (activeTab === 'resources') loadAllResources();
            else if (activeTab === 'reports') loadReports();
            else if (activeTab === 'users') loadUsers();
          }}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer shrink-0 self-start sm:self-auto shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Users className="w-3.5 h-3.5 text-blue-700" />
            <span>Students</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{metrics.totalStudents}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Active accounts</p>
        </div>

        <div className="bg-white border border-amber-200/80 bg-amber-50/20 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center gap-1.5 text-amber-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending</span>
          </div>
          <div className="text-2xl font-bold text-amber-900">{metrics.pendingCount}</div>
          <p className="text-[11px] text-amber-600/80 mt-0.5">Needs review</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Live Notes</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{metrics.verifiedCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Verified catalog</p>
        </div>

        <div className="bg-white border border-rose-200/80 bg-rose-50/20 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center gap-1.5 text-rose-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <Flag className="w-3.5 h-3.5 text-rose-600" />
            <span>Reports</span>
          </div>
          <div className="text-2xl font-bold text-rose-900">{metrics.pendingReportsCount}</div>
          <p className="text-[11px] text-rose-600/80 mt-0.5">Pending review</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <BookOpen className="w-3.5 h-3.5 text-slate-600" />
            <span>Total Uploads</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{metrics.totalResources}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">All time files</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Downloads</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{metrics.totalDownloads}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Student downloads</p>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {actionFeedback.message && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          {actionFeedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{actionFeedback.message}</span>
        </div>
      )}

      {/* Section Tabs */}
      <div className="flex items-center gap-1 sm:gap-2 border-b border-slate-200 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('queue')}
          className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'queue'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Verification Queue</span>
          {metrics.pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
              {metrics.pendingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('resources')}
          className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'resources'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>All Notes & Materials</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700 font-bold">
            {metrics.totalResources}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'reports'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Flag className="w-4 h-4" />
          <span>Student Reports</span>
          {metrics.pendingReportsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-800 font-bold">
              {metrics.pendingReportsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Students & Accounts</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700 font-bold">
            {metrics.totalStudents}
          </span>
        </button>
      </div>

      {/* TAB 1: Verification Queue */}
      {activeTab === 'queue' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="px-4 sm:px-6 py-3 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 font-medium">
            <span>
              {isLoadingQueue
                ? 'Loading queue...'
                : `${queue.length} ${queue.length === 1 ? 'Document' : 'Documents'} Waiting for Verification`}
            </span>
            <span className="text-[11px] text-slate-400">Oldest submissions first</span>
          </div>

          {isLoadingQueue ? (
            <div className="py-16">
              <Loader message="Loading verification queue..." size="md" />
            </div>
          ) : queue.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={CheckCircle2}
                title="Verification Queue Clear"
                description="All submitted student materials have been reviewed and verified. Good job!"
              />
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {queue.map((item) => (
                <div key={item._id} className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left Info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900 line-clamp-1">
                        {item.title}
                      </span>
                      <Badge variant="pending" size="sm" showIcon>
                        Pending Review
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-slate-500">
                      <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {item.subjectId?.shortName || item.subjectId?.code || 'KNIT'}
                      </span>
                      <Badge variant={item.resourceType} size="sm">
                        {item.resourceType?.toUpperCase()}
                      </Badge>
                      {item.unit && (
                        <span className="text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                          Unit {item.unit}
                        </span>
                      )}
                      <span>•</span>
                      <span>{item.branch}</span>
                      <span>•</span>
                      <span>Sem {item.semester}</span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                      <span className="text-slate-600 font-medium">
                        Uploader: {item.uploaderId?.name} ({item.uploaderId?.email})
                      </span>
                      <span>•</span>
                      <span>{formatFileSize(item.fileSize)}</span>
                      <span>•</span>
                      <span>
                        Submitted{' '}
                        {new Date(item.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    {item.description && (
                      <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200/70 max-w-2xl mt-1">
                        "{item.description}"
                      </p>
                    )}
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Eye}
                      onClick={() => setPreviewResource(item)}
                    >
                      Preview PDF
                    </Button>

                    <Button
                      variant="danger"
                      size="sm"
                      icon={X}
                      onClick={() => setRejectingItem(item)}
                      disabled={isActionLoading}
                    >
                      Reject
                    </Button>

                    <Button
                      variant="success"
                      size="sm"
                      icon={Check}
                      onClick={() => handleApprove(item._id)}
                      disabled={isActionLoading}
                    >
                      Approve
                    </Button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: All Notes & Materials Management */}
      {activeTab === 'resources' && (
        <div className="space-y-4">
          
          {/* Search and Filters Console */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={resourceSearch}
                onChange={(e) => {
                  setResourceSearch(e.target.value);
                  setResourcePage(1);
                }}
                placeholder="Search notes by title, subject, tags, or keyword..."
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={resourceStatusFilter}
                onChange={(e) => {
                  setResourceStatusFilter(e.target.value);
                  setResourcePage(1);
                }}
                className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 cursor-pointer"
              >
                <option value="all">All Verification Statuses</option>
                <option value="verified">Verified Only</option>
                <option value="pending">Pending Only</option>
                <option value="rejected">Rejected Only</option>
              </select>

              <select
                value={resourceBranchFilter}
                onChange={(e) => {
                  setResourceBranchFilter(e.target.value);
                  setResourcePage(1);
                }}
                className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 cursor-pointer max-w-[150px]"
              >
                <option value="">All Branches</option>
                {branches.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>

              <select
                value={resourceSemesterFilter}
                onChange={(e) => {
                  setResourceSemesterFilter(e.target.value);
                  setResourcePage(1);
                }}
                className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 cursor-pointer"
              >
                <option value="">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Resources Table / List */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="px-4 sm:px-6 py-3 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 font-medium">
              <span>{resourceTotalCount} Total Study Materials</span>
              <span>Page {resourcePage} of {resourceTotalPages}</span>
            </div>

            {isLoadingResources ? (
              <div className="py-16">
                <Loader message="Loading materials catalog..." size="md" />
              </div>
            ) : resources.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={BookOpen}
                  title="No Resources Found"
                  description="No study materials match your search filters."
                />
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {resources.map((item) => (
                  <div
                    key={item._id}
                    className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900 line-clamp-1">
                          {item.title}
                        </span>
                        <Badge variant={item.verificationStatus} size="sm">
                          {item.verificationStatus?.toUpperCase()}
                        </Badge>
                        {!item.isActive && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded">
                            DEACTIVATED
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-slate-500">
                        <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {item.subjectId?.shortName || item.subjectId?.code || 'KNIT'}
                        </span>
                        <Badge variant={item.resourceType} size="sm">
                          {item.resourceType?.toUpperCase()}
                        </Badge>
                        <span>•</span>
                        <span>{item.branch}</span>
                        <span>•</span>
                        <span>Sem {item.semester}</span>
                        <span>•</span>
                        <span>{formatFileSize(item.fileSize)}</span>
                        <span>•</span>
                        <span>{item.downloadsCount || item.downloadCount || 0} Downloads</span>
                      </div>

                      <div className="text-[11px] text-slate-400">
                        Uploaded by <strong className="text-slate-700">{item.uploaderId?.name || 'Student'}</strong> ({item.uploaderId?.email}) on {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>

                    {/* Admin Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Eye}
                        onClick={() => setPreviewResource(item)}
                      >
                        Preview
                      </Button>

                      {item.verificationStatus !== 'verified' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Check}
                          onClick={() => handleApprove(item._id)}
                          disabled={isActionLoading}
                        >
                          Approve
                        </Button>
                      )}

                      {/* Universal Admin Delete */}
                      <Button
                        variant="danger"
                        size="sm"
                        icon={Trash2}
                        onClick={() => setDeletingResource(item)}
                        disabled={isActionLoading}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {resourceTotalPages > 1 && (
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
                <button
                  type="button"
                  disabled={resourcePage <= 1}
                  onClick={() => setResourcePage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous
                </button>
                <span className="text-slate-500">
                  Page {resourcePage} of {resourceTotalPages}
                </span>
                <button
                  type="button"
                  disabled={resourcePage >= resourceTotalPages}
                  onClick={() => setResourcePage((p) => Math.min(resourceTotalPages, p + 1))}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Student Reports Manager */}
      {activeTab === 'reports' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="px-4 sm:px-6 py-3 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 font-medium">
            <span>
              {isLoadingReports
                ? 'Loading reports...'
                : `${reports.length} ${reports.length === 1 ? 'Report' : 'Reports'} Logged`}
            </span>
          </div>

          {isLoadingReports ? (
            <div className="py-16">
              <Loader message="Loading reports..." size="md" />
            </div>
          ) : reports.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Flag}
                title="No Flagged Reports"
                description="There are currently no open peer reports or flagged documents."
              />
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {reports.map((report) => (
                <div key={report._id} className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors space-y-3">
                  
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900">
                          {report.resourceId?.title || 'Resource'}
                        </span>
                        <Badge variant="rejected" size="sm">
                          {report.reason?.replace(/_/g, ' ').toUpperCase()}
                        </Badge>
                        <Badge
                          variant={report.status === 'resolved' ? 'verified' : report.status === 'dismissed' ? 'neutral' : 'pending'}
                          size="sm"
                        >
                          Status: {report.status}
                        </Badge>
                      </div>

                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                        <span>Reported by: {report.reporterId?.name} ({report.reporterId?.email})</span>
                        <span>•</span>
                        <span>
                          {new Date(report.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      {report.description && (
                        <div className="p-2.5 bg-rose-50/60 border border-rose-200 rounded-lg text-xs text-rose-900">
                          <span className="font-semibold">Student Observation: </span>
                          <span>{report.description}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-end lg:self-start">
                      {report.resourceId && (
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Eye}
                          onClick={() => setPreviewResource(report.resourceId)}
                        >
                          Inspect PDF
                        </Button>
                      )}

                      {report.status === 'pending' && (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleResolveReport(report._id, 'dismissed', 'Dismissed as non-actionable')}
                          >
                            Dismiss
                          </Button>

                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleResolveReport(report._id, 'resolved', 'Issue checked and resolved')}
                          >
                            Resolve
                          </Button>

                          {report.resourceId && (
                            <Button
                              variant="danger"
                              size="sm"
                              icon={Trash2}
                              onClick={() => setDeletingResource(report.resourceId)}
                            >
                              Delete Material
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Students & Accounts Directory */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          
          {/* User Search Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setUserPage(1);
                }}
                placeholder="Search students by name, email, roll..."
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <select
              value={userRoleFilter}
              onChange={(e) => {
                setUserRoleFilter(e.target.value);
                setUserPage(1);
              }}
              className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 cursor-pointer w-full sm:w-auto"
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="contributor">Top Contributors</option>
              <option value="admin">Administrators</option>
            </select>
          </div>

          {/* Users List */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="px-4 sm:px-6 py-3 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 font-medium">
              <span>{userTotalCount} Registered Users</span>
              <span>Page {userPage} of {userTotalPages}</span>
            </div>

            {isLoadingUsers ? (
              <div className="py-16">
                <Loader message="Loading user directory..." size="md" />
              </div>
            ) : users.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={Users}
                  title="No Users Found"
                  description="No student accounts match your filter criteria."
                />
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {users.map((u) => (
                  <div
                    key={u._id}
                    className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{u.name}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : u.role === 'contributor'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {u.role?.toUpperCase()}
                        </span>
                        {!u.isActive && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded">
                            SUSPENDED
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500">
                        {u.email} • {u.branch || 'KNIT'} • Sem {u.semester || '-'}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                        <span>Uploads: {u.stats?.uploadsCount || 0}</span>
                        <span>•</span>
                        <span>Approved: {u.stats?.approvedCount || 0}</span>
                        <span>•</span>
                        <span>Joined: {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>

                    {/* Role & Status Controls */}
                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdateUser(u._id, { role: e.target.value })}
                        disabled={isActionLoading}
                        className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 font-semibold cursor-pointer"
                      >
                        <option value="student">Student</option>
                        <option value="contributor">Contributor</option>
                        <option value="admin">Admin</option>
                      </select>

                      <Button
                        variant={u.isActive ? 'outline' : 'success'}
                        size="sm"
                        onClick={() => handleUpdateUser(u._id, { isActive: !u.isActive })}
                        disabled={isActionLoading}
                      >
                        {u.isActive ? 'Suspend' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PDF Inspection Modal */}
      {previewResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 line-clamp-1">
                  {previewResource.title}
                </h3>
                <p className="text-xs text-slate-500">
                  {previewResource.subjectId?.name || 'Academic Material'} • {formatFileSize(previewResource.fileSize)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {previewResource.fileUrl && (
                  <a
                    href={previewResource.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Open External"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewResource(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-900">
              <iframe
                src={`${previewResource.fileUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                title="Preview"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal with Improvement Feedback */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-5 sm:p-6 overflow-hidden shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Reject Material & Send Feedback</h3>
                <p className="text-xs text-slate-500">Provide actionable guidance so the student can revise & re-upload</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-1">
              <span className="font-semibold text-slate-700">Material Under Review:</span>
              <p className="font-bold text-slate-900 truncate">"{rejectingItem.title}"</p>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-0.5">
                <span>{rejectingItem.branch}</span>
                <span>•</span>
                <span>Sem {rejectingItem.semester}</span>
                {rejectingItem.uploaderId?.name && (
                  <>
                    <span>•</span>
                    <span>Uploader: {rejectingItem.uploaderId.name}</span>
                  </>
                )}
              </div>
            </div>

            {/* Quick Reason Presets */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                <span>Quick Preset Reasons (Click to insert):</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                {REJECTION_PRESETS.map((preset, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setRejectionReason(preset)}
                    className="text-left text-[11px] px-2.5 py-1 rounded-lg border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/50 text-slate-700 transition-colors cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Feedback Message for Student
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Write specific instructions for the student (e.g. Please rotate pages 4-6, ensure clear scan contrast, or re-tag to Unit 3)..."
                className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-100"
              />
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <Info className="w-3 h-3 text-slate-400" />
                This message will be instantly displayed on the student's dashboard with a "Fix & Re-upload" button.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRejectingItem(null);
                  setRejectionReason('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={Send}
                onClick={handleConfirmReject}
                isLoading={isActionLoading}
              >
                Send Message & Reject
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Universal Delete Confirmation Modal */}
      {deletingResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 overflow-hidden shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Delete Study Material</h3>
                <p className="text-xs text-slate-500">Permanent administrative action</p>
              </div>
            </div>

            <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl text-xs text-rose-950 space-y-1">
              <p className="font-semibold text-rose-900">
                Are you sure you want to delete this resource?
              </p>
              <p className="text-rose-800 font-medium line-clamp-2">
                "{deletingResource.title}"
              </p>
              <p className="text-[11px] text-rose-600 pt-1">
                This will deactivate the document, remove it from all student search results, and delete associated bookmarks.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeletingResource(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={handleConfirmDelete}
                isLoading={isActionLoading}
              >
                Delete Resource
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
