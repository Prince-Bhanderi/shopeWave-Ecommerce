import { useEffect, useState } from 'react';
import { UserCircle } from 'lucide-react';
import reviewService from '../../api/reviewService';
import RatingStars from '../common/RatingStars';
import SectionHeader from './SectionHeader';
import { ProductGridSkeleton } from '../common/Skeleton';

const TestimonialSection = () => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    reviewService
      .getRecentReviews(6)
      .then((res) => {
        if (!ignore) setReviews(res.data.data);
      })
      .catch(() => {})
      .finally(() => !ignore && setIsLoading(false));
    return () => {
      ignore = true;
    };
  }, []);

  if (!isLoading && reviews.length === 0) return null;

  return (
    <section className="container-app py-12">
      <SectionHeader title="What our customers say" subtitle="Real reviews from real ShopWave shoppers" />

      {isLoading ? (
        <ProductGridSkeleton count={3} />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <div key={review._id} className="card flex flex-col gap-3 p-5">
              <RatingStars rating={review.rating} size="sm" />
              <p className="line-clamp-4 text-sm leading-relaxed text-slate-600">&ldquo;{review.comment}&rdquo;</p>
              <div className="mt-auto flex items-center gap-2.5 pt-2">
                {review.user?.avatar?.url ? (
                  <img src={review.user.avatar.url} alt="" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <UserCircle className="h-8 w-8 text-slate-300" />
                )}
                <div>
                  <p className="text-sm font-semibold text-slate-800">{review.user?.name || 'ShopWave customer'}</p>
                  <p className="text-xs text-slate-400">on {review.product?.name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default TestimonialSection;
