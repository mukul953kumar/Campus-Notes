import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { resourceService } from '../../services/api';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ReportModal from '../../components/resources/ReportModal';
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
  Sparkles
} from 'lucide-react';

export default function ResourceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [resource, setResource] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

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

    // Check saved state
    try {
      const savedIds = JSON.parse(localStorage.getItem('campus_notes_saved_ids') || '[]');
      setIsSaved(savedIds.includes(id));
    } catch {
      setIsSaved(false);
    }
  }, [id]);

  const handleToggleSave = () => {
    try {
      const savedIds = JSON.parse(localStorage.getItem('campus_notes_saved_ids') || '[]');
      let updated;
      if (savedIds.includes(id)) {
        updated = savedIds.filter((item) => item !== id);
        setIsSaved(false);
      } else {
        updated = [...savedIds, id];
        setIsSaved(true);
      }
      localStorage.setItem('campus_notes_saved_ids', JSON.stringify(updated));
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
        // Update local download counter
        setResource((prev) => ({
          ...prev,
          downloadsCount: (prev.downloadsCount || 0) + 1,
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

  const uploadDate = resource.createdAt
    ? new Date(resource.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <div className="space-y-6 py-2">
      
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

              <div className="flex items-center gap-2">
                {resource.fileUrl && (
                  <a
                    href={resource.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-slate-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open External</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => setIsFullscreenPreview(!isFullscreenPreview)}
                  className="flex items-center gap-1 text-slate-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Toggle Preview Size"
                >
                  {isFullscreenPreview ? (
                    <Minimize2 className="w-3.5 h-3.5" />
                  ) : (
                    <Maximize2 className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline">
                    {isFullscreenPreview ? 'Collapse' : 'Expand'}
                  </span>
                </button>
              </div>
            </div>

            {/* Embedded PDF iframe */}
            <div className={`w-full bg-slate-900 transition-all duration-200 ${
              isFullscreenPreview ? 'h-[85vh]' : 'h-[620px]'
            }`}>
              {resource.fileUrl ? (
                <iframe
                  src={`${resource.fileUrl}#toolbar=1&navpanes=0`}
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
                  {resource.downloadsCount || 0}
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

    </div>
  );
}
