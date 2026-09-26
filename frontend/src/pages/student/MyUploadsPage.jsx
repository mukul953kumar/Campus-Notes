import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { resourceService } from '../../services/api';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import {
  UploadCloud,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  Upload,
  Calendar,
  Layers,
  ArrowRight,
  RotateCcw,
  MessageSquare,
  BookOpen
} from 'lucide-react';

const STATUS_TABS = [
  { id: '', label: 'All Uploads' },
  { id: 'pending', label: 'Pending Review', icon: Clock },
  { id: 'verified', label: 'Verified & Live', icon: CheckCircle2 },
  { id: 'rejected', label: 'Rejected', icon: AlertCircle },
];

export default function MyUploadsPage() {
  const [uploads, setUploads] = useState([]);
  const [activeTab, setActiveTab] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadUploads = async (status = '') => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await resourceService.getMyUploads(status);
      if (response && response.data) {
        setUploads(response.data);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to fetch uploaded documents.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUploads(activeTab);
  }, [activeTab]);

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return (
          <Badge variant="verified" size="sm" showIcon>
            Verified & Live
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="pending" size="sm" showIcon>
            Under Review
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="rejected" size="sm" showIcon>
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  const pendingCount = uploads.filter((u) => u.verificationStatus === 'pending').length;
  const verifiedCount = uploads.filter((u) => u.verificationStatus === 'verified').length;
  const rejectedCount = uploads.filter((u) => u.verificationStatus === 'rejected').length;

  return (
    <div className="space-y-6 py-2">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <UploadCloud className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              My Uploads & Contributions
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track verification status, moderator feedback, and student download metrics for your uploaded materials.
          </p>
        </div>

        <Link to="/upload" className="shrink-0 self-start sm:self-auto">
          <Button variant="primary" size="md" icon={Upload}>
            Upload Material
          </Button>
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 scrollbar-none">
        {STATUS_TABS.map((tab) => {
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

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center justify-between">
          <span>{errorMessage}</span>
          <Button size="sm" variant="outline" onClick={() => loadUploads(activeTab)}>
            Retry
          </Button>
        </div>
      )}

      {/* Uploads Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1 text-xs text-slate-600">
          <span className="font-bold text-slate-900 text-sm sm:text-base">
            {isLoading
              ? 'Loading uploads...'
              : `${uploads.length} ${uploads.length === 1 ? 'Material' : 'Materials'} Uploaded`}
          </span>
          <span className="text-[11px] text-slate-400 font-normal">KNIT Academic Repository</span>
        </div>

        {isLoading ? (
          <div className="bg-white border border-slate-200 rounded-2xl py-20 shadow-xs">
            <Loader message="Loading your uploaded documents..." size="md" />
          </div>
        ) : uploads.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 shadow-xs">
            <EmptyState
              icon={UploadCloud}
              title={
                activeTab
                  ? `No ${activeTab} uploads found`
                  : 'You have not uploaded any study materials yet'
              }
              description={
                activeTab
                  ? `There are currently no uploaded documents with the status "${activeTab}".`
                  : 'Upload your class notes, previous year question papers, or practical files to help junior students excel.'
              }
              actionLabel="Upload First Material"
              onAction={() => (window.location.href = '/upload')}
            />
          </div>
        ) : (
          <div className="space-y-3.5">
            {uploads.map((item) => (
              <div
                key={item._id}
                className="bg-white hover:bg-slate-50/50 border border-slate-200/90 hover:border-blue-300 rounded-2xl p-4.5 sm:p-5 shadow-2xs hover:shadow-xs transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm sm:text-base text-slate-900 line-clamp-1">
                        {item.title}
                      </span>
                      {getStatusBadge(item.verificationStatus)}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-slate-500">
                      <span className="font-bold text-blue-900 bg-blue-50/90 px-2 py-0.5 rounded border border-blue-200/90 text-[11px]">
                        {item.subjectId?.shortName || item.subjectId?.code || 'KNIT'}
                      </span>
                      <Badge variant={item.resourceType} size="sm">
                        {item.resourceType?.toUpperCase()}
                      </Badge>
                      {item.unit && (
                        <span className="text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 text-[11px]">
                          Unit {item.unit}
                        </span>
                      )}
                      <span>•</span>
                      <span>{item.branch}</span>
                      <span>•</span>
                      <span>Sem {item.semester}</span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                      <span>{formatFileSize(item.fileSize)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3 text-slate-400" />
                        {item.downloadsCount || 0} downloads
                      </span>
                      <span>•</span>
                      <span>
                        Uploaded on{' '}
                        {new Date(item.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <Link to={`/resources/${item._id}`}>
                      <Button variant="secondary" size="sm" className="font-semibold text-slate-700">
                        View Details
                      </Button>
                    </Link>

                    {item.fileUrl && (
                      <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm" icon={Download} className="font-semibold text-slate-800 border-slate-200 hover:border-blue-600 hover:text-blue-700">
                          PDF
                        </Button>
                      </a>
                    )}
                  </div>
                </div>

                {/* Rejection notice box if rejected with improvement feedback */}
                {item.verificationStatus === 'rejected' && (
                  <div className="p-3.5 bg-rose-50/90 border border-rose-200/90 rounded-xl text-xs text-rose-900 space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-md bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-rose-950">
                            Revision Needed • Moderator Feedback
                          </span>
                          <span className="text-[10px] font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                            Action Required
                          </span>
                        </div>
                        <p className="text-slate-800 italic bg-white/80 p-2.5 rounded-lg border border-rose-200/70 font-medium">
                          "{item.rejectionReason || 'Document did not meet verification standards. Please review academic guidelines and submit an updated document.'}"
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2 pt-1 border-t border-rose-200/60">
                      <Link to="/upload">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={BookOpen}
                          className="text-[11px] font-semibold border-rose-200 text-slate-700 hover:bg-white"
                        >
                          Upload Guidelines
                        </Button>
                      </Link>
                      <Link
                        to={`/upload?reupload=true&title=${encodeURIComponent(item.title)}&branch=${encodeURIComponent(item.branch || '')}&semester=${item.semester || ''}&subjectId=${item.subjectId?._id || ''}&resourceType=${item.resourceType || 'notes'}&unit=${item.unit || ''}&feedback=${encodeURIComponent(item.rejectionReason || '')}`}
                      >
                        <Button
                          variant="primary"
                          size="sm"
                          icon={RotateCcw}
                          className="text-[11px] font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                        >
                          Fix & Re-upload Material
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
