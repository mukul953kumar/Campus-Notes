import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  BookOpen,
  HelpCircle,
  Code,
  FileCheck,
  Download,
  Bookmark,
  Calendar,
  Layers,
  Star,
  Lock,
  ArrowUpRight
} from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { resourceService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

function getResourceTypeMeta(type) {
  const lower = String(type || '').toLowerCase();
  if (lower === 'pyq') {
    return {
      icon: HelpCircle,
      iconBoxStyle: 'bg-purple-50 text-purple-700 border-purple-200/90 group-hover:bg-purple-100/90',
      badgeVariant: 'pyq'
    };
  }
  if (lower === 'notes') {
    return {
      icon: BookOpen,
      iconBoxStyle: 'bg-blue-50 text-blue-700 border-blue-200/90 group-hover:bg-blue-100/90',
      badgeVariant: 'notes'
    };
  }
  if (lower === 'assignment') {
    return {
      icon: FileCheck,
      iconBoxStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200/90 group-hover:bg-emerald-100/90',
      badgeVariant: 'assignment'
    };
  }
  if (lower === 'practical' || lower === 'labfile' || lower === 'practicalfile') {
    return {
      icon: Code,
      iconBoxStyle: 'bg-amber-50 text-amber-700 border-amber-200/90 group-hover:bg-amber-100/90',
      badgeVariant: 'practical'
    };
  }
  return {
    icon: FileText,
    iconBoxStyle: 'bg-slate-50 text-slate-700 border-slate-200/90 group-hover:bg-slate-100/90',
    badgeVariant: 'default'
  };
}

export default function ResourceRow({
  resource,
  isSaved = false,
  onToggleSave,
}) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadCount, setDownloadCount] = useState(
    resource.downloadsCount ?? resource.downloadCount ?? 0
  );

  const { icon: TypeIcon, iconBoxStyle, badgeVariant } = getResourceTypeMeta(resource.resourceType);

  const formatFileSize = (bytes) => {
    if (!bytes || bytes <= 0) return 'PDF Document';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  const uploadDate = resource.createdAt
    ? new Date(resource.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const subjectLabel = resource.subjectId?.shortName || resource.subjectId?.code || 'KNIT';

  const handleDetailsClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      navigate('/login', {
        state: { from: { pathname: `/resources/${resource._id}` } }
      });
    }
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', {
        state: { from: { pathname: `/resources/${resource._id}` } }
      });
      return;
    }

    if (!resource._id) return;
    setIsDownloading(true);
    try {
      const res = await resourceService.downloadResource(resource._id);
      if (res?.data?.fileUrl) {
        window.open(res.data.fileUrl, '_blank', 'noopener,noreferrer');
        const nextCount = res.data.downloadsCount !== undefined
          ? res.data.downloadsCount
          : ((prev) => prev + 1);
        setDownloadCount(nextCount);
      } else if (resource.fileUrl) {
        window.open(resource.fileUrl, '_blank', 'noopener,noreferrer');
      }
    } catch {
      if (resource.fileUrl) {
        window.open(resource.fileUrl, '_blank', 'noopener,noreferrer');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSaveClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      navigate('/login', {
        state: { from: { pathname: `/resources/${resource._id}` } }
      });
      return;
    }
    if (onToggleSave) {
      onToggleSave(resource._id);
    }
  };

  return (
    <div className="group p-4 sm:px-6 sm:py-4.5 bg-white hover:bg-slate-50/70 border-b border-slate-100 last:border-b-0 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-5">
      
      {/* Left: Type-specific Icon & Metadata */}
      <div className="flex items-start gap-3.5 sm:gap-4 min-w-0 flex-1">
        
        {/* Dynamic Colorful Icon Box */}
        <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 transition-colors shadow-2xs ${iconBoxStyle}`}>
          <TypeIcon className="w-5 h-5" />
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          
          {/* Top Title & Verified Status */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/resources/${resource._id}`}
              onClick={handleDetailsClick}
              className="text-sm sm:text-[15px] font-bold text-slate-900 hover:text-blue-700 transition-colors line-clamp-1 tracking-tight"
              title={resource.title}
            >
              {resource.title}
            </Link>

            {resource.verificationStatus === 'verified' && (
              <Badge variant="verified" size="sm" showIcon>
                Verified
              </Badge>
            )}
          </div>

          {/* Academic categorization chips */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
            {/* Subject Code in distinct Blue Chip */}
            <span className="font-bold text-blue-900 bg-blue-50/90 px-2 py-0.5 rounded border border-blue-200/90 text-[11px]">
              {subjectLabel}
            </span>

            {/* Color-coded Resource Type */}
            <Badge variant={badgeVariant} size="sm">
              {resource.resourceType?.toUpperCase()}
            </Badge>

            {resource.unit ? (
              <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                <Layers className="w-3 h-3 text-slate-400" />
                <span>Unit {resource.unit}</span>
              </span>
            ) : (
              <span className="text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/70 text-[11px]">
                Full Syllabus
              </span>
            )}

            {resource.resourceType === 'pyq' && resource.examYear && (
              <span className="font-medium text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 text-[11px]">
                {resource.examYear} {resource.examType || 'Exam'}
              </span>
            )}

            <span className="hidden md:inline text-slate-300">•</span>
            <span className="hidden md:inline truncate text-slate-500 text-[11px]">
              By <strong className="font-medium text-slate-700">{resource.uploaderId?.name || 'KNIT Student'}</strong>
            </span>
          </div>

          {/* Bottom Micro-Stats: Rating, File Size, Downloads, Date */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-[11px] text-slate-500 pt-0.5">
            {/* Rating Display */}
            {resource.ratingsCount > 0 ? (
              <span className="inline-flex items-center gap-1 font-bold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/90 text-[11px]">
                <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                <span>{resource.averageRating ? resource.averageRating.toFixed(1) : '5.0'}</span>
                <span className="text-amber-700 font-normal text-[10px]">({resource.ratingsCount})</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-slate-400 text-[11px]">
                <Star className="w-3 h-3 text-slate-300" />
                <span>Unrated</span>
              </span>
            )}

            <span>•</span>
            <span>{formatFileSize(resource.fileSize)}</span>

            <span>•</span>
            <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
              <Download className="w-3 h-3 text-slate-400" />
              <span>{downloadCount} {downloadCount === 1 ? 'download' : 'downloads'}</span>
            </span>

            {uploadDate && (
              <>
                <span>•</span>
                <span className="text-slate-400">{uploadDate}</span>
              </>
            )}
          </div>

        </div>
      </div>

      {/* Right: Quick Action Controls */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pt-1 sm:pt-0">
        {onToggleSave && (
          <button
            type="button"
            onClick={handleSaveClick}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isSaved
                ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-2xs'
                : 'bg-white text-slate-400 hover:text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title={isSaved ? 'Remove from Saved' : (isAuthenticated ? 'Save Bookmark' : 'Sign in to save')}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-blue-700' : ''}`} />
          </button>
        )}

        <Link to={`/resources/${resource._id}`} onClick={handleDetailsClick}>
          <Button variant="secondary" size="sm" className="font-semibold text-slate-700">
            Details
          </Button>
        </Link>

        <Button
          variant="outline"
          size="sm"
          icon={isAuthenticated ? Download : Lock}
          onClick={handleDownload}
          isLoading={isDownloading}
          className="text-slate-800 font-semibold border-slate-200 hover:border-blue-600 hover:text-blue-700"
          title={isAuthenticated ? 'Download PDF' : 'Sign in to download PDF'}
        >
          PDF
        </Button>
      </div>

    </div>
  );
}
