import React, { useState, useEffect, useCallback } from 'react';
import { adminService, reportService } from '../../services/api';
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
  MessageSquare
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'reports'

  // Metrics
  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    pendingCount: 0,
    verifiedCount: 0,
    rejectedCount: 0,
    pendingReportsCount: 0,
    totalDownloads: 0,
  });

  // Verification Queue
  const [queue, setQueue] = useState([]);
  const [isLoadingQueue, setIsLoadingQueue] = useState(true);

  // Reports
  const [reports, setReports] = useState([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);

  // PDF Preview Modal
  const [previewResource, setPreviewResource] = useState(null);

  // Reject Modal
  const [rejectingItem, setRejectingItem] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState({ type: '', message: '' });

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

  useEffect(() => {
    loadMetrics();
    loadQueue();
  }, [loadMetrics, loadQueue]);

  useEffect(() => {
    if (activeTab === 'reports') {
      loadReports();
    }
  }, [activeTab, loadReports]);

  const handleApprove = async (resourceId) => {
    setIsActionLoading(true);
    setActionFeedback({ type: '', message: '' });
    try {
      await adminService.verifyResource(resourceId, 'approve');
      setQueue((prev) => prev.filter((item) => item._id !== resourceId));
      loadMetrics();
      setActionFeedback({ type: 'success', message: 'Document approved and published live!' });
      setTimeout(() => setActionFeedback({ type: '', message: '' }), 3000);
    } catch (err) {
      setActionFeedback({ type: 'error', message: err.message || 'Failed to approve resource.' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingItem) return;
    setIsActionLoading(true);
    setActionFeedback({ type: '', message: '' });
    try {
      await adminService.verifyResource(rejectingItem._id, 'reject', rejectionReason);
      setQueue((prev) => prev.filter((item) => item._id !== rejectingItem._id));
      setRejectingItem(null);
      setRejectionReason('');
      loadMetrics();
      setActionFeedback({ type: 'success', message: 'Document rejected and feedback saved.' });
      setTimeout(() => setActionFeedback({ type: '', message: '' }), 3000);
    } catch (err) {
      setActionFeedback({ type: 'error', message: err.message || 'Failed to reject resource.' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleResolveReport = async (reportId, status, resolutionNote = '') => {
    try {
      await reportService.updateReport(reportId, { status, resolutionNote });
      loadReports();
      loadMetrics();
    } catch (err) {
      console.error('Failed to update report:', err);
    }
  };

  const handleDeleteResource = async (resourceId, reportId) => {
    if (!window.confirm('Are you sure you want to deactivate and remove this study material from the platform?')) {
      return;
    }
    try {
      await adminService.deleteResource(resourceId);
      if (reportId) {
        await reportService.updateReport(reportId, {
          status: 'resolved',
          resolutionNote: 'Resource deactivated and removed by administrator.',
        });
      }
      loadReports();
      loadMetrics();
      setActionFeedback({ type: 'success', message: 'Resource deactivated and removed.' });
      setTimeout(() => setActionFeedback({ type: '', message: '' }), 3000);
    } catch (err) {
      setActionFeedback({ type: 'error', message: err.message || 'Failed to delete resource.' });
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  return (
    <div className="space-y-8 py-4">
      
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
            Review pending student uploads, enforce syllabus quality, and resolve peer reports.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            loadMetrics();
            if (activeTab === 'queue') loadQueue();
            else loadReports();
          }}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer shrink-0 self-start sm:self-auto shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
            <Users className="w-3.5 h-3.5 text-blue-700" />
            <span>Students</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{metrics.totalStudents}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Active accounts</p>
        </div>

        <div className="bg-white border border-amber-200/80 bg-amber-50/20 rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-2 text-amber-700 text-xs font-semibold uppercase tracking-wider mb-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending Review</span>
          </div>
          <div className="text-2xl font-bold text-amber-900">{metrics.pendingCount}</div>
          <p className="text-[11px] text-amber-600/80 mt-0.5">Documents in queue</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified Live</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{metrics.verifiedCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Approved in library</p>
        </div>

        <div className="bg-white border border-rose-200/80 bg-rose-50/20 rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-2 text-rose-700 text-xs font-semibold uppercase tracking-wider mb-1.5">
            <Flag className="w-3.5 h-3.5 text-rose-600" />
            <span>Open Reports</span>
          </div>
          <div className="text-2xl font-bold text-rose-900">{metrics.pendingReportsCount}</div>
          <p className="text-[11px] text-rose-600/80 mt-0.5">Flagged by students</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs col-span-2 sm:col-span-4 lg:col-span-1">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Total Downloads</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{metrics.totalDownloads}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Across all branches</p>
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
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('queue')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'queue'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Verification Queue</span>
          {metrics.pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-semibold">
              {metrics.pendingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'reports'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Flag className="w-4 h-4" />
          <span>Student Reports</span>
          {metrics.pendingReportsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-800 font-semibold">
              {metrics.pendingReportsCount}
            </span>
          )}
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
            <span className="text-[11px] text-slate-400">Oldest first</span>
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

      {/* TAB 2: Student Reports Manager */}
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
                              onClick={() => handleDeleteResource(report.resourceId._id, report._id)}
                            >
                              Remove Material
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
                src={`${previewResource.fileUrl}#toolbar=1`}
                title="Preview"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 overflow-hidden shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Reject Material</h3>
            </div>

            <p className="text-xs text-slate-500">
              Provide a clear reason for rejecting <span className="font-semibold text-slate-800">"{rejectingItem.title}"</span> so the student can fix and re-upload.
            </p>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Pages 4-6 are blurry, scanned upside down, or missing unit coverage..."
              className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-100"
            />

            <div className="flex items-center justify-end gap-2.5 pt-2">
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
                onClick={handleConfirmReject}
                isLoading={isActionLoading}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
