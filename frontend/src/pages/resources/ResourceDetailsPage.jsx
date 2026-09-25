import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { resourceService, adminService } from '../../services/api';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ReportModal from '../../components/resources/ReportModal';
import RatingStars from '../../components/resources/RatingStars';
import ResourceReviewsSection from '../../components/resources/ResourceReviewsSection';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft,
  Download,
  Bookmark,
  Share2,
  Flag,
  FileText,
  Calendar,
  Layers,
  GraduationCap,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Maximize2,
  Minimize2,
  Sparkles,
  Star,
  Trash2,
  AlertTriangle,
  Check
} from 'lucide-react';

export default function ResourceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, savedIds, toggleBookmark } = useAuth();

  const [resource, setResource] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isSaved = savedIds.includes(id);

  useEffect(() => {
    async function loadResource() {
      setIsLoading(true);
      setErrorMessage('');
      try {
        const response = await resourceService.getResourceById(id);
        if (response && response.data) {
          setResource(response.data);
        } else {
          setErrorMessage('Resource not found or no longer available.');
        }
      } catch (err) {
        setErrorMessage(err.message || 'Failed to load resource details.');
      } finally {
        setIsLoading(false);
      }
    }

    loadResource();
  }, [id]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreenPreview) {
        setIsFullscreenPreview(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreenPreview]);

  const handleToggleSave = async () => {
    try {
      await toggleBookmark(id);
    } catch (e) {
      console.error('Error toggling bookmark:', e);
    }
  };

  const handleDownload = async () => {
    if (!resource) return;
    setIsDownloading(true);
    try {
      const result = await resourceService.downloadResource(resource._id);
      if (result?.data?.fileUrl) {
        // Open download link in new tab or trigger download
        window.open(result.data.fileUrl, '_blank', 'noopener,noreferrer');
        // Update download counter with authoritative server response
        const nextCount = result.data.downloadsCount !== undefined
          ? result.data.downloadsCount
          : ((prev.downloadsCount || prev.downloadCount || 0) + 1);
        setResource((prev) => ({
          ...prev,
          downloadsCount: nextCount,
          downloadCount: nextCount
        }));
      }
    } catch (err) {
      // Fallback to direct fileUrl if download API fails
      if (resource.fileUrl) {
        window.open(resource.fileUrl, '_blank', 'noopener,noreferrer');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  if (isLoading) {
    return (
      <div className="py-24">
        <Loader message="Loading academic resource..." size="lg" />
      </div>
    );
  }

  if (errorMessage || !resource) {
    return (
      <div className="py-12">
        <EmptyState
          title="Document Unavailable"
          description={errorMessage || 'The requested study material does not exist or may have been deleted.'}
          actionLabel="Back to Library"
          onAction={() => navigate('/resources')}
        />
      </div>
    );
  }

  const handleAdminDeleteResource = async () => {
    setIsDeleting(true);
    try {
      await adminService.deleteResource(resource._id);
      setShowDeleteModal(false);
      navigate('/resources', { replace: true });
    } catch (err) {
      alert(err.message || 'Failed to delete resource.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAdminApproveResource = async () => {
    try {
      const res = await adminService.verifyResource(resource._id, 'approve');
      if (res?.data) {
        setResource(res.data);
      }
    } catch (err) {
      alert(err.message || 'Failed to approve resource.');
    }
  };

  const uploadDate = resource.createdAt
    ? new Date(resource.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <div className="space-y-6 py-2">
      
      {/* Admin Moderation Toolbar (Visible to Admins Only) */}
      {user?.role === 'admin' && (
        <div className="bg-purple-50/90 border border-purple-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-700 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-purple-950">Administrative Moderation Mode</p>
              <p className="text-[11px] text-purple-700">
                You have elevated privileges to moderate or remove this material from the entire campus catalog.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            {resource.verificationStatus !== 'verified' && (
              <Button
                variant="success"
                size="sm"
                icon={Check}
                onClick={handleAdminApproveResource}
              >
                Approve Live
              </Button>
            )}

            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={() => setShowDeleteModal(true)}
            >
              Delete Material
            </Button>

            <Link to="/admin">
              <Button variant="secondary" size="sm">
                Admin Portal
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Top Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/resources"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Resource Library</span>
        </Link>

        <div className="flex items-center gap-2">
          {resource.verificationStatus === 'verified' ? (
            <Badge variant="verified" size="sm" showIcon>
              Verified Document
            </Badge>
          ) : (
            <Badge variant="pending" size="sm" showIcon>
              Pending Verification
            </Badge>
          )}
        </div>
      </div>

      {/* Main Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {resource.subjectId?.code || 'KNIT'}
              </span>
              <Badge variant={resource.resourceType} size="sm">
                {resource.resourceType?.toUpperCase()}
              </Badge>
              {resource.unit && (
                <span className="text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                  Unit {resource.unit}
                </span>
              )}
              {resource.examYear && (
                <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  {resource.examYear} {resource.examType || 'Exam'}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {resource.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 flex flex-wrap items-center gap-2">
              <span className="font-medium text-slate-700">
                {resource.subjectId?.name}
              </span>
              <span>•</span>
              <span>{resource.branch}</span>
              <span>•</span>
              <span>Semester {resource.semester}</span>
            </p>

            {/* Average Rating Bar in Header */}
            <div className="flex items-center gap-2 pt-1 text-xs">
              <RatingStars rating={resource.averageRating || 0} size="sm" />
              <span className="font-bold text-slate-800">
                {resource.averageRating ? resource.averageRating.toFixed(1) : 'Not rated yet'}
              </span>
              {resource.ratingsCount > 0 && (
                <span className="text-slate-500">
                  ({resource.ratingsCount} {resource.ratingsCount === 1 ? 'rating' : 'ratings'})
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              variant="primary"
              size="lg"
              icon={Download}
              onClick={handleDownload}
              isLoading={isDownloading}
            >
              Download PDF ({formatFileSize(resource.fileSize)})
            </Button>

            <Button
              variant={isSaved ? 'secondary' : 'outline'}
              size="lg"
              icon={Bookmark}
              onClick={handleToggleSave}
              className={isSaved ? 'text-blue-700 border-blue-200 bg-blue-50' : ''}
            >
              {isSaved ? 'Saved' : 'Save'}
            </Button>

            <button
              type="button"
              onClick={handleShare}
              title="Share Link"
              className="p-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

        </div>

        {copiedLink && (
          <div className="mt-4 p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Link copied to clipboard!</span>
          </div>
        )}
      </div>

      {/* Two Column Layout: PDF Viewer on Left, Metadata & Uploader on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Span 2): PDF In-Browser Preview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col">
            
            {/* Viewer Controls Bar */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-700" />
                <span className="font-semibold text-slate-800">In-Browser Document Preview</span>
              </div>

              <button
                type="button"
                onClick={() => setIsFullscreenPreview(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200/90 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs"
                title="Open Fullscreen Reader"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Expand to Fullscreen</span>
              </button>
            </div>

            {/* Embedded PDF iframe */}
            <div className="w-full h-[640px] bg-slate-900">
              {resource.fileUrl ? (
                <iframe
                  src={`${resource.fileUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                  title={resource.title}
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
                  <FileText className="w-12 h-12 mb-3 text-slate-600" />
                  <p className="text-sm">Preview is not directly embeddable for this file.</p>
                  <Button
                    variant="primary"
                    size="sm"
                    className="mt-4"
                    onClick={handleDownload}
                  >
                    Download to View
                  </Button>
                </div>
              )}
            </div>

            {/* Fallback Notice */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
              Having trouble viewing? Use the "Download PDF" button to view locally.
            </div>

          </div>

          {/* Immersive Fullscreen PDF Reader Overlay */}
          {isFullscreenPreview && resource.fileUrl && (
            <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col p-2 sm:p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl flex-1 flex flex-col overflow-hidden shadow-2xl">
                
                {/* Fullscreen Header */}
                <div className="px-4 sm:px-6 py-3 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm font-bold text-white truncate">{resource.title}</h2>
                      <p className="text-[11px] text-slate-400">
                        {resource.subjectId?.name || 'Academic Material'} • {formatFileSize(resource.fileSize)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Download}
                      onClick={handleDownload}
                      isLoading={isDownloading}
                      className="hidden sm:inline-flex shadow-xs"
                    >
                      Download PDF
                    </Button>

                    <button
                      type="button"
                      onClick={() => setIsFullscreenPreview(false)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-slate-700 shadow-2xs"
                      title="Exit Fullscreen (Esc)"
                    >
                      <Minimize2 className="w-3.5 h-3.5" />
                      <span>Exit Fullscreen</span>
                    </button>
                  </div>
                </div>

                {/* Edge-to-edge PDF Viewer */}
                <div className="flex-1 w-full bg-slate-950">
                  <iframe
                    src={`${resource.fileUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                    title={resource.title}
                    className="w-full h-full border-0"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Student Ratings & Peer Reviews Section */}
          <ResourceReviewsSection
            resourceId={resource._id}
            resourceTitle={resource.title}
            onRatingUpdated={(newAverage, newCount) => {
              setResource((prev) => ({
                ...prev,
                averageRating: newAverage,
                ratingsCount: newCount
              }));
            }}
          />
        </div>

        {/* Right Column: Academic Metadata & Uploader Credibility */}
        <div className="space-y-6">
          
          {/* Uploader Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Uploaded By
            </h2>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold text-sm shrink-0">
                {resource.uploaderId?.avatar ? (
                  <img
                    src={resource.uploaderId.avatar}
                    alt={resource.uploaderId.name}
                    className="w-full h-full rounded-xl object-cover"
                  />
                ) : (
                  resource.uploaderId?.name?.slice(0, 2).toUpperCase() || 'ST'
                )}
              </div>

              <div className="space-y-0.5 truncate">
                <p className="font-semibold text-sm text-slate-900 truncate">
                  {resource.uploaderId?.name || 'KNIT Student'}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified Contributor</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 space-y-1.5">
              <p className="flex items-center justify-between">
                <span>College:</span>
                <span className="font-medium text-slate-700">KNIT Sultanpur</span>
              </p>
              <p className="flex items-center justify-between">
                <span>Uploaded on:</span>
                <span className="font-medium text-slate-700">{uploadDate}</span>
              </p>
              <p className="flex items-center justify-between">
                <span>Total Downloads:</span>
                <span className="font-semibold text-slate-900">
                  {resource.downloadsCount ?? resource.downloadCount ?? 0}
                </span>
              </p>
            </div>
          </div>

          {/* Academic Metadata Summary Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Document Specs
            </h2>

            <dl className="text-xs space-y-2.5 divide-y divide-slate-100">
              <div className="pt-1 flex items-center justify-between">
                <dt className="text-slate-500">Course Subject</dt>
                <dd className="font-semibold text-slate-800 text-right">
                  {resource.subjectId?.name}
                </dd>
              </div>

              <div className="pt-2.5 flex items-center justify-between">
                <dt className="text-slate-500">Subject Code</dt>
                <dd className="font-mono font-medium text-slate-800">
                  {resource.subjectId?.code || 'N/A'}
                </dd>
              </div>

              <div className="pt-2.5 flex items-center justify-between">
                <dt className="text-slate-500">Branch & Semester</dt>
                <dd className="font-medium text-slate-800 text-right">
                  {resource.branch} • Sem {resource.semester}
                </dd>
              </div>

              <div className="pt-2.5 flex items-center justify-between">
                <dt className="text-slate-500">Unit / Coverage</dt>
                <dd className="font-medium text-slate-800">
                  {resource.unit ? `Unit ${resource.unit}` : 'Complete Syllabus'}
                </dd>
              </div>

              <div className="pt-2.5 flex items-center justify-between">
                <dt className="text-slate-500">File Size</dt>
                <dd className="font-medium text-slate-800">
                  {formatFileSize(resource.fileSize)}
                </dd>
              </div>

              <div className="pt-2.5 flex items-center justify-between">
                <dt className="text-slate-500">Community Rating</dt>
                <dd className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  <span>{resource.averageRating ? resource.averageRating.toFixed(1) : '—'}</span>
                  <span className="text-slate-400 font-normal">({resource.ratingsCount || 0})</span>
                </dd>
              </div>

              <div className="pt-2.5 flex items-center justify-between">
                <dt className="text-slate-500">Format</dt>
                <dd className="font-medium text-slate-800 uppercase">PDF Document</dd>
              </div>
            </dl>
          </div>

          {/* Description & Tags Card */}
          {(resource.description || (resource.tags && resource.tags.length > 0)) && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Topics & Notes
              </h2>

              {resource.description && (
                <p className="text-xs text-slate-600 leading-relaxed">
                  {resource.description}
                </p>
              )}

              {resource.tags && resource.tags.length > 0 && (
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {resource.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Report Issue Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Flag className="w-3.5 h-3.5 text-slate-400" />
              <span>Found an issue with this file?</span>
            </span>
            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              className="text-slate-700 hover:text-red-600 font-semibold cursor-pointer"
            >
              Report
            </button>
          </div>

        </div>

      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        resourceId={resource._id}
        resourceTitle={resource.title}
      />

      {/* Admin Delete Confirmation Modal */}
      {showDeleteModal && (
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
                "{resource.title}"
              </p>
              <p className="text-[11px] text-rose-600 pt-1">
                This will deactivate the document, remove it from all student search results, and delete associated bookmarks.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={handleAdminDeleteResource}
                isLoading={isDeleting}
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
