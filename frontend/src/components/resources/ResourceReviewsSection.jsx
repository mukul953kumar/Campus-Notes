import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ratingService } from '../../services/api';
import RatingStars from './RatingStars';
import Button from '../common/Button';
import Loader from '../common/Loader';
import {
  Star,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  User,
  LogIn
} from 'lucide-react';
import { Link } from 'react-router-dom';

const RATING_LABELS = {
  1: 'Poor — Not helpful',
  2: 'Fair — Missing details',
  3: 'Good — Average quality',
  4: 'Very Good — Clear & helpful',
  5: 'Excellent — Top tier notes'
};

export default function ResourceReviewsSection({
  resourceId,
  resourceTitle,
  onRatingUpdated
}) {
  const { user } = useAuth();

  const [ratings, setRatings] = useState([]);
  const [summary, setSummary] = useState({
    averageRating: 0,
    totalRatings: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });
  const [userRating, setUserRating] = useState(null);

  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null); // { type: 'success' | 'error', text: '' }
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadRatings = useCallback(async (page = 1) => {
    if (!resourceId) return;
    setIsLoading(true);
    try {
      const response = await ratingService.getResourceRatings(resourceId, { page, limit: 6 });
      if (response && response.data) {
        setRatings(response.data.ratings || []);
        if (response.data.summary) {
          setSummary(response.data.summary);
        }
        if (response.data.userRating) {
          setUserRating(response.data.userRating);
          setSelectedRating(response.data.userRating.rating);
          setReviewText(response.data.userRating.review || '');
        } else {
          setUserRating(null);
          setSelectedRating(0);
          setReviewText('');
        }
        if (response.meta) {
          setCurrentPage(response.meta.page);
          setTotalPages(response.meta.totalPages);
        }
      }
    } catch (err) {
      console.error('Failed to load ratings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [resourceId]);

  useEffect(() => {
    loadRatings(1);
  }, [loadRatings]);

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (selectedRating < 1 || selectedRating > 5) {
      setFeedbackMessage({ type: 'error', text: 'Please select a star rating between 1 and 5.' });
      return;
    }

    setIsSubmitting(true);
    setFeedbackMessage(null);

    try {
      const result = await ratingService.submitRating(resourceId, {
        rating: selectedRating,
        review: reviewText.trim()
      });

      if (result && result.data) {
        setUserRating(result.data.userRating);
        setFeedbackMessage({
          type: 'success',
          text: userRating ? 'Your rating and review have been updated!' : 'Thank you! Your rating has been recorded.'
        });

        if (onRatingUpdated) {
          onRatingUpdated(result.data.averageRating, result.data.ratingsCount);
        }

        // Reload fresh rating list & distribution
        loadRatings(1);
      }
    } catch (err) {
      setFeedbackMessage({
        type: 'error',
        text: err.message || 'Failed to submit rating. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRating = async () => {
    if (!window.confirm('Are you sure you want to remove your rating?')) return;

    setIsDeleting(true);
    setFeedbackMessage(null);

    try {
      const result = await ratingService.deleteRating(resourceId);
      setUserRating(null);
      setSelectedRating(0);
      setReviewText('');
      setFeedbackMessage({ type: 'success', text: 'Your rating has been removed.' });

      if (onRatingUpdated && result?.data) {
        onRatingUpdated(result.data.averageRating, result.data.ratingsCount);
      }

      loadRatings(1);
    } catch (err) {
      setFeedbackMessage({
        type: 'error',
        text: err.message || 'Failed to delete rating.'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const calculatePercentage = (count) => {
    if (!summary.totalRatings || summary.totalRatings === 0) return 0;
    return Math.round((count / summary.totalRatings) * 100);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-7">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Student Ratings & Feedback
            </h2>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              {summary.totalRatings} {summary.totalRatings === 1 ? 'Rating' : 'Ratings'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Peer reviews from verified students who studied these notes.
          </p>
        </div>
      </div>

      {/* Ratings Overview Bar & Stats Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-5 bg-slate-50/80 rounded-xl border border-slate-200/80">
        
        {/* Score Summary Box (Left) */}
        <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-3 border-b md:border-b-0 md:border-r border-slate-200/90">
          <div className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            {summary.averageRating ? summary.averageRating.toFixed(1) : '0.0'}
          </div>
          <div className="mt-2">
            <RatingStars rating={summary.averageRating} size="lg" />
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1.5">
            Based on {summary.totalRatings} student {summary.totalRatings === 1 ? 'review' : 'reviews'}
          </p>
        </div>

        {/* 5-Star Breakdown Bars (Right) */}
        <div className="md:col-span-8 space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = summary.distribution?.[stars] || 0;
            const percentage = calculatePercentage(count);

            return (
              <div key={stars} className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 font-semibold text-slate-700 w-10 shrink-0">
                  <span>{stars}</span>
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                </span>

                <div className="flex-1 h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="w-16 text-right text-slate-500 font-medium shrink-0">
                  <span>{count}</span>
                  <span className="text-slate-400 text-[10px] ml-1">({percentage}%)</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Interactive Rating Form / Authentication Prompt */}
      <div className="border border-slate-200 rounded-xl p-5 sm:p-6 bg-white space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            {userRating ? 'Update Your Rating & Review' : 'Rate this Study Material'}
          </h3>

          {userRating && (
            <button
              type="button"
              onClick={handleDeleteRating}
              disabled={isDeleting}
              className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 hover:underline cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isDeleting ? 'Removing...' : 'Delete Rating'}</span>
            </button>
          )}
        </div>

        {!user ? (
          <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <LogIn className="w-4 h-4 text-blue-700 shrink-0" />
              <span>Please sign in with your college account to submit a rating or review.</span>
            </div>
            <Link to="/login">
              <Button variant="primary" size="sm">
                Sign In to Rate
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmitRating} className="space-y-4">
            
            {/* Interactive Stars & Label */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Your Rating (Required)
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <RatingStars
                  rating={selectedRating}
                  interactive={true}
                  size="xl"
                  onChange={(star) => setSelectedRating(star)}
                  disabled={isSubmitting}
                />
                {selectedRating > 0 && (
                  <span className="text-xs font-medium text-slate-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                    {RATING_LABELS[selectedRating]}
                  </span>
                )}
              </div>
            </div>

            {/* Optional Review Textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="reviewInput" className="font-semibold text-slate-700">
                  Feedback / Helpful Details <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <span className="text-slate-400 text-[11px]">
                  {reviewText.length}/500
                </span>
              </div>
              <textarea
                id="reviewInput"
                rows="3"
                value={reviewText}
                maxLength={500}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share how clear or complete these notes were, specific topics covered, or tips for classmates..."
                disabled={isSubmitting}
                className="w-full text-xs sm:text-sm p-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Feedback alert */}
            {feedbackMessage && (
              <div
                className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  feedbackMessage.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                {feedbackMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                )}
                <span>{feedbackMessage.text}</span>
              </div>
            )}

            {/* Submit Action */}
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                disabled={selectedRating === 0}
              >
                {userRating ? 'Update Rating' : 'Submit Rating'}
              </Button>
            </div>

          </form>
        )}
      </div>

      {/* Reviews List / Empty State */}
      <div className="space-y-4 pt-2">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-700" />
          <span>Student Reviews ({ratings.length})</span>
        </h3>

        {isLoading ? (
          <div className="py-8">
            <Loader message="Loading feedback..." size="sm" />
          </div>
        ) : ratings.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <Star className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs sm:text-sm font-semibold text-slate-700">
              No written reviews yet
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Be the first student to rate and review this document to help classmates across campus!
            </p>
          </div>
        ) : (
          <div className="space-y-3 divide-y divide-slate-100">
            {ratings.map((item) => {
              const reviewDate = item.createdAt
                ? new Date(item.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })
                : '';

              const userName = item.userId?.name || 'Verified Student';
              const userAvatar = item.userId?.avatar;
              const isCurrentUser = user && item.userId?._id === user._id;

              return (
                <div key={item._id} className="pt-3.5 first:pt-0 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    
                    {/* User profile row */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                        {userAvatar ? (
                          <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                        ) : (
                          userName.slice(0, 2).toUpperCase()
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-slate-900">
                            {userName}
                          </p>
                          {isCurrentUser && (
                            <span className="text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.2 rounded">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">{reviewDate}</p>
                      </div>
                    </div>

                    {/* Star score */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <RatingStars rating={item.rating} size="sm" />
                      <span className="text-xs font-bold text-slate-700">
                        {item.rating}.0
                      </span>
                    </div>

                  </div>

                  {/* Review text if available */}
                  {item.review ? (
                    <p className="text-xs text-slate-700 bg-slate-50/70 p-3 rounded-lg border border-slate-200/60 leading-relaxed">
                      {item.review}
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">
                      Rated without additional written notes.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination if multiple review pages */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
            <button
              type="button"
              disabled={currentPage <= 1 || isLoading}
              onClick={() => loadRatings(currentPage - 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <span className="text-slate-500 font-medium">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => loadRatings(currentPage + 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
