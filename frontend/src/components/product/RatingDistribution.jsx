import RatingStars from '../common/RatingStars';

const RatingDistribution = ({ averageRating = 0, numReviews = 0, distribution = {} }) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
    <div className="flex shrink-0 flex-col items-center gap-1 sm:items-start">
      <span className="font-display text-4xl font-bold text-slate-900">{averageRating.toFixed(1)}</span>
      <RatingStars rating={averageRating} size="md" />
      <span className="text-sm text-slate-500">{numReviews} review{numReviews === 1 ? '' : 's'}</span>
    </div>

    <div className="flex-1 space-y-1.5">
      {[5, 4, 3, 2, 1].map((star) => {
        const count = distribution[star] || 0;
        const percent = numReviews > 0 ? Math.round((count / numReviews) * 100) : 0;
        return (
          <div key={star} className="flex items-center gap-2 text-sm">
            <span className="w-10 shrink-0 text-slate-600">{star} star</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-amber-400" style={{ width: `${percent}%` }} />
            </div>
            <span className="w-8 shrink-0 text-right text-slate-500">{count}</span>
          </div>
        );
      })}
    </div>
  </div>
);

export default RatingDistribution;
