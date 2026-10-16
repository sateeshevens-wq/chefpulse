import React, { useState } from 'react';
import { Chef, ChefReview, User } from '../../types';
import { Star, ThumbsUp, CheckCircle, ShieldCheck, MessageSquarePlus } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ChefReviewsSectionProps {
  chef: Chef;
  currentUser?: User | null;
  onOpenAuth?: () => void;
  onAddReview?: (newReview: ChefReview) => void;
}

export const ChefReviewsSection: React.FC<ChefReviewsSectionProps> = ({
  chef,
  currentUser,
  onOpenAuth,
  onAddReview,
}) => {
  const [reviewsList, setReviewsList] = useState<ChefReview[]>(chef.reviews || []);
  const [filterType, setFilterType] = useState<string>('all');
  const [showAddReviewModal, setShowAddReviewModal] = useState<boolean>(false);
  const [helpfulLiked, setHelpfulLiked] = useState<Record<string, boolean>>({});

  // New Review Form State
  const [newRating, setNewRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [newServiceType, setNewServiceType] = useState<ChefReview['serviceType']>('SOS Quick-Fix');
  const [newDishes, setNewDishes] = useState<string>('');
  const [newComment, setNewComment] = useState<string>('');
  const [aspectTaste, setAspectTaste] = useState<number>(5);
  const [aspectHygiene, setAspectHygiene] = useState<number>(5);
  const [aspectPunctuality, setAspectPunctuality] = useState<number>(5);

  // Calculate dynamic stats
  const totalReviews = reviewsList.length;
  const avgRating = totalReviews > 0
    ? (reviewsList.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : chef.rating.toFixed(1);

  const starCounts = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviewsList.filter((r) => r.rating === stars).length;
    const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { stars, count, percentage };
  });

  const handleToggleHelpful = (reviewId: string) => {
    setHelpfulLiked((prev) => {
      const isLiked = prev[reviewId];
      const updated = { ...prev, [reviewId]: !isLiked };
      setReviewsList((curr) =>
        curr.map((r) =>
          r.id === reviewId
            ? { ...r, helpfulCount: isLiked ? r.helpfulCount - 1 : r.helpfulCount + 1 }
            : r
        )
      );
      return updated;
    });
  };

  const handleAddReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser && onOpenAuth) {
      onOpenAuth();
      return;
    }

    const review: ChefReview = {
      id: `rev-user-${Date.now()}`,
      chefId: chef.id,
      customerName: currentUser?.name || 'Verified Bangalore Customer',
      customerArea: currentUser?.address || 'Indiranagar, Bengaluru',
      rating: newRating,
      date: 'Just now',
      serviceType: newServiceType,
      dishesOrdered: newDishes || 'Custom Chef Special',
      comment: newComment || 'Delicious dining experience. High attention to hygiene and spice preference.',
      helpfulCount: 1,
      aspects: {
        taste: aspectTaste,
        hygiene: aspectHygiene,
        punctuality: aspectPunctuality,
      },
      verifiedBooking: true,
    };

    setReviewsList([review, ...reviewsList]);
    if (onAddReview) onAddReview(review);
    setShowAddReviewModal(false);
    setNewComment('');
    setNewDishes('');

    try {
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  };

  const filteredReviews = reviewsList.filter((r) => {
    if (filterType === 'all') return true;
    if (filterType === '5stars') return r.rating === 5;
    if (filterType === 'sos') return r.serviceType === 'SOS Quick-Fix';
    if (filterType === 'prep') return r.serviceType === 'Daily Meal Prep';
    if (filterType === 'banquet') return r.serviceType === 'Dinner Party Banquet';
    return true;
  });

  return (
    <div className="mt-5 pt-5 border-t border-neutral-800 space-y-4">
      
      {/* Header with Title and "Leave Review" CTA */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <span>★</span>
            <span>Customer Ratings & Peer Reviews</span>
          </h4>
          <p className="text-[11px] text-neutral-400">
            Validated by verified homeowners & restaurant managers in Bangalore
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddReviewModal(true)}
          className="px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500 hover:text-neutral-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
        >
          <MessageSquarePlus size={13} />
          <span>Write a Review</span>
        </button>
      </div>

      {/* Star Rating Breakdown Panel */}
      <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800/80 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        
        {/* Left: Overall Score */}
        <div className="sm:col-span-4 flex flex-col items-center justify-center text-center sm:border-r sm:border-neutral-800/80 pr-2">
          <div className="text-4xl font-black text-amber-400 tracking-tight flex items-baseline gap-1">
            <span>{avgRating}</span>
            <span className="text-sm font-semibold text-neutral-500">/ 5.0</span>
          </div>
          
          <div className="flex items-center gap-1 my-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={15}
                className="fill-amber-400 text-amber-400"
              />
            ))}
          </div>
          
          <div className="text-[11px] text-neutral-400 font-medium">
            Based on <strong className="text-white">{chef.reviewsCount || totalReviews}</strong> verified bookings
          </div>
        </div>

        {/* Right: Star Distribution Bars */}
        <div className="sm:col-span-8 space-y-1.5">
          {starCounts.map(({ stars, percentage, count }) => (
            <div key={stars} className="flex items-center gap-2 text-xs">
              <span className="w-6 text-[11px] font-bold text-neutral-400 flex items-center justify-end gap-0.5">
                <span>{stars}</span>
                <span className="text-[9px] text-amber-400">★</span>
              </span>
              <div className="flex-1 h-2 rounded-full bg-neutral-800 overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-[10px] text-neutral-500 text-right font-medium">
                {percentage}%
              </span>
            </div>
          ))}
        </div>

      </div>

      {/* Peer Validation Aspect Scores */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="text-[10px] text-neutral-400 font-semibold uppercase">Taste & Flavor</div>
          <div className="text-sm font-black text-white mt-0.5">4.9 ★</div>
          <div className="text-[9px] text-emerald-400 font-medium">99% Satisfied</div>
        </div>
        <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="text-[10px] text-neutral-400 font-semibold uppercase">Kitchen Hygiene</div>
          <div className="text-sm font-black text-emerald-400 mt-0.5">5.0 ★</div>
          <div className="text-[9px] text-emerald-400 font-medium">Spotless Cleanup</div>
        </div>
        <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="text-[10px] text-neutral-400 font-semibold uppercase">Punctuality</div>
          <div className="text-sm font-black text-amber-400 mt-0.5">4.8 ★</div>
          <div className="text-[9px] text-neutral-400 font-medium">Avg 18m arrival</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        {[
          { id: 'all', label: `All (${reviewsList.length})` },
          { id: '5stars', label: '5 ★ Only' },
          { id: 'sos', label: 'SOS Gigs' },
          { id: 'banquet', label: 'Dinner Parties' },
          { id: 'prep', label: 'Meal Prep' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterType(tab.id)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              filterType === tab.id
                ? 'bg-amber-500 text-neutral-950'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Review Cards List */}
      <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
        {filteredReviews.length === 0 ? (
          <div className="py-6 text-center text-xs text-neutral-500">
            No reviews match this filter.
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-3 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 hover:border-neutral-700/80 transition-all space-y-2"
            >
              {/* Reviewer Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-white">{rev.customerName}</span>
                    {rev.verifiedBooking && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded-full border border-emerald-500/20">
                        <CheckCircle size={9} /> Verified Booking
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-neutral-500">
                    📍 {rev.customerArea} • <span className="text-neutral-400">{rev.date}</span>
                  </div>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={12}
                      className={s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-700'}
                    />
                  ))}
                </div>
              </div>

              {/* Service & Dishes Tag */}
              <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                <span className="px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-amber-300 font-semibold">
                  {rev.serviceType}
                </span>
                <span className="text-neutral-400 truncate max-w-[220px]">
                  🍛 {rev.dishesOrdered}
                </span>
              </div>

              {/* Review Comment Quote */}
              <p className="text-xs text-neutral-300 leading-relaxed italic">
                "{rev.comment}"
              </p>

              {/* Footer: Aspects & Helpful Button */}
              <div className="pt-1.5 border-t border-neutral-900 flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-2 text-neutral-400">
                  <span>Taste: <strong className="text-neutral-200">{rev.aspects.taste}/5</strong></span>
                  <span>Hygiene: <strong className="text-neutral-200">{rev.aspects.hygiene}/5</strong></span>
                  <span>Punctuality: <strong className="text-neutral-200">{rev.aspects.punctuality}/5</strong></span>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleHelpful(rev.id)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border transition-all ${
                    helpfulLiked[rev.id]
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <ThumbsUp size={10} />
                  <span>Helpful ({rev.helpfulCount})</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* "Write a Review" Modal */}
      {showAddReviewModal && (
        <div className="fixed inset-0 z-[2250] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-3xl p-6 shadow-2xl text-neutral-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddReviewModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white text-xl p-1"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 pb-3 border-b border-neutral-800">
              <img
                src={chef.avatar}
                alt={chef.name}
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-amber-500/40"
              />
              <div>
                <h3 className="text-base font-black text-white">Review {chef.name}</h3>
                <p className="text-xs text-neutral-400">Share your culinary feedback with Bangalore foodies</p>
              </div>
            </div>

            <form onSubmit={handleAddReviewSubmit} className="mt-4 space-y-4">
              
              {/* Overall Star Rating Selector */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Overall Star Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setNewRating(star)}
                      className="p-1 focus:outline-none transition-transform hover:scale-125"
                    >
                      <Star
                        size={26}
                        className={`${
                          star <= (hoverRating || newRating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-neutral-700'
                        } transition-colors`}
                      />
                    </button>
                  ))}
                  <span className="text-sm font-black text-amber-400 ml-2">
                    {newRating} / 5 Stars
                  </span>
                </div>
              </div>

              {/* Service Type Selection */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Service Booked</label>
                  <select
                    value={newServiceType}
                    onChange={(e) => setNewServiceType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-800 border border-neutral-700 text-white"
                  >
                    <option>SOS Quick-Fix</option>
                    <option>Dinner Party Banquet</option>
                    <option>Daily Meal Prep</option>
                    <option>B2B Restaurant Shift</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Dishes Cooked</label>
                  <input
                    type="text"
                    value={newDishes}
                    onChange={(e) => setNewDishes(e.target.value)}
                    placeholder="e.g. Biryani & Malai Tikka"
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-800 border border-neutral-700 text-white"
                  />
                </div>
              </div>

              {/* Aspect Ratings */}
              <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs">
                <div className="text-[11px] font-bold text-neutral-400 uppercase">Aspect Ratings</div>
                
                <div className="flex items-center justify-between">
                  <span className="text-neutral-300">Taste & Flavor:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setAspectTaste(s)}
                        className={`text-xs px-1.5 py-0.5 rounded ${
                          aspectTaste === s ? 'bg-amber-500 text-neutral-950 font-bold' : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {s}★
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-300">Kitchen Cleanliness:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setAspectHygiene(s)}
                        className={`text-xs px-1.5 py-0.5 rounded ${
                          aspectHygiene === s ? 'bg-emerald-500 text-neutral-950 font-bold' : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {s}★
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-300">Punctuality:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setAspectPunctuality(s)}
                        className={`text-xs px-1.5 py-0.5 rounded ${
                          aspectPunctuality === s ? 'bg-amber-500 text-neutral-950 font-bold' : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {s}★
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Your Review & Dining Experience
                </label>
                <textarea
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share details on dish flavor, kitchen cleanup, chef knife skills, punctuality, and overall satisfaction..."
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-800 border border-neutral-700 text-white focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-black text-xs hover:from-amber-400 hover:to-amber-500 shadow-xl shadow-amber-500/20"
              >
                Publish Verified Review ★
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
