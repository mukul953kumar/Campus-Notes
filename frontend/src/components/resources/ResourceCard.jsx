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

function WhatsAppIcon({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

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

  const handleWhatsAppShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const noteUrl = `${window.location.origin}/resources/${resource._id}`;
    const shareText = `📚 *${resource.title}*\n🎓 Branch: ${resource.branch || 'KNIT'} | Sem ${resource.semester || ''}\n📄 Verified Study Material on Campus Notes\n👉 View & Download: ${noteUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank', 'noopener,noreferrer');
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
      
      {/* Top Header: Icon, Badges, WhatsApp & Bookmark */}
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

          {/* Action Icons: WhatsApp Share & Bookmark */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-200 transition-all cursor-pointer shadow-2xs"
              title="Share note on WhatsApp"
            >
              <WhatsAppIcon className="w-4 h-4 fill-[#25D366]" />
            </button>

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

          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <span className="inline-flex items-center gap-1 text-slate-600" title="Total Views">
              <Eye className="w-3 h-3 text-slate-400" />
              <span>{resource.viewsCount || 0}</span>
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-slate-600 font-medium" title="Total Downloads">
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
