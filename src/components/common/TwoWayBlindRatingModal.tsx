import React, { useState } from 'react';
import { Booking, FeedbackSubmission, TwoWayBlindRating } from '../../types';
import { Star, Lock, Unlock, CheckCircle, AlertTriangle, Sparkles, X, MessageSquare, ShieldAlert } from 'lucide-react';
import { playAlertChime } from '../../utils/sound';

interface TwoWayBlindRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  initialRole?: 'customer' | 'chef';
  onSubmitFeedback: (bookingId: string, submission: FeedbackSubmission) => void;
}

// Granular tags depending on stars and role
const CHEF_POSITIVE_TAGS = [
  '🌟 Superb Taste & Flavour',
  '🧼 Left Kitchen Spotless',
  '⏰ Punctual Doorstep Arrival',
  '🔪 Master Knife & Prep Skills',
  '👨‍🍳 Polite & Respectful',
  '🌿 Fresh & High Hygiene',
  '🔥 Perfect Spice Balance',
  '🍽️ Exquisite Food Plating',
];

const CHEF_CRITICAL_TAGS = [
  '⏰ Late Arrival',
  '⚠️ Messy Kitchen Aftermath',
  '🧂 Salty / Overcooked',
  '🚫 Missing Ingredients',
  '📱 Excessive Phone Use',
  '📉 Rude Demeanor',
  '🪰 Hygiene / Uniform Concern',
  '⌛ Slow Cooking Pace',
];

const CUSTOMER_POSITIVE_TAGS = [
  '🤝 Warm Hospitality',
  '🧼 Clean & Organized Kitchen',
  '⚡ Prompt Doorstep OTP Verification',
  '💵 Generous Tip Given',
  '🍳 Good Stoves & Utensils',
  '🥂 Respectful Household',
  '📝 Clear Dietary Instructions',
];

const CUSTOMER_CRITICAL_TAGS = [
  '⏳ Delayed Doorstep OTP Verification',
  '⚠️ Inaccurate Gas / Appliance Info',
  '🙅 Disrespectful Behavior',
  '🍳 Overcrowded / Cluttered Kitchen',
  '🚫 Unsafe Environment',
  '❌ Unreasonable Dish Demands',
];

export const TwoWayBlindRatingModal: React.FC<TwoWayBlindRatingModalProps> = ({
  isOpen,
  onClose,
  booking,
  initialRole = 'customer',
  onSubmitFeedback,
}) => {
  const [activeReviewerRole, setActiveReviewerRole] = useState<'customer' | 'chef'>(initialRole);
  const [stars, setStars] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [hasSubmittedThisRole, setHasSubmittedThisRole] = useState(false);

  // Simulated blind rating status on booking
  const [ratingState, setRatingState] = useState<TwoWayBlindRating>(() => {
    return (
      booking.twoWayRating || {
        bookingId: booking.id,
        status: 'pending_both',
      }
    );
  });

  if (!isOpen) return null;

  const isCustomerReviewing = activeReviewerRole === 'customer';
  const targetName = isCustomerReviewing ? booking.chefName : booking.customerName;

  // Granular tags based on score
  const availableTags = isCustomerReviewing
    ? stars >= 4
      ? CHEF_POSITIVE_TAGS
      : CHEF_CRITICAL_TAGS
    : stars >= 4
    ? CUSTOMER_POSITIVE_TAGS
    : CUSTOMER_CRITICAL_TAGS;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submission: FeedbackSubmission = {
      role: activeReviewerRole,
      reviewerName: isCustomerReviewing ? booking.customerName : booking.chefName,
      targetId: isCustomerReviewing ? booking.chefId : booking.customerId,
      targetName,
      rating: stars,
      tags: selectedTags,
      comment: comment.trim(),
      submittedAt: new Date().toISOString(),
    };

    onSubmitFeedback(booking.id, submission);

    // Update local blind rating state
    setRatingState((prev) => {
      const next: TwoWayBlindRating = { ...prev };
      if (activeReviewerRole === 'customer') {
        next.customerRating = submission;
      } else {
        next.chefRating = submission;
      }

      // Check if both sides have submitted!
      if (next.customerRating && next.chefRating) {
        next.status = 'revealed_both';
        next.unsealedAt = new Date().toISOString();
        playAlertChime('accepted');
      } else {
        next.status = activeReviewerRole === 'customer' ? 'customer_submitted' : 'chef_submitted';
      }
      return next;
    });

    setHasSubmittedThisRole(true);
  };

  const isRevealed = ratingState.status === 'revealed_both';

  return (
    <div className="fixed inset-0 z-[2250] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-700 rounded-3xl p-6 sm:p-7 shadow-2xl text-neutral-100 max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white text-xl p-1 z-10 cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit">
              {isRevealed ? <Unlock size={11} /> : <Lock size={11} />}
              <span>{isRevealed ? 'UNSEALED & REVEALED' : 'TWO-WAY BLIND RATING'}</span>
            </span>
            <h3 className="text-base font-black text-white mt-1">
              Mutual Trust & Feedback System
            </h3>
            <p className="text-xs text-neutral-400">
              Shift #{booking.id.slice(-6)} • {booking.area}
            </p>
          </div>

          {/* Persona Switcher for Testing / Demonstration */}
          <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-[11px]">
            <button
              type="button"
              onClick={() => {
                setActiveReviewerRole('customer');
                setHasSubmittedThisRole(Boolean(ratingState.customerRating));
                setStars(ratingState.customerRating?.rating || 5);
                setSelectedTags(ratingState.customerRating?.tags || []);
                setComment(ratingState.customerRating?.comment || '');
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeReviewerRole === 'customer'
                  ? 'bg-amber-500 text-neutral-950 shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveReviewerRole('chef');
                setHasSubmittedThisRole(Boolean(ratingState.chefRating));
                setStars(ratingState.chefRating?.rating || 5);
                setSelectedTags(ratingState.chefRating?.tags || []);
                setComment(ratingState.chefRating?.comment || '');
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeReviewerRole === 'chef'
                  ? 'bg-amber-500 text-neutral-950 shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Chef
            </button>
          </div>
        </div>

        {/* Blind Mode Explainer Banner */}
        {!isRevealed && (
          <div className="my-4 p-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 flex items-start gap-2.5">
            <Lock size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-white">Anti-Retaliation Blind Rating Protocol:</strong>
              <p className="text-[11px] text-neutral-400">
                Neither Customer nor Chef can see each other's score until <strong>both parties submit</strong>. This prevents retaliatory negative reviews and ensures authentic ratings.
              </p>
            </div>
          </div>
        )}

        {/* If Both Revealed: Celebration Banner */}
        {isRevealed && (
          <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-neutral-900 to-purple-950/60 border border-emerald-500/40 text-xs space-y-3 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-amber-400" />
                <span className="font-black text-white uppercase tracking-wider text-xs">
                  Mutual Ratings Unsealed!
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                ✓ Public Feed Updated
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* Customer's Review of Chef */}
              <div className="p-3 rounded-xl bg-black/40 border border-neutral-800 space-y-1">
                <div className="text-[10px] text-neutral-400 font-bold uppercase">Customer ➔ Chef</div>
                <div className="text-amber-400 font-black text-sm">
                  ★ {ratingState.customerRating?.rating} / 5
                </div>
                <div className="text-neutral-300 text-[11px]">"{ratingState.customerRating?.comment || 'Great meal!'}"</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {ratingState.customerRating?.tags.map((t) => (
                    <span key={t} className="text-[9px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Chef's Review of Customer */}
              <div className="p-3 rounded-xl bg-black/40 border border-neutral-800 space-y-1">
                <div className="text-[10px] text-neutral-400 font-bold uppercase">Chef ➔ Customer</div>
                <div className="text-amber-400 font-black text-sm">
                  ★ {ratingState.chefRating?.rating} / 5
                </div>
                <div className="text-neutral-300 text-[11px]">"{ratingState.chefRating?.comment || 'Polite household.'}"</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {ratingState.chefRating?.tags.map((t) => (
                    <span key={t} className="text-[9px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FEEDBACK FORM */}
        {!hasSubmittedThisRole ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="text-xs font-bold text-neutral-300 mb-1">
                Rate your experience with: <strong className="text-amber-400">{targetName}</strong>
              </div>
              <p className="text-[11px] text-neutral-400">
                {isCustomerReviewing
                  ? 'How was the food flavor, culinary hygiene, and demeanor?'
                  : 'How was the kitchen setup, household respect, and OTP punctuality?'}
              </p>
            </div>

            {/* 1 to 5 Star Selector */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((starVal) => (
                  <button
                    key={starVal}
                    type="button"
                    onClick={() => {
                      setStars(starVal);
                      setSelectedTags([]);
                    }}
                    className="p-1 hover:scale-125 transition-transform cursor-pointer"
                  >
                    <Star
                      size={32}
                      className={`transition-colors ${
                        starVal <= stars
                          ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                          : 'text-neutral-700'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <div className="text-xs font-black text-amber-300">
                {stars === 5 && '★★★★★ Exceptional (5/5)'}
                {stars === 4 && '★★★★☆ Great Experience (4/5)'}
                {stars === 3 && '★★★☆☆ Average / Needs Polish (3/5)'}
                {stars === 2 && '★★☆☆☆ Below Standard (2/5)'}
                {stars === 1 && '★☆☆☆☆ Severe Issue (1/5)'}
              </div>

              {/* Threshold Warning if < 3.5 */}
              {stars < 3.5 && (
                <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center justify-center gap-1.5">
                  <ShieldAlert size={14} className="text-red-400 shrink-0" />
                  <span>
                    Ratings below 3.5 trigger automated investigation by Platform Safety Desk.
                  </span>
                </div>
              )}
            </div>

            {/* Granular Feedback Tags (Dynamically change based on stars) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-neutral-300">
                <span>Granular Feedback Tags ({stars >= 4 ? 'Compliments' : 'Constructive Issues'}):</span>
                <span className="text-[10px] text-neutral-500">Select all that apply</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                        isSelected
                          ? stars >= 4
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-1 ring-amber-400/40'
                            : 'bg-red-500/20 border-red-500 text-red-200 ring-1 ring-red-500/40'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comment Area */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Detailed Review & Comments
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  isCustomerReviewing
                    ? 'e.g. Biryani dum was perfect, chicken was melt in mouth, left counter sparkling clean.'
                    : 'e.g. Spacious clean kitchen, induction gas was ready, very hospitable family.'
                }
                className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-950 border border-neutral-700 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Lock size={14} />
              <span>Submit Sealed Blind Rating</span>
            </button>
          </form>
        ) : (
          <div className="space-y-4 py-4 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-2xl font-bold">
              ✓
            </div>
            <h4 className="text-base font-black text-white">
              Your {activeReviewerRole === 'customer' ? 'Customer' : 'Chef'} Rating is Sealed!
            </h4>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Your review is encrypted in blind escrow. It will be unveiled once the other party submits their rating.
            </p>

            {/* Demonstration helper to switch persona */}
            {!isRevealed && (
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 space-y-2">
                <div className="text-[11px] font-bold text-amber-400 uppercase">Interactive Testing:</div>
                <p className="text-[11px] text-neutral-400">
                  Switch persona to <strong>{activeReviewerRole === 'customer' ? 'Chef' : 'Customer'}</strong> above to complete both sides and test the instant reveal!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const otherRole = activeReviewerRole === 'customer' ? 'chef' : 'customer';
                    setActiveReviewerRole(otherRole);
                    setHasSubmittedThisRole(false);
                    setStars(5);
                    setSelectedTags([]);
                    setComment('');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-bold text-xs"
                >
                  Rate as {activeReviewerRole === 'customer' ? 'Chef' : 'Customer'} ➔
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mt-5 pt-3 border-t border-neutral-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
