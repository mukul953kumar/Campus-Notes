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
  ExternalLink,
  ShieldCheck,
  Eye
} from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { resourceService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

function getResourceTypeMeta(type, title = '') {
  const lowerType = String(type || '').toLowerCase();
  const lowerTitle = String(title || '').toLowerCase();

  if (
    lowerType === 'pyq' ||
    lowerTitle.includes('pyq') ||
    lowerTitle.includes('question paper') ||
    lowerTitle.includes('end-sem') ||
    lowerTitle.includes('mid-sem') ||
    lowerTitle.includes('ct1') ||
    lowerTitle.includes('ct2') ||
    lowerTitle.includes('class test')
  ) {
    return {
      icon: HelpCircle,
      iconBoxStyle: 'bg-purple-50 text-purple-700 border-purple-200/90 group-hover:bg-purple-100/90',
      badgeVariant: 'pyq',
      displayType: 'PYQ'
    };
  }
  if (lowerType === 'assignment' || lowerTitle.includes('assignment')) {
    return {
      icon: FileCheck,
      iconBoxStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200/90 group-hover:bg-emerald-100/90',
      badgeVariant: 'assignment',
      displayType: 'ASSIGNMENT'
    };
  }
  if (
    lowerType === 'practical' ||
    lowerType === 'labfile' ||
    lowerType === 'practicalfile' ||
    lowerTitle.includes('practical') ||
    lowerTitle.includes('lab manual') ||
    lowerTitle.includes('lab file')
  ) {
    return {
      icon: Code,
      iconBoxStyle: 'bg-amber-50 text-amber-700 border-amber-200/90 group-hover:bg-amber-100/90',
      badgeVariant: 'practical',
      displayType: 'PRACTICAL'
    };
  }
  return {
    icon: BookOpen,
    iconBoxStyle: 'bg-blue-50 text-blue-700 border-blue-200/90 group-hover:bg-blue-100/90',
    badgeVariant: 'notes',
    displayType: 'NOTES'
  };
}

export default function ResourceCard({
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

  const { icon: TypeIcon, iconBoxStyle, badgeVariant, displayType } = getResourceTypeMeta(
    resource.resourceType,
    resource.title
  );

  const formatFileSize = (bytes) => {
    const num = Number(bytes);
    if (!bytes || isNaN(num) || num <= 0) return 'PDF Document';
    const mb = num / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    const kb = num / 1024;
    if (kb >= 1) return `${kb.toFixed(0)} KB`;
    return 'PDF Document';
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
    e.preventDefault();
    if (!isAuthenticated) {
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
    <div className="group bg-white hover:bg-slate-50/40 border border-slate-200 hover:border-blue-300 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between h-full space-y-4">
      
      {/* Top Header: Icon, Badges & Bookmark */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 transition-colors shadow-2xs ${iconBoxStyle}`}>
              <TypeIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-blue-900 bg-blue-50/90 px-2 py-0.5 rounded border border-blue-200/90 text-[11px]">
                  {subjectLabel}
                </span>
                <Badge variant={badgeVariant} size="sm">
                  {displayType}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Sem {resource.semester} • {resource.branch ? resource.branch.split(' ')[0] : 'General'}
              </p>
            </div>
          </div>

          {/* Bookmark Button */}
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
        </div>

        {/* Title */}
        <div>
          <Link
            to={`/resources/${resource._id}`}
            onClick={handleDetailsClick}
            className="text-sm font-bold text-slate-900 hover:text-blue-700 transition-colors line-clamp-2 leading-snug tracking-tight"
            title={resource.title}
          >
            {resource.title}
          </Link>
        </div>

        {/* Categorization & Metadata Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          {resource.unit ? (
            <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
              <Layers className="w-3 h-3 text-slate-400" />
              <span>Unit {resource.unit}</span>
            </span>
          ) : (
            <span className="text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/70">
              Full Syllabus
            </span>
          )}

          {resource.examYear && (
            <span className="font-medium text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              {resource.examYear} {resource.examType || 'Exam'}
            </span>
          )}

          {resource.verificationStatus === 'verified' && (
            <Badge variant="verified" size="sm" showIcon>
              Verified
            </Badge>
          )}
        </div>
      </div>

      {/* Middle/Bottom: Uploader, Ratings & File Stats */}
      <div className="pt-3 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="truncate text-[11px]">
            By <strong className="font-medium text-slate-700">{resource.uploaderId?.name || 'Student'}</strong>
          </span>

          {uploadDate && (
            <span className="text-[10px] text-slate-400 shrink-0">{uploadDate}</span>
          )}
        </div>

        {/* Stats Strip */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50/70 p-2 rounded-xl border border-slate-100">
          <div className="flex items-center gap-1">
            {resource.ratingsCount > 0 ? (
              <span className="inline-flex items-center gap-1 font-bold text-amber-900">
                <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                <span>{resource.averageRating ? resource.averageRating.toFixed(1) : '5.0'}</span>
                <span className="text-amber-700 font-normal text-[10px]">({resource.ratingsCount})</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-slate-400 text-[10px]">
                <Star className="w-3 h-3 text-slate-300" />
                <span>Unrated</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-slate-500">
            <span>{formatFileSize(resource.fileSize)}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
              <Download className="w-3 h-3 text-slate-400" />
              <span>{downloadCount}</span>
            </span>
          </div>
        </div>

        {/* Bottom Actions Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Link to={`/resources/${resource._id}`} onClick={handleDetailsClick} className="w-full">
            <Button
              variant="secondary"
              size="sm"
              className="w-full justify-center font-semibold text-slate-700"
            >
              Details
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            icon={isAuthenticated ? Download : Lock}
            onClick={handleDownload}
            isLoading={isDownloading}
            className="w-full justify-center text-slate-800 font-semibold border-slate-200 hover:border-blue-600 hover:text-blue-700"
          >
            PDF
          </Button>
        </div>
      </div>

    </div>
  );
}
