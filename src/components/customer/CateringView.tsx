import React, { useState } from 'react';
import { CateringInquiry, User } from '../../types';
import { CATERING_PACKAGES } from '../../data/mockData';
import confetti from 'canvas-confetti';

interface CateringViewProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  onSubmitInquiry: (inquiry: CateringInquiry) => void;
  inquiries: CateringInquiry[];
  onBackToHome: () => void;
}

export const CateringView: React.FC<CateringViewProps> = ({
  currentUser,
  onOpenAuth,
  onSubmitInquiry,
  inquiries,
  onBackToHome,
}) => {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);
  const [submittedInquiry, setSubmittedInquiry] = useState<CateringInquiry | null>(null);

  // Form State
  const [guestCount, setGuestCount] = useState<number>(45);
  const [eventDate, setEventDate] = useState<string>('2026-11-20');
  const [eventTime, setEventTime] = useState<string>('7:00 PM Onwards');
  const [eventType, setEventType] = useState<CateringInquiry['eventType']>('Cocktail Party');
  const [venueLocation, setVenueLocation] = useState<string>('Private Penthouse, Indiranagar, Bengaluru');
  const [budgetPerPlate, setBudgetPerPlate] = useState<number>(1800);

  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([
    'North Indian / Mughlai',
    'Pan-Asian & Dimsum',
    'Continental & Italian',
  ]);
  const [selectedLiveCounters, setSelectedLiveCounters] = useState<string[]>([
    'Live Sigri / BBQ Charcoal Station',
    'Artisanal Dimsum Bamboo Towers',
  ]);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([
    '40% Vegetarian Dedicated Station',
    'No Beef / Pork strictly',
  ]);
  const [specialNotes, setSpecialNotes] = useState<string>(
    'Requires 3 uniformed stewards, bar setup with crushed ice, and silver chaffing dish display.'
  );

  const [contactName, setContactName] = useState<string>(currentUser?.name || 'Aarav Singhania');
  const [contactPhone, setContactPhone] = useState<string>(currentUser?.phone || '+91 98450 88231');
  const [contactEmail, setContactEmail] = useState<string>(currentUser?.email || 'aarav.singhania@corp.in');

  const cuisineOptions = [
    'North Indian / Mughlai',
    'Tandoor & Charcoal BBQ',
    'South Indian / Dakshin Feast',
    'Pan-Asian & Dimsum',
    'Japanese Sushi & Robata',
    'Continental & Italian Pastas',
    'Awadhi Dum Banquet',
    'Mexican & Street Tacos',
  ];

  const liveCounterOptions = [
    'Live Sigri / BBQ Charcoal Station',
    'Artisanal Dimsum Bamboo Towers',
    'Mobile Woodfire Pizza Oven',
    'Live Appam & Stew Counter',
    'Liquid Nitrogen & Flamed Dessert Bar',
    'Gourmet Slider & Taco Cart',
  ];

  const dietaryOptions = [
    '40% Vegetarian Dedicated Station',
    '100% Pure Vegetarian Available',
    'Jain Counter (No Onion/Garlic)',
    'Halal Certified Meats',
    'Gluten-Free & Keto friendly',
    'No Beef / Pork strictly',
  ];

  const toggleCuisine = (c: string) => {
    setSelectedCuisines(prev =>
      prev.includes(c) ? prev.filter(i => i !== c) : [...prev, c]
    );
  };

  const toggleLiveCounter = (lc: string) => {
    setSelectedLiveCounters(prev =>
      prev.includes(lc) ? prev.filter(i => i !== lc) : [...prev, lc]
    );
  };

  const toggleDietary = (d: string) => {
    setSelectedDietary(prev =>
      prev.includes(d) ? prev.filter(i => i !== d) : [...prev, d]
    );
  };

  const rawTotal = guestCount * budgetPerPlate;
  const estimatedTotal = rawTotal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    const inquiry: CateringInquiry = {
      id: `cat-inq-${Date.now()}`,
      customerName: contactName,
      customerPhone: contactPhone,
      customerEmail: contactEmail,
      eventDate,
      eventTime,
      eventType,
      guestCount,
      budgetPerPlate,
      totalBudgetEstimate: estimatedTotal,
      preferredCuisines: selectedCuisines,
      liveCountersNeeded: selectedLiveCounters,
      dietaryPreferences: selectedDietary,
      venueLocation,
      additionalNotes: specialNotes,
      status: 'submitted',
      createdAt: new Date().toISOString().split('T')[0],
    };

    onSubmitInquiry(inquiry);
    setSubmittedInquiry(inquiry);
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.5 },
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      
      {/* Top Breadcrumb & Luxury Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-amber-400 font-semibold mb-1 transition-colors"
          >
            <span>←</span>
            <span>Back to All Pathways</span>
          </button>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-black text-white tracking-tight font-sans">
              Bespoke Catering & Events
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
              Luxury Division
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Private dining brigades, mobile woodfire pizza ovens, and royal banquets for 20 to 500+ guests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-[11px] text-neutral-400">Concierge Desk</div>
            <div className="text-xs font-bold text-amber-400">+91 80 4912 8000</div>
          </div>
        </div>
      </div>

      {/* High-Resolution Plated Food Gallery (No Map as required!) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-neutral-200 uppercase tracking-wider flex items-center gap-2">
            <span>✨</span>
            <span>Signature Luxury Catering Experiences</span>
          </h3>
          <span className="text-xs text-amber-400 font-semibold">Plated by Bangalore's Master Chefs</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CATERING_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className="group rounded-3xl bg-neutral-900 border border-neutral-800 overflow-hidden hover:border-amber-500/50 transition-all duration-300 shadow-xl flex flex-col justify-between"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={pkg.image}
                  alt={pkg.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="text-xs font-bold px-2 py-1 rounded-lg bg-black/70 backdrop-blur-md text-amber-400 border border-white/10">
                    From ₹{pkg.pricePerGuest} / plate
                  </span>
                  <span className="text-[11px] font-semibold text-neutral-300">
                    Min {pkg.minGuests} guests
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                    {pkg.name}
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    {pkg.subtitle}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {pkg.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded bg-neutral-800 text-neutral-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-800/80">
                  <div className="text-[11px] font-semibold text-neutral-400 mb-1">Highlights:</div>
                  <ul className="text-xs text-neutral-300 space-y-1">
                    {pkg.highlights.map((h, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="text-amber-400 text-xs">◆</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Multi-Step Detailed Inquiry Form */}
      <div className="rounded-3xl bg-neutral-900 border border-neutral-800 p-6 sm:p-8 shadow-2xl relative">
        <div className="max-w-3xl mx-auto">
          
          {/* Step Progress Indicators */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-800">
            {[
              { num: 1, label: 'Event Details' },
              { num: 2, label: 'Cuisines & Counters' },
              { num: 3, label: 'Budget & Staffing' },
              { num: 4, label: 'Review & Submit' },
            ].map((st) => (
              <button
                key={st.num}
                type="button"
                onClick={() => setActiveStep(st.num as 1 | 2 | 3 | 4)}
                className={`flex items-center gap-2 text-xs font-bold transition-all ${
                  activeStep === st.num
                    ? 'text-amber-400'
                    : activeStep > st.num
                    ? 'text-neutral-200'
                    : 'text-neutral-500'
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                    activeStep === st.num
                      ? 'bg-amber-500 text-neutral-950'
                      : activeStep > st.num
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {activeStep > st.num ? '✓' : st.num}
                </span>
                <span className="hidden sm:inline">{st.label}</span>
              </button>
            ))}
          </div>

          {submittedInquiry ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 text-3xl flex items-center justify-center mx-auto border border-emerald-500/30">
                🎉
              </div>
              <h3 className="text-2xl font-black text-white">Catering Inquiry Received!</h3>
              <p className="text-sm text-neutral-300 max-w-md mx-auto">
                Reference Code: <span className="text-amber-400 font-mono font-bold">#{submittedInquiry.id}</span>. Our executive chef concierge in Bangalore is curating your personalized tasting menu and brigade schedule.
              </p>
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 max-w-md mx-auto text-left space-y-1.5">
                <div><strong>Event:</strong> {submittedInquiry.eventType} on {submittedInquiry.eventDate}</div>
                <div><strong>Guests:</strong> {submittedInquiry.guestCount} covers</div>
                <div><strong>Estimated Budget:</strong> ₹{submittedInquiry.totalBudgetEstimate.toLocaleString('en-IN')}</div>
                <div><strong>Location:</strong> {submittedInquiry.venueLocation}</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSubmittedInquiry(null);
                  setActiveStep(1);
                }}
                className="px-6 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold"
              >
                Submit Another Event Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* STEP 1: Event Details */}
              {activeStep === 1 && (
                <div className="space-y-4 animate-in fade-in">
                  <h4 className="text-base font-bold text-white">Step 1: Event Essentials</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">Event Type</label>
                      <select
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value as CateringInquiry['eventType'])}
                        className="w-full px-3 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs"
                      >
                        <option>Cocktail Party</option>
                        <option>Wedding / Sangeet</option>
                        <option>Corporate Gala</option>
                        <option>Intimate Villa Dinner</option>
                        <option>Birthday Bash</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Number of Guests ({guestCount} pax)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={15}
                          max={350}
                          step={5}
                          value={guestCount}
                          onChange={(e) => setGuestCount(Number(e.target.value))}
                          className="w-full accent-amber-500 cursor-pointer"
                        />
                        <span className="text-xs font-black text-amber-400 bg-neutral-800 px-2.5 py-1 rounded-lg">
                          {guestCount}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">Date</label>
                      <input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">Service Time Slot</label>
                      <select
                        value={eventTime}
                        onChange={(e) => setEventTime(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs"
                      >
                        <option>12:30 PM - 4:00 PM (Lunch Banquet)</option>
                        <option>7:00 PM Onwards (Dinner / Cocktail)</option>
                        <option>Full Day (Morning Brunch + Evening Gala)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">Venue Address / Bangalore Vicinity</label>
                    <input
                      type="text"
                      value={venueLocation}
                      onChange={(e) => setVenueLocation(e.target.value)}
                      placeholder="e.g. Prestige Golfshire Villa, Nandi Hills or Penthouse in Indiranagar"
                      className="w-full px-3 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveStep(2)}
                      className="px-6 py-2.5 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs hover:bg-amber-400"
                    >
                      Next: Cuisines & Live Counters →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Cuisines & Live Counters */}
              {activeStep === 2 && (
                <div className="space-y-5 animate-in fade-in">
                  <h4 className="text-base font-bold text-white">Step 2: Preferred Cuisines & Live Stalls</h4>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-2">
                      Select Preferred Cuisines (Multi-select)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {cuisineOptions.map((c) => {
                        const isChecked = selectedCuisines.includes(c);
                        return (
                          <button
                            type="button"
                            key={c}
                            onClick={() => toggleCuisine(c)}
                            className={`p-2.5 rounded-xl text-xs font-medium border text-left transition-all ${
                              isChecked
                                ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-bold'
                                : 'bg-neutral-800/60 border-neutral-700 text-neutral-300'
                            }`}
                          >
                            {isChecked ? '✓ ' : '+ '} {c}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-2">
                      Interactive Live Counters (Chef Attended)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {liveCounterOptions.map((lc) => {
                        const isChecked = selectedLiveCounters.includes(lc);
                        return (
                          <button
                            type="button"
                            key={lc}
                            onClick={() => toggleLiveCounter(lc)}
                            className={`p-2.5 rounded-xl text-xs font-medium border text-left transition-all flex items-center justify-between ${
                              isChecked
                                ? 'bg-purple-500/15 border-purple-500 text-purple-300 font-bold'
                                : 'bg-neutral-800/60 border-neutral-700 text-neutral-300'
                            }`}
                          >
                            <span>{lc}</span>
                            <span>{isChecked ? '✓' : '+'}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveStep(1)}
                      className="px-5 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold hover:bg-neutral-700"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveStep(3)}
                      className="px-6 py-2.5 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs hover:bg-amber-400"
                    >
                      Next: Budget & Staffing →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Budget & Staffing */}
              {activeStep === 3 && (
                <div className="space-y-5 animate-in fade-in">
                  <h4 className="text-base font-bold text-white">Step 3: Budget & Dietary Setup</h4>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-neutral-300">
                        Budget per Plate: <span className="text-amber-400 font-black">₹{budgetPerPlate}</span>
                      </label>
                      <span className="text-xs font-bold text-neutral-400">
                        Estimated Total: <span className="text-emerald-400">₹{estimatedTotal.toLocaleString('en-IN')}</span>
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1000}
                      max={3500}
                      step={100}
                      value={budgetPerPlate}
                      onChange={(e) => setBudgetPerPlate(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
                      <span>₹1,000 (Standard Gourmet)</span>
                      <span>₹1,800 (Signature Luxury)</span>
                      <span>₹3,500 (Imperial 7-Course)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-2">
                      Dietary & Religious Specifications
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {dietaryOptions.map((d) => {
                        const isChecked = selectedDietary.includes(d);
                        return (
                          <button
                            type="button"
                            key={d}
                            onClick={() => toggleDietary(d)}
                            className={`p-2 rounded-xl text-xs font-medium border text-left transition-all ${
                              isChecked
                                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-bold'
                                : 'bg-neutral-800/60 border-neutral-700 text-neutral-300'
                            }`}
                          >
                            {isChecked ? '✓ ' : '+ '} {d}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Staffing, Bar & Kitchen Notes
                    </label>
                    <textarea
                      rows={2}
                      value={specialNotes}
                      onChange={(e) => setSpecialNotes(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-100"
                    />
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveStep(2)}
                      className="px-5 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold hover:bg-neutral-700"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveStep(4)}
                      className="px-6 py-2.5 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs hover:bg-amber-400"
                    >
                      Next: Review & Contact →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Review & Submit */}
              {activeStep === 4 && (
                <div className="space-y-5 animate-in fade-in">
                  <h4 className="text-base font-bold text-white">Step 4: Contact & Final Review</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">Contact Name</label>
                      <input
                        type="text"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs"
                      />
                    </div>
                  </div>

                  {/* Summary Box */}
                  <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs">
                    <div className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                      Inquiry Summary
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-neutral-300">
                      <div>
                        <span className="text-neutral-500 block">Occasion:</span>
                        <span className="font-semibold text-white">{eventType}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block">Guests:</span>
                        <span className="font-semibold text-white">{guestCount} persons</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block">Date & Time:</span>
                        <span className="font-semibold text-white">{eventDate}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block">Estimate:</span>
                        <div>
                          <span className="font-black text-amber-400 text-sm">
                            ₹{estimatedTotal.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 text-[11px] text-neutral-400">
                      <strong>Cuisines:</strong> {selectedCuisines.join(', ')} • <strong>Live Stalls:</strong> {selectedLiveCounters.join(', ')}
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveStep(3)}
                      className="px-5 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold hover:bg-neutral-700"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      className="px-7 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-black text-xs hover:from-amber-400 hover:to-amber-500 shadow-xl shadow-amber-500/20"
                    >
                      Submit Catering Proposal Request 🍽️
                    </button>
                  </div>
                </div>
              )}

            </form>
          )}

        </div>
      </div>

      {/* Submitted Proposals Tracker */}
      {inquiries.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
            Active Catering Quotes & Proposals ({inquiries.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inquiries.map((inq) => (
              <div
                key={inq.id}
                className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{inq.eventType}</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-semibold">
                      {inq.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="text-neutral-400 mt-1">
                    {inq.guestCount} guests • {inq.eventDate} • ₹{inq.budgetPerPlate}/plate
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-1">{inq.venueLocation}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-amber-400">
                    ₹{inq.totalBudgetEstimate.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-1 font-semibold">Chef Curating Menu</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
