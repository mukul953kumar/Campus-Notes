import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  BookOpen,
  HelpCircle,
  Code,
  FileCheck,
  Download,
  Bookmark,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';

function getResourceIcon(type) {
  switch (type) {
    case 'pyq':
      return HelpCircle;
    case 'notes':
      return BookOpen;
    case 'assignment':
      return FileCheck;
    case 'practical':
      return Code;
    default:
      return FileText;
  }
}

export default function ResourceRow({
  resource,
  isSaved = false,
  onToggleSave,
}) {
  const Icon = getResourceIcon(resource.resourceType);

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
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

  return (
    <div className="group p-4 sm:p-4.5 bg-white hover:bg-slate-50/80 border-b border-slate-200/90 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
      
      {/* Left: Icon & Resource Details */}
      <div className="flex items-start gap-3.5 min-w-0 flex-1">
        <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 shrink-0 mt-0.5 group-hover:bg-blue-100/70 transition-colors">
          <Icon className="w-5 h-5" />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          {/* Top row: Title and status tags */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/resources/${resource._id}`}
              className="text-sm font-semibold text-slate-900 hover:text-blue-700 transition-colors line-clamp-1"
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

          {/* Academic metadata chips */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/80">
              {subjectLabel}
            </span>

            <Badge variant={resource.resourceType} size="sm">
              {resource.resourceType?.toUpperCase()}
            </Badge>

            {resource.unit ? (
              <span className="flex items-center gap-1 text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/70">
                <Layers className="w-3 h-3 text-slate-400" />
                Unit {resource.unit}
              </span>
            ) : (
              <span className="text-slate-500">Full Syllabus</span>
            )}

            {resource.resourceType === 'pyq' && resource.examYear && (
              <span className="text-slate-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                {resource.examYear} {resource.examType || 'Exam'}
              </span>
            )}

            <span className="hidden md:inline text-slate-300">•</span>
            <span className="hidden md:inline truncate text-slate-500">
              By {resource.uploaderId?.name || 'KNIT Student'}
            </span>
          </div>

          {/* Bottom metadata */}
          <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
            <span>{formatFileSize(resource.fileSize)}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3 text-slate-400" />
              {resource.downloadsCount || 0} downloads
            </span>
            {uploadDate && (
              <>
                <span>•</span>
                <span>{uploadDate}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: Quick Actions */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        {onToggleSave && (
          <button
            type="button"
            onClick={() => onToggleSave(resource._id)}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              isSaved
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-white text-slate-400 hover:text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title={isSaved ? 'Remove from Saved' : 'Save Bookmark'}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-blue-700' : ''}`} />
          </button>
        )}

        <Link to={`/resources/${resource._id}`}>
          <Button variant="secondary" size="sm">
            Details
          </Button>
        </Link>

        {resource.fileUrl && (
          <a
            href={resource.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Direct Download PDF"
          >
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              className="text-slate-700"
            >
              PDF
            </Button>
          </a>
        )}
      </div>

    </div>
  );
}
