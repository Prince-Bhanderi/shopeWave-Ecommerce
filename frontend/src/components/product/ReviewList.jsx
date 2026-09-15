import { UserCircle, Pencil, Trash2 } from 'lucide-react';
import RatingStars from '../common/RatingStars';
import EmptyState from '../common/EmptyState';
import { formatDate } from '../../utils/formatters';

const ReviewList = ({ reviews = [], currentUserId, isAdmin, onEdit, onDelete }) => {
  if (reviews.length === 0) {
    return <EmptyState icon={UserCircle} title="No reviews yet" message="Be the first to share your thoughts on this product." />;
  }

  return (
    <ul className="space-y-5">
      {reviews.map((review) => {
        const isOwner = review.user?._id === currentUserId;
        const canManage = isOwner || isAdmin;

        return (
          <li key={review._id} className="border-b border-slate-100 pb-5 last:border-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {review.user?.avatar?.url ? (
                  <img src={review.user.avatar.url} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <UserCircle className="h-10 w-10 text-slate-300" />
                )}
                <div>
                  <p className="text-sm font-semibold text-slate-900">{review.user?.name || 'Anonymous'}</p>
                  <p className="text-xs text-slate-400">{formatDate(review.createdAt)}</p>
                </div>
              </div>

              {canManage && (
                <div className="flex items-center gap-1">
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => onEdit?.(review)}
                      aria-label="Edit review"
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onDelete?.(review)}
                    aria-label="Delete review"
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="mt-2.5">
              <RatingStars rating={review.rating} size="sm" />
              {review.title && <p className="mt-1.5 text-sm font-semibold text-slate-800">{review.title}</p>}
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{review.comment}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default ReviewList;
