import React, { useState, useMemo } from 'react';
import { Chef, Booking, User, Review } from '../../types';
import { BangaloreMap } from '../map/BangaloreMap';
import { VerifiedBadge } from '../common/VerifiedBadge';
import { ChefReviewsSection } from './ChefReviewsSection';
import { ChefPortfolioGallery } from './ChefPortfolioGallery';
import { SmartGroceryIntegration } from './SmartGroceryIntegration';
import { SurgeTriggerType, SURGE_PRESETS, calculateSurgePricing } from '../../utils/surgePricing';
import { Star, StarHalf, SlidersHorizontal, ArrowUpDown, Sparkles, ShoppingBag, Shield, Zap } from 'lucide-react';

interface HomeServicesViewProps {
  chefs: Chef[];
  userLocation: { lat: number; lng: number; area: string };
  currentUser: User | null;
  onOpenAuth: () => void;
  onRequestBooking: (bookingData: {
    chef: Chef;
    type: 'sos_quick_fix' | 'scheduled_prep';
    dishes: string;
    specialInstructions: string;
    scheduledDate?: string;
  }) => void;
  activeBooking: Booking | null;
  onBackToHome: () => void;
  onOpenVerificationSimulator?: () => void;
  onOpenActiveBooking?: () => void;
  currentSurge?: SurgeTriggerType;
}

// Helper to extract or calculate average rating score for any chef
const getChefRatingScore = (chef: Chef): number => {
  if (typeof chef.averageRatingScore === 'number') {
    return chef.averageRatingScore;
  }
  if (typeof chef.averageRating === 'number') {
    return chef.averageRating;
  }
  if (chef.reviews && chef.reviews.length > 0) {
    const sum = chef.reviews.reduce((acc, r) => acc + r.rating, 0);
    return Number((sum / chef.reviews.length).toFixed(2));
  }
  return chef.rating ?? 4.9;
};

// Helper to calculate total reviews count
const getChefReviewsCount = (chef: Chef): number => {
  if (chef.reviews && chef.reviews.length > 0) {
    return Math.max(chef.reviews.length, chef.reviewsCount || 0);
  }
  return chef.reviewsCount || 0;
};

// Reusable 5-star rating icon renderer with fractional and half-star handling
const renderStarIcons = (rating: number, size = 12) => {
  return [1, 2, 3, 4, 5].map((starIndex) => {
    if (rating >= starIndex) {
      return (
        <Star
          key={starIndex}
          size={size}
          className="text-amber-400 fill-amber-400 shrink-0"
        />
      );
    } else if (rating >= starIndex - 0.5) {
      return (
        <StarHalf
          key={starIndex}
          size={size}
          className="text-amber-400 fill-amber-400 shrink-0"
        />
      );
    } else {
      return (
        <Star
          key={starIndex}
          size={size}
          className="text-neutral-600 fill-neutral-800/40 shrink-0"
        />
      );
    }
  });
};

// Helper to compute aspect breakdown (taste, hygiene, punctuality) from reviews
const getChefAspects = (reviews?: Review[]) => {
  if (!reviews || reviews.length === 0) return null;
  const reviewsWithAspects = reviews.filter((r) => r.aspects);
  if (reviewsWithAspects.length === 0) return null;
  const total = reviewsWithAspects.length;
  const taste = reviewsWithAspects.reduce((acc, r) => acc + (r.aspects?.taste || 5), 0) / total;
  const hygiene = reviewsWithAspects.reduce((acc, r) => acc + (r.aspects?.hygiene || 5), 0) / total;
  const punctuality = reviewsWithAspects.reduce((acc, r) => acc + (r.aspects?.punctuality || 5), 0) / total;
  return { taste, hygiene, punctuality };
};

export const HomeServicesView: React.FC<HomeServicesViewProps> = ({
  chefs,
  userLocation,
  currentUser,
  onOpenAuth,
  onRequestBooking,
  activeBooking,
  onBackToHome,
  onOpenVerificationSimulator,
  onOpenActiveBooking,
  currentSurge = 'normal',
}) => {
  const [radiusKm, setRadiusKm] = useState<number>(3);
  const [selectedChef, setSelectedChef] = useState<Chef | null>(chefs[0] || null);
  const [bookingMode, setBookingMode] = useState<'sos' | 'prep'>('sos');
  const [dishesText, setDishesText] = useState('Butter Chicken, Dal Makhani & Garlic Naan');
  const [specialNotes, setSpecialNotes] = useState('Medium spice, low oil, please bring your own chef knives');
  const getTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  };
  const [prepDate, setPrepDate] = useState(getTomorrow);
  const [prepTimeSlot, setPrepTimeSlot] = useState('11:00 AM - 1:00 PM (Lunch Prep)');
  const [showOrderSheet, setShowOrderSheet] = useState(false);
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'rating' | 'distance' | 'price'>('rating');
  const [showAllCityChefs, setShowAllCityChefs] = useState<boolean>(false);

  const availableChefs = showAllCityChefs
    ? chefs.filter((c) => c.isOnline && c.status === 'available')
    : chefs.filter((c) => c.isOnline && c.status === 'available' && c.distanceKm <= radiusKm);

  const displayedChefs = useMemo(() => {
    return [...availableChefs]
      .filter((c) => getChefRatingScore(c) >= minRatingFilter)
      .sort((a, b) => {
        if (sortBy === 'rating') {
          return getChefRatingScore(b) - getChefRatingScore(a);
        }
        if (sortBy === 'distance') {
          return a.distanceKm - b.distanceKm;
        }
        return a.sosRate - b.sosRate;
      });
  }, [availableChefs, minRatingFilter, sortBy]);

  const selectedRatingScore = selectedChef ? getChefRatingScore(selectedChef) : 4.9;
  const selectedReviewsCount = selectedChef ? getChefReviewsCount(selectedChef) : 0;
  const selectedAspects = selectedChef ? getChefAspects(selectedChef.reviews) : null;

  const handleStartBooking = (chef: Chef, mode: 'sos' | 'prep') => {
    setSelectedChef(chef);
    setBookingMode(mode);
    if (mode === 'sos') {
      setDishesText(chef.signatureDishes.slice(0, 3).join(', '));
    } else {
      setDishesText('Weekly meal prep: 3 high-protein curries, roti batch, chopped salads');
    }
    setShowOrderSheet(true);
  };

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!selectedChef) return;

    const slotStart = prepTimeSlot.startsWith('8:00') ? '08:00:00' : prepTimeSlot.startsWith('11:00') ? '11:00:00' : '17:30:00';
    const scheduledIso = bookingMode === 'prep' ? `${prepDate}T${slotStart}` : 'Immediate';

    onRequestBooking({
      chef: selectedChef,
      type: bookingMode === 'sos' ? 'sos_quick_fix' : 'scheduled_prep',
      dishes: dishesText,
      specialInstructions: specialNotes,
      scheduledDate: scheduledIso,
    });
    setShowOrderSheet(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Active Booking Live Radar Card */}
      {activeBooking && activeBooking.status !== 'completed' && activeBooking.status !== 'cancelled' && (
        <div className={`p-4 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl transition-all ${
          activeBooking.sosAlert?.active
            ? 'bg-gradient-to-r from-red-950 via-rose-950 to-red-950 border-red-500/80 ring-2 ring-red-500/40 text-white shadow-red-950/70'
            : 'bg-neutral-900 border-amber-500/40 text-neutral-100'
        }`}>
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-2xl shrink-0">{activeBooking.sosAlert?.active ? '🚨' : '👨‍🍳'}</span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-black uppercase tracking-wider ${activeBooking.sosAlert?.active ? 'text-red-300' : 'text-amber-400'}`}>
                  {activeBooking.sosAlert?.active ? '🚨 Emergency SOS Panic Active' : 'Live Booking in Progress'}
                </span>
                <span className="text-xs text-neutral-400 font-mono">#{activeBooking.id.slice(-6)}</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 capitalize border border-neutral-700">
                  {activeBooking.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-neutral-200 mt-0.5 truncate">
                Chef: <strong>{activeBooking.chefName}</strong> • {activeBooking.area} • Doorstep OTP: <strong className="text-amber-400 font-mono">{activeBooking.otp}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenActiveBooking && (
              <button
                type="button"
                onClick={onOpenActiveBooking}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                  activeBooking.sosAlert?.active
                    ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
                    : 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
                }`}
              >
                {activeBooking.sosAlert?.active ? '🚨 Open SOS Emergency Center' : 'View Live Tracking & OTP'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-800">
        <div>
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-amber-400 font-semibold mb-1 transition-colors"
          >
            <span>←</span>
            <span>Back to All Pathways</span>
          </button>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-white tracking-tight">Home Services Radar</h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
              Rapido GPS Live
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Active verified home cooks dispatched across <span className="text-amber-400 font-semibold">{userLocation.area}</span> within your hyper-local radius.
          </p>
        </div>

        {/* Radius Controller */}
        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-neutral-900 border border-neutral-800">
          <span className="text-xs font-bold text-neutral-300 whitespace-nowrap">
            Radius: <span className="text-amber-400">{radiusKm} km</span>
          </span>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            className="w-24 sm:w-32 accent-amber-500 cursor-pointer"
          />
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
            {availableChefs.length} Online
          </span>
        </div>
      </div>

      {/* Main Split: Map (Left/Center) + Chef Detail Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Map Section */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
          <div className="h-[460px] sm:h-[540px] w-full relative">
            <BangaloreMap
              chefs={chefs}
              userLocation={userLocation}
              radiusKm={radiusKm}
              selectedChef={selectedChef}
              onSelectChef={(chef) => setSelectedChef(chef)}
              activeBookingChefId={activeBooking?.chefId}
            />
          </div>

          {/* Quick Select Chef Horizontal Cards */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                  <span>{showAllCityChefs ? 'All Online Chefs' : `Nearby Chefs in ${radiusKm}km Radius`}</span>
                  <span className="text-amber-400 font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px]">
                    {displayedChefs.length} Available
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Available chefs with customer ratings and clear pricing
                </p>
              </div>

              {/* Rating Filters & Sorting */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center rounded-xl bg-neutral-900 border border-neutral-800 p-1 text-[11px]">
                  <span className="text-neutral-400 px-1.5 flex items-center gap-1 font-semibold">
                    <Star size={11} className="text-amber-400 fill-amber-400" /> Min:
                  </span>
                  {[0, 4.8, 4.9].map((ratingVal) => (
                    <button
                      key={ratingVal}
                      type="button"
                      onClick={() => setMinRatingFilter(ratingVal)}
                      className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                        minRatingFilter === ratingVal
                          ? 'bg-amber-500 text-neutral-950 shadow-sm'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {ratingVal === 0 ? 'All' : `${ratingVal}★+`}
                    </button>
                  ))}
                </div>

                <div className="flex items-center rounded-xl bg-neutral-900 border border-neutral-800 p-1 text-[11px]">
                  <span className="text-neutral-400 px-1.5 font-semibold">Sort:</span>
                  <button
                    type="button"
                    onClick={() => setSortBy('rating')}
                    className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                      sortBy === 'rating' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    ★ Top Rated
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortBy('distance')}
                    className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                      sortBy === 'distance' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Nearest
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {displayedChefs.map((chef) => {
                const isSelected = selectedChef?.id === chef.id;
                const chefScore = getChefRatingScore(chef);
                const chefReviews = getChefReviewsCount(chef);
                return (
                  <div
                    key={chef.id}
                    onClick={() => setSelectedChef(chef)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/80 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/40'
                        : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={chef.avatar}
                        alt={chef.name}
                        className="w-12 h-12 rounded-xl object-cover ring-1 ring-neutral-700 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{chef.name}</h4>
                          <VerifiedBadge
                            size="sm"
                            showLabel={false}
                            status={chef.verificationReport?.status || (chef.policeVerified ? 'verified' : 'unverified')}
                            report={chef.verificationReport}
                            onOpenReportModal={onOpenVerificationSimulator}
                          />
                        </div>
                        <div className="text-[11px] text-neutral-400 truncate mt-0.5">{chef.specialties[0]}</div>
                      </div>
                    </div>

                    {/* Star Rating Display for each chef */}
                    <div className="flex items-center justify-between gap-1 bg-neutral-950/60 p-2 rounded-xl border border-neutral-800/80">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="flex items-center text-amber-400 gap-0.5 shrink-0" aria-label={`${chefScore.toFixed(1)} out of 5 stars`}>
                          {renderStarIcons(chefScore, 12)}
                        </div>
                        <span className="text-xs font-black text-amber-400">
                          {chefScore.toFixed(1)}
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-400 font-medium shrink-0">
                        ({chefReviews} reviews)
                      </span>
                    </div>

                    <div className="text-[10px] text-emerald-400 font-semibold flex items-center justify-between pt-0.5">
                      <span>⚡ {chef.distanceKm} km away</span>
                      <span className="text-neutral-200 font-bold bg-neutral-800/80 px-2 py-0.5 rounded-md">₹{chef.sosRate} SOS</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {displayedChefs.length === 0 && (
              <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-center space-y-2">
                <span className="text-2xl">🔍</span>
                <p className="text-xs text-neutral-300 font-medium">No chefs found matching your rating filter ({minRatingFilter}★+).</p>
                <button
                  type="button"
                  onClick={() => { setMinRatingFilter(0); setRadiusKm(5); }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 text-neutral-950 text-xs font-bold hover:bg-amber-400 cursor-pointer"
                >
                  Reset Rating Filters & Expand Radius
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Chef Profile & Dispatch Panel */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          {selectedChef ? (
            <div className="rounded-3xl bg-neutral-900 border border-neutral-800 p-5 sm:p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

              {/* Chef Header */}
              <div className="flex items-start gap-4">
                <img
                  src={selectedChef.avatar}
                  alt={selectedChef.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/40 shadow-lg shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-black text-white truncate">{selectedChef.name}</h3>
                    <VerifiedBadge
                      size="md"
                      status={selectedChef.verificationReport?.status || (selectedChef.policeVerified ? 'verified' : 'unverified')}
                      report={selectedChef.verificationReport}
                      onOpenReportModal={onOpenVerificationSimulator}
                    />
                  </div>

                  {/* Prominent Star Ratings for Selected Chef */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-xl">
                      <div className="flex items-center text-amber-400 gap-0.5" aria-label={`${selectedRatingScore.toFixed(1)} stars`}>
                        {renderStarIcons(selectedRatingScore, 14)}
                      </div>
                      <span className="text-sm font-black text-amber-400">
                        {selectedRatingScore.toFixed(1)}
                      </span>
                      <span className="text-[11px] text-neutral-300 font-medium">
                        ({selectedReviewsCount} reviews)
                      </span>
                    </div>
                    <span className="text-xs text-neutral-400">
                      • {selectedChef.experienceYears} yrs exp
                    </span>
                  </div>

                  {/* Average Rating Score Details & Aspects */}
                  <div className="mt-1.5 flex items-center gap-2 text-[11px] text-neutral-400 flex-wrap">
                    <span className="text-neutral-300">
                      Average Rating Score: <strong className="text-amber-400 font-mono font-bold">{selectedRatingScore.toFixed(2)}</strong> / 5.0
                    </span>
                    {selectedAspects && (
                      <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] text-neutral-400">
                        <span>• Taste: <strong className="text-white">{selectedAspects.taste.toFixed(1)}★</strong></span>
                        <span>• Hygiene: <strong className="text-white">{selectedAspects.hygiene.toFixed(1)}★</strong></span>
                        <span>• Punctuality: <strong className="text-white">{selectedAspects.punctuality.toFixed(1)}★</strong></span>
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>{selectedChef.distanceKm} km away • {Math.round(selectedChef.distanceKm * 7 + 6)} min arrival</span>
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-1.5 mt-4">
                <VerifiedBadge
                  size="lg"
                  status={selectedChef.verificationReport?.status || (selectedChef.policeVerified ? 'verified' : 'unverified')}
                  report={selectedChef.verificationReport}
                  onOpenReportModal={onOpenVerificationSimulator}
                />
                {selectedChef.specialties.map((s) => (
                  <span
                    key={s}
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700/80"
                  >
                    {s}
                  </span>
                ))}
              </div>

              {/* Bio */}
              <p className="text-xs text-neutral-300 mt-3 leading-relaxed bg-neutral-950/40 p-3 rounded-xl border border-neutral-800/60">
                "{selectedChef.bio}"
              </p>

              {/* Signature Dishes */}
              <div className="mt-4">
                <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                  Signature Dishes:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedChef.signatureDishes.map((dish) => (
                    <span
                      key={dish}
                      className="text-xs px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20"
                    >
                      🍛 {dish}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pricing Cards */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-neutral-950/60 border border-neutral-800 text-center">
                  <div className="text-[10px] text-neutral-400 uppercase font-semibold">SOS Immediate Fix</div>
                  <div className="text-lg font-black text-amber-400 mt-0.5">₹{selectedChef.sosRate}</div>
                  <div className="text-[10px] text-neutral-500">Same-day 2h quick meal</div>
                </div>
                <div className="p-3 rounded-2xl bg-neutral-950/60 border border-neutral-800 text-center">
                  <div className="text-[10px] text-neutral-400 uppercase font-semibold">Daily Meal Prep</div>
                  <div className="text-lg font-black text-white mt-0.5">₹{selectedChef.dayPrepRate}</div>
                  <div className="text-[10px] text-neutral-500">Next-day batch (3 meals)</div>
                </div>
              </div>

              {/* Action Buttons: Request Booking */}
              <div className="mt-5 space-y-2.5">
                <button
                  type="button"
                  onClick={() => handleStartBooking(selectedChef, 'sos')}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-black text-sm hover:from-amber-400 hover:to-amber-500 transition-all flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20"
                >
                  <span>🚨</span>
                  <span>Request SOS Quick-Fix (Instant)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStartBooking(selectedChef, 'prep')}
                  className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 text-white font-bold text-xs hover:bg-neutral-700 transition-colors flex items-center justify-center gap-2 border border-neutral-700"
                >
                  <span>📅</span>
                  <span>Schedule for Next-Day Meal Prep</span>
                </button>
              </div>

              {/* Culinary Portfolio & Plating Showcase (High-Res images of signature dishes) */}
              <ChefPortfolioGallery
                chef={selectedChef}
                onSelectDishForBooking={(dishTitle) => {
                  setDishesText((prev) => prev ? `${dishTitle}, ${prev}` : dishTitle);
                  setShowOrderSheet(true);
                }}
              />

              {/* Star-Rating & Peer-Validated Reviews Component */}
              <ChefReviewsSection
                chef={selectedChef}
                currentUser={currentUser}
                onOpenAuth={onOpenAuth}
              />

            </div>
          ) : (
            <div className="rounded-3xl bg-neutral-900 border border-neutral-800 p-8 text-center text-neutral-400">
              <span className="text-4xl block mb-2">👨‍🍳</span>
              <p className="text-sm font-semibold">Select a chef marker on the map to inspect their culinary portfolio</p>
            </div>
          )}
        </div>

      </div>

      {/* Booking Form Sheet / Modal */}
      {showOrderSheet && selectedChef && (
        <div className="fixed inset-0 z-[2050] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-700 rounded-3xl p-6 sm:p-7 shadow-2xl text-neutral-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowOrderSheet(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white text-xl p-1"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 pb-4 border-b border-neutral-800">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 text-2xl flex items-center justify-center">
                {bookingMode === 'sos' ? '🚨' : '📅'}
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  {bookingMode === 'sos' ? 'Confirm SOS Quick-Fix Dispatch' : 'Schedule Next-Day Prep'}
                </h3>
                <p className="text-xs text-neutral-400">
                  With {selectedChef.name} • {selectedChef.currentLocation.area}
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmOrder} className="mt-5 space-y-4">
              {bookingMode === 'sos' ? (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 text-xs text-amber-300">
                  <span className="text-xl">⚡</span>
                  <div>
                    <div className="font-bold">Immediate Rapido-Style Travel</div>
                    <div className="text-[11px] text-neutral-300">
                      Chef will accept within 30 seconds and start commute to {userLocation.area}. Estimated arrival: <strong>18–25 mins</strong>.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">Select Date</label>
                    <input
                      type="date"
                      value={prepDate}
                      onChange={(e) => setPrepDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">Slot</label>
                    <select
                      value={prepTimeSlot}
                      onChange={(e) => setPrepTimeSlot(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs focus:ring-1 focus:ring-amber-500"
                    >
                      <option>8:00 AM - 10:00 AM (Breakfast & Lunch)</option>
                      <option>11:00 AM - 1:00 PM (Lunch Prep)</option>
                      <option>5:30 PM - 7:30 PM (Dinner & Next Day)</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Dishes / Items to Cook
                </label>
                <textarea
                  rows={2}
                  value={dishesText}
                  onChange={(e) => setDishesText(e.target.value)}
                  required
                  placeholder="e.g. Paneer Butter Masala, Jeera Rice, Phulkas, Fresh Salad"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* The Bangalore Hack: Smart Grocery Integration for SOS Bookings */}
              {bookingMode === 'sos' && (
                <div className="my-2">
                  <SmartGroceryIntegration
                    dishesText={dishesText}
                    chefEtaMinutes={25}
                    customerArea={userLocation.area}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Special Kitchen Notes & Dietary Preferences
                </label>
                <textarea
                  rows={2}
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="e.g. Low salt, keep spice mild for kids, cooking gas is induction"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Price summary & Transparent Fee Breakdown (Blueprint Section 3) */}
              {(() => {
                const baseRate = bookingMode === 'sos' ? selectedChef.sosRate : selectedChef.dayPrepRate;
                const pricing = calculateSurgePricing(baseRate, currentSurge);
                const surgeInfo = SURGE_PRESETS[currentSurge] || SURGE_PRESETS.normal;
                return (
                  <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-neutral-300">
                      <span>Chef Culinary Cooking Fee</span>
                      <span className="font-semibold text-white">₹{pricing.baseAmount}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <span className="text-amber-400">⚡ Dynamic Surge Fee</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-bold">
                          {surgeInfo.badge}
                        </span>
                      </div>
                      <span className={`font-semibold ${pricing.surgeAddedAmount > 0 ? 'text-amber-400 font-mono' : 'text-neutral-500'}`}>
                        {pricing.surgeAddedAmount > 0 ? `+₹${pricing.surgeAddedAmount}` : '₹0'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5 text-neutral-300">
                        <Shield size={12} className="text-emerald-400" />
                        <span>Mandatory Platform & Safety Fee</span>
                      </div>
                      <span className="font-semibold text-emerald-400">₹{pricing.platformFee}</span>
                    </div>

                    <div className="flex justify-between items-center text-neutral-400">
                      <span>Estimated GST (18%)</span>
                      <span className="font-semibold text-white">₹{pricing.gstAmount}</span>
                    </div>

                    <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-neutral-400 uppercase font-semibold">Total Escrow Authorized</div>
                        <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                          <span>🔒 Held in Escrow until completion</span>
                        </div>
                      </div>
                      <div className="text-xl font-black text-amber-400 font-mono">
                        ₹{pricing.totalCustomerPayable}
                      </div>
                    </div>
                  </div>
                );
              })()}

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-black text-sm hover:from-amber-400 hover:to-amber-500 transition-all shadow-xl shadow-amber-500/20"
              >
                Proceed to Secure Razorpay Escrow
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
