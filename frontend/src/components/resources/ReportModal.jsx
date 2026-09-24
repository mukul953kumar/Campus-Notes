import React, { useState } from 'react';
import { reportService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import Select from '../common/Select';
import {
  Flag,
  X,
  AlertCircle,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';

const REASON_OPTIONS = [
  { value: 'wrong_subject', label: 'Wrong Subject, Semester, or Branch tagged' },
  { value: 'poor_quality', label: 'Blurry, unreadable, or cut-off handwriting' },
  { value: 'broken_pdf', label: 'Damaged or blank PDF file' },
  { value: 'duplicate', label: 'Duplicate of an existing document' },
  { value: 'copyright', label: 'Copyright violation / Commercial textbook scan' },
  { value: 'inappropriate', label: 'Spam, promotional, or inappropriate content' },
  { value: 'other', label: 'Other academic inaccuracy' },
];

export default function ReportModal({
  isOpen = false,
  onClose,
  resourceId,
  resourceTitle = '',
}) {
  const { isAuthenticated } = useAuth();

  const [reason, setReason] = useState('wrong_subject');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isAuthenticated) {
      setErrorMessage('Please sign in with your college account to report materials.');
      return;
    }

    if (!reason) {
      setErrorMessage('Please select a report category.');
      return;
    }

    setIsSubmitting(true);
    try {
      await reportService.createReport({
        resourceId,
        reason,
        description: description.trim(),
      });
      setIsSuccess(true);
    } catch (err) {
      if (err.status === 409) {
        setErrorMessage('You have already submitted a pending report for this material.');
      } else {
        setErrorMessage(err.message || 'Failed to submit report. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setErrorMessage('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Flag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Report Study Material</h3>
              <p className="text-xs text-slate-500">Flag incorrect or poor-quality content</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {isSuccess ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Report Submitted</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Thank you for keeping KNIT academic resources accurate. Platform moderators will review this document shortly.
              </p>
              <div className="pt-3">
                <Button variant="primary" size="md" onClick={handleClose}>
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Resource Title Preview */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-400 font-medium">Document:</span>
                <p className="font-semibold text-slate-800 line-clamp-1 mt-0.5">
                  {resourceTitle || 'Academic Resource'}
                </p>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Reason Selector */}
              <Select
                label="Reason Category"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                options={REASON_OPTIONS}
                required
              />

              {/* Description */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
                  Additional Details (Optional)
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  placeholder="Explain what is incorrect (e.g. 'Page 3 is missing', 'Tagged as DBMS but actually Operating Systems')..."
                  className="w-full bg-white text-slate-900 placeholder:text-slate-400 text-xs border border-slate-300 hover:border-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 rounded-lg p-2.5 transition-colors focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 text-right">
                  {description.length}/500
                </span>
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <Button variant="outline" size="sm" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="danger"
                  size="sm"
                  icon={Flag}
                  isLoading={isSubmitting}
                >
                  Submit Report
                </Button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
}
