import React, { useState } from 'react';
import { Chef, JobPosting, JobApplication, User, B2BShiftRequest } from '../../types';
import { BangaloreMap } from '../map/BangaloreMap';
import { VerifiedBadge } from '../common/VerifiedBadge';

interface B2BHireChefViewProps {
  chefs: Chef[];
  userLocation: { lat: number; lng: number; area: string };
  jobPostings: JobPosting[];
  jobApplications: JobApplication[];
  currentUser: User | null;
  onOpenAuth: () => void;
  onPostJob: (job: JobPosting) => void;
  onRequestB2BShift: (shift: B2BShiftRequest) => void;
  onBackToHome: () => void;
  onOpenVerificationSimulator?: () => void;
}

export const B2BHireChefView: React.FC<B2BHireChefViewProps> = ({
  chefs,
  userLocation,
  jobPostings,
  jobApplications,
  currentUser,
  onOpenAuth,
  onPostJob,
  onRequestB2BShift,
  onBackToHome,
  onOpenVerificationSimulator,
}) => {
  const [subAction, setSubAction] = useState<'shift_staff' | 'job_board'>('shift_staff');

  // Sub-Action 1: Shift Staff State
  const [shiftRadius, setShiftRadius] = useState<number>(3);
  const [selectedShiftChef, setSelectedShiftChef] = useState<Chef | null>(chefs[0] || null);
  const [restaurantName, setRestaurantName] = useState('Toit Brewpub (Indiranagar)');
  const [shiftRole, setShiftRole] = useState<B2BShiftRequest['roleNeeded']>('Tandoor Chef');
  const [shiftTiming, setShiftTiming] = useState<B2BShiftRequest['shiftTiming']>('Dinner Rush (6 PM - 11 PM)');
  const [shiftHours, setShiftHours] = useState<number>(5);
  const [hourlyRate, setHourlyRate] = useState<number>(550);
  const [shiftNotes, setShiftNotes] = useState('Weekend dinner rush backup. Requires clay tandoor and naan rolling speed.');
  const [dispatchedShift, setDispatchedShift] = useState<B2BShiftRequest | null>(null);

  // Sub-Action 2: Job Board State
  const [showPostJobModal, setShowPostJobModal] = useState<boolean>(false);
  const [selectedJobForReview, setSelectedJobForReview] = useState<JobPosting | null>(null);

  // New Job Form
  const [newTitle, setNewTitle] = useState('');
  const [newRestaurant, setNewRestaurant] = useState('The Humming Tree Kitchen');
  const [newLocation, setNewLocation] = useState('12th Main, Indiranagar, Bengaluru');
  const [newSalary, setNewSalary] = useState('₹55,000 - ₹70,000 / month');
  const [newExp, setNewExp] = useState('4 - 7 years in upscale casual dining');
  const [newCuisine, setNewCuisine] = useState('Pan-Asian & Continental');
  const [newDesc, setNewDesc] = useState('Lead the cold and hot kitchen stations. Menu innovations and cost margins.');

  const availableCooksInRadius = chefs.filter(c => c.isOnline && c.distanceKm <= shiftRadius);

  const handleDispatchShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    const totalPayout = hourlyRate * shiftHours;
    const shift: B2BShiftRequest = {
      id: `b2b-shift-${Date.now()}`,
      restaurantName,
      managerName: currentUser.name || 'Restaurant GM',
      managerPhone: currentUser.phone || '+91 99001 45892',
      area: userLocation.area,
      date: new Date().toISOString().split('T')[0],
      shiftTiming,
      roleNeeded: shiftRole,
      hourlyRate,
      totalPayout,
      status: 'open',
      assignedChefId: selectedShiftChef?.id,
    };

    onRequestB2BShift(shift);
    setDispatchedShift(shift);
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    const job: JobPosting = {
      id: `job-${Date.now()}`,
      title: newTitle || 'Senior CDP / Kitchen Lead',
      restaurantName: newRestaurant,
      restaurantLogo: '🍽️',
      location: newLocation,
      type: 'Full-time',
      experienceRequired: newExp,
      salaryRange: newSalary,
      cuisineCategory: newCuisine,
      description: newDesc,
      requirements: ['Valid culinary diploma or equivalent experience', 'Food safety compliance', 'High volume efficiency'],
      benefits: ['Health insurance', 'Staff meals', 'Performance quarterly bonus'],
      postedDate: 'Just now',
      applicantsCount: 0,
    };

    onPostJob(job);
    setShowPostJobModal(false);
    setNewTitle('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-neutral-800">
        <div>
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-amber-400 font-semibold mb-1 transition-colors"
          >
            <span>←</span>
            <span>Back to All Pathways</span>
          </button>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Hospitality B2B Staffing Portal
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
              Hotels & Restaurants
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Empowering restaurants, microbreweries, luxury hotels, and cloud kitchens across India with on-demand culinary workforce solutions.
          </p>
        </div>

        {/* Sub-Action Switcher (Exact requirement: 'On-Demand Shift Staff' and 'Permanent Hiring') */}
        <div className="flex items-center bg-neutral-900 p-1.5 rounded-2xl border border-neutral-800">
          <button
            onClick={() => setSubAction('shift_staff')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              subAction === 'shift_staff'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>⚡ Action 1:</span>
            <span>On-Demand Shift Staff (Gig)</span>
          </button>

          <button
            onClick={() => setSubAction('job_board')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              subAction === 'job_board'
                ? 'bg-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>📋 Action 2:</span>
            <span>Job Board (Permanent)</span>
          </button>
        </div>
      </div>

      {/* SUB-ACTION 1: On-Demand Shift Staff (Live Map Powered) */}
      {subAction === 'shift_staff' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          <div className="bg-gradient-to-r from-blue-950/40 via-neutral-900 to-neutral-900 border border-blue-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 text-xl flex items-center justify-center font-bold">
                🚨
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Emergency Kitchen Cover Dispatch</h4>
                <p className="text-xs text-neutral-400">
                  Cook absent? Friday night rush? Find and instantly dispatch active verified cooks within 5 km.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400 font-semibold">Radius:</span>
              <input
                type="range"
                min={1}
                max={5}
                value={shiftRadius}
                onChange={(e) => setShiftRadius(Number(e.target.value))}
                className="w-24 accent-blue-500"
              />
              <span className="text-xs font-black text-blue-400 bg-neutral-800 px-2 py-0.5 rounded">
                {shiftRadius} km
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Live Map with Cooks */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-3">
              <div className="h-[440px] w-full relative">
                <BangaloreMap
                  chefs={chefs}
                  userLocation={userLocation}
                  radiusKm={shiftRadius}
                  selectedChef={selectedShiftChef}
                  onSelectChef={(c) => setSelectedShiftChef(c)}
                />
              </div>

              {/* Quick Select Chef Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {availableCooksInRadius.map((chef) => (
                  <div
                    key={chef.id}
                    onClick={() => setSelectedShiftChef(chef)}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center gap-2.5 ${
                      selectedShiftChef?.id === chef.id
                        ? 'bg-blue-500/15 border-blue-500 text-white'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    <img src={chef.avatar} alt={chef.name} className="w-9 h-9 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <div className="font-bold truncate">{chef.name}</div>
                        <VerifiedBadge
                          size="sm"
                          showLabel={false}
                          status={chef.verificationReport?.status || (chef.policeVerified ? 'verified' : 'unverified')}
                          report={chef.verificationReport}
                          onOpenReportModal={onOpenVerificationSimulator}
                        />
                      </div>
                      <div className="text-[10px] text-neutral-400 truncate">{chef.specialties[0]}</div>
                      <div className="text-[10px] text-blue-400 font-semibold">₹{chef.hourlyRate}/hr • {chef.distanceKm}km</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shift Booking Dispatch Box */}
            <div className="lg:col-span-5 xl:col-span-4 rounded-3xl bg-neutral-900 border border-neutral-800 p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div>
                  <h3 className="text-sm font-black text-white">Instant Shift Request</h3>
                  <p className="text-[11px] text-neutral-400">Direct dispatch to cook's mobile</p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                  Gig Shift
                </span>
              </div>

              {dispatchedShift ? (
                <div className="py-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 text-2xl flex items-center justify-center mx-auto">
                    ✓
                  </div>
                  <h4 className="text-base font-bold text-white">Shift Broadcast Active!</h4>
                  <p className="text-xs text-neutral-300">
                    Dispatched to <span className="text-amber-400 font-bold">{selectedShiftChef?.name || 'Cooks'}</span> for {dispatchedShift.shiftTiming}.
                  </p>
                  <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-left text-neutral-300 space-y-1">
                    <div><strong>Restaurant:</strong> {dispatchedShift.restaurantName}</div>
                    <div><strong>Role:</strong> {dispatchedShift.roleNeeded}</div>
                    <div><strong>Escrow Payout:</strong> ₹{dispatchedShift.totalPayout}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDispatchedShift(null)}
                    className="w-full py-2.5 rounded-xl bg-neutral-800 text-white text-xs font-bold hover:bg-neutral-700"
                  >
                    Post Another Emergency Shift
                  </button>
                </div>
              ) : (
                <form onSubmit={handleDispatchShift} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">Restaurant / Kitchen Name</label>
                    <input
                      type="text"
                      value={restaurantName}
                      onChange={(e) => setRestaurantName(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-800 border border-neutral-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">Role Needed</label>
                    <select
                      value={shiftRole}
                      onChange={(e) => setShiftRole(e.target.value as B2BShiftRequest['roleNeeded'])}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-800 border border-neutral-700 text-white"
                    >
                      <option>Tandoor Chef</option>
                      <option>Line Cook / CDP</option>
                      <option>South Indian Master</option>
                      <option>Continental & Grill</option>
                      <option>Kitchen Steward</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">Shift Window</label>
                    <select
                      value={shiftTiming}
                      onChange={(e) => {
                        const val = e.target.value as B2BShiftRequest['shiftTiming'];
                        setShiftTiming(val);
                        if (val.includes('Double')) setShiftHours(10);
                        else setShiftHours(5);
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-800 border border-neutral-700 text-white"
                    >
                      <option>Dinner Rush (6 PM - 11 PM)</option>
                      <option>Lunch Rush (11 AM - 4 PM)</option>
                      <option>Full Double (11 AM - 11 PM)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Hourly Rate (₹)</label>
                      <input
                        type="number"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(Number(e.target.value))}
                        step={50}
                        min={300}
                        max={1200}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-800 border border-neutral-700 text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Duration</label>
                      <div className="px-3 py-2 text-xs rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-300 font-bold">
                        {shiftHours} hours
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">Shift Notes / Station</label>
                    <textarea
                      rows={2}
                      value={shiftNotes}
                      onChange={(e) => setShiftNotes(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-neutral-800 border border-neutral-700 text-white"
                    />
                  </div>

                  {/* Shift Calculation */}
                  <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-neutral-400">Total Gig Payout:</span>
                      <div className="text-[10px] text-emerald-400">Escrow released post-shift</div>
                    </div>
                    <span className="text-lg font-black text-blue-400">
                      ₹{hourlyRate * shiftHours}
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black text-xs hover:from-blue-500 hover:to-blue-400 transition-all shadow-xl shadow-blue-600/20"
                  >
                    🚨 Dispatch Shift Request on Live Map
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      )}

      {/* SUB-ACTION 2: Job Board (Permanent Vacancies) */}
      {subAction === 'job_board' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900 border border-neutral-800 p-5 rounded-2xl">
            <div>
              <h3 className="text-base font-black text-white">Permanent Culinary Vacancies & Head Chefs</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Post full-time positions (Executive Chef, Tandoor Expert, Pastry Lead) and review vetted Bangalore applicants.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowPostJobModal(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs hover:bg-amber-400 transition-colors flex items-center gap-2 whitespace-nowrap shadow-lg shadow-amber-500/20"
            >
              <span>+</span>
              <span>Post New Vacancy</span>
            </button>
          </div>

          {/* Job Listings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobPostings.map((job) => {
              const applicationsForThisJob = jobApplications.filter(a => a.jobId === job.id);
              return (
                <div
                  key={job.id}
                  className="rounded-2xl bg-neutral-900/90 border border-neutral-800 p-5 shadow-xl flex flex-col justify-between hover:border-neutral-700 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center text-xl">
                          {job.restaurantLogo}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white">{job.title}</h4>
                          <p className="text-xs text-amber-400 font-semibold">{job.restaurantName}</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 text-[10px] font-bold">
                        {job.type}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="text-neutral-400">📍 {job.location}</span>
                      <span className="text-emerald-400 font-bold">💰 {job.salaryRange}</span>
                      <span className="text-neutral-400">⏳ {job.experienceRequired}</span>
                    </div>

                    <p className="text-xs text-neutral-300 mt-3 line-clamp-2">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {job.requirements.slice(0, 2).map((req, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">
                          ✓ {req}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between">
                    <span className="text-[11px] text-neutral-400">
                      👥 {job.applicantsCount + applicationsForThisJob.length} Applicants
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedJobForReview(job)}
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-400 text-xs font-bold"
                    >
                      Review Applicants ({applicationsForThisJob.length})
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Post Job Modal */}
      {showPostJobModal && (
        <div className="fixed inset-0 z-[2070] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-700 rounded-3xl p-6 shadow-2xl text-neutral-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowPostJobModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white text-xl p-1"
            >
              ✕
            </button>
            <h3 className="text-lg font-black text-white mb-1">Post Permanent Hotel / Kitchen Vacancy</h3>
            <p className="text-xs text-neutral-400 mb-4">
              Your posting will be visible immediately to all verified chefs on the Chef App portal.
            </p>

            <form onSubmit={handleCreateJob} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Position Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Executive Chef / Head Tandoor Master"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-800 border border-neutral-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Establishment Name</label>
                  <input
                    type="text"
                    value={newRestaurant}
                    onChange={(e) => setNewRestaurant(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-800 border border-neutral-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Location / Locality</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-800 border border-neutral-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Monthly Salary Range</label>
                  <input
                    type="text"
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
                    placeholder="e.g. ₹50,000 - ₹65,000"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-800 border border-neutral-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Experience Required</label>
                  <input
                    type="text"
                    value={newExp}
                    onChange={(e) => setNewExp(e.target.value)}
                    placeholder="e.g. 5+ years"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-800 border border-neutral-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Job Description & Responsibilities</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-800 border border-neutral-700 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 text-neutral-950 font-black text-xs hover:bg-amber-400 shadow-xl shadow-amber-500/20"
              >
                Publish Vacancy to Job Board
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Review Applicants Drawer / Modal */}
      {selectedJobForReview && (
        <div className="fixed inset-0 z-[2070] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-700 rounded-3xl p-6 shadow-2xl text-neutral-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedJobForReview(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white text-xl p-1"
            >
              ✕
            </button>

            <h3 className="text-base font-black text-white">
              Applicants for: {selectedJobForReview.title}
            </h3>
            <p className="text-xs text-neutral-400">{selectedJobForReview.restaurantName}</p>

            <div className="mt-4 space-y-3">
              {jobApplications.filter(a => a.jobId === selectedJobForReview.id).length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-400">
                  <span className="text-2xl block mb-2">📬</span>
                  No chef applications received yet. Chefs browse this from the Chef App Portal!
                </div>
              ) : (
                jobApplications
                  .filter(a => a.jobId === selectedJobForReview.id)
                  .map((app) => (
                    <div
                      key={app.id}
                      className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{app.chefName}</span>
                        <span className="text-amber-400 font-semibold">{app.chefExperience} yrs experience</span>
                      </div>
                      <div className="text-[11px] text-neutral-400">{app.specialties.join(', ')}</div>
                      <p className="text-neutral-300 italic">"{app.pitch}"</p>
                      <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
                        <span className="text-[10px] text-emerald-400 font-semibold">● Status: {app.status}</span>
                        <button
                          type="button"
                          className="px-2.5 py-1 rounded bg-amber-500 text-neutral-950 font-bold text-[11px]"
                        >
                          Schedule Tasting Trial
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
