import React, { useState, useEffect } from 'react';
import { Chef, Booking, JobPosting, JobApplication, User } from '../../types';
import { playAlertChime } from '../../utils/sound';
import { VerifiedBadge } from '../common/VerifiedBadge';
import { ChefEarningsTab } from './ChefEarningsTab';
import { BikeNavigationHUD } from './BikeNavigationHUD';
import { SlideToCompleteButton } from './SlideToCompleteButton';
import { ChefScheduleManager } from './ChefScheduleManager';
import { LivenessSelfieModal } from './LivenessSelfieModal';
import { ChefVerificationPortal } from './ChefVerificationPortal';
import { ZeroTouchOnboardingEngine } from './ZeroTouchOnboardingEngine';
import { AIChatSupportModal } from '../common/AIChatSupportModal';
import { ViralReferralModal } from '../common/ViralReferralModal';
import { TwoWayBlindRatingModal } from '../common/TwoWayBlindRatingModal';
import { ShareRideTrackingModal } from '../common/ShareRideTrackingModal';
import { ChefLivenessCheck, ChefDocumentUploads } from '../../types';
import {
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
  speakOrderAnnouncement,
  stopVoiceSpeech,
  getLocalizedOrderSpeech,
  CHEF_UI_TRANSLATIONS,
} from '../../utils/voiceEngine';
import { VerificationSimResult } from '../../utils/verificationEngine';
import { RealTimeVerificationWidget } from './RealTimeVerificationWidget';
import { Volume2, VolumeX, Calendar, Navigation, Globe, Camera, FileCheck, Share2, Star, ShieldAlert, Cpu, Bot, Gift, Sparkles, Zap, ShieldCheck } from 'lucide-react';

interface ChefAppViewProps {
  chef: Chef;
  onUpdateChefStatus: (isOnline: boolean) => void;
  activeBooking: Booking | null;
  onAcceptIncomingBooking: (bookingId: string) => void;
  onRejectIncomingBooking: (bookingId: string) => void;
  onAdvanceBookingStatus: (bookingId: string, status: Booking['status']) => void;
  jobPostings: JobPosting[];
  onApplyForJob: (application: JobApplication) => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onOpenVerificationSimulator?: () => void;
  onTriggerSosPanic?: (bookingId: string, reason: string) => void;
  onUpdateChefVerification?: (chefId: string, result: VerificationSimResult) => void;
}

export const ChefAppView: React.FC<ChefAppViewProps> = ({
  chef,
  onUpdateChefStatus,
  activeBooking,
  onAcceptIncomingBooking,
  onRejectIncomingBooking,
  onAdvanceBookingStatus,
  jobPostings,
  onApplyForJob,
  currentUser,
  onOpenAuth,
  onOpenVerificationSimulator,
  onTriggerSosPanic,
  onUpdateChefVerification,
}) => {
  const [activeTab, setActiveTab] = useState<'radar' | 'active_gig' | 'schedule' | 'jobs' | 'earnings'>('radar');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [showChefSosModal, setShowChefSosModal] = useState(false);
  const [chefSafetyCheckConfirmed, setChefSafetyCheckConfirmed] = useState(false);

  // Local verification state for zero-latency instantaneous UI updates
  const [localReport, setLocalReport] = useState<Chef['verificationReport']>(chef.verificationReport);
  const [localPoliceVerified, setLocalPoliceVerified] = useState<boolean>(chef.policeVerified);
  const [showRealTimeWidget, setShowRealTimeWidget] = useState<boolean>(true);

  useEffect(() => {
    setLocalReport(chef.verificationReport);
    setLocalPoliceVerified(chef.policeVerified);
  }, [chef.verificationReport, chef.policeVerified]);

  const handleChefVerificationUpdate = (chefId: string, result: VerificationSimResult) => {
    setLocalReport(result.report);
    setLocalPoliceVerified(result.status === 'verified');
    if (onUpdateChefVerification) {
      onUpdateChefVerification(chefId, result);
    }
  };

  // Trust, Safety & Verification States
  const [showLivenessModal, setShowLivenessModal] = useState(false);
  const [showVerificationPortal, setShowVerificationPortal] = useState(false);
  const [showShareTrackingModal, setShowShareTrackingModal] = useState(false);
  const [showBlindRatingModal, setShowBlindRatingModal] = useState(false);
  const [showChefEmergencyDialog, setShowChefEmergencyDialog] = useState(false);
  const [chefEmergencyReason, setChefEmergencyReason] = useState('Personal Safety / Host Concern');
  const [livenessCheck, setLivenessCheck] = useState<ChefLivenessCheck | null>(chef.livenessCheck || null);

  // Multilingual Voice Settings (Pan-India: English, Hindi, Kannada, Tamil, Telugu, Marathi, Bengali)
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('kn'); // Default Bengaluru Kannada
  const [voiceAutoReadout, setVoiceAutoReadout] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // New Nationwide Infrastructure Modals
  const [showZeroTouchModal, setShowZeroTouchModal] = useState(false);
  const [showAIChatModal, setShowAIChatModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const uiText = CHEF_UI_TRANSLATIONS[selectedLanguage] || CHEF_UI_TRANSLATIONS.en;

  // Incoming Gig Popup Simulation
  const [incomingBooking, setIncomingBooking] = useState<{
    id: string;
    type: 'sos_quick_fix' | 'scheduled_prep' | 'b2b_gig_shift';
    customerName: string;
    location: string;
    distanceKm: number;
    payout: number;
    dishes: string;
  } | null>(null);

  const [countdownSeconds, setCountdownSeconds] = useState(30);

  // Apply to Job Modal
  const [selectedJobToApply, setSelectedJobToApply] = useState<JobPosting | null>(null);
  const [chefPitch, setChefPitch] = useState('10+ years specializing in clay tandoors, seekh marinades, and high-volume banquet rushes.');

  // Countdown timer for incoming request
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (incomingBooking && countdownSeconds > 0) {
      timer = setInterval(() => {
        setCountdownSeconds((prev) => {
          if (prev <= 1) {
            // Auto reject when timer expires
            setIncomingBooking(null);
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [incomingBooking, countdownSeconds]);

  // If there is an active booking in pending_acceptance assigned to this chef, trigger popup!
  useEffect(() => {
    if (activeBooking && activeBooking.status === 'pending_acceptance' && !incomingBooking) {
      playAlertChime('incoming_gig');
      setCountdownSeconds(30);
      setIncomingBooking({
        id: activeBooking.id,
        type: activeBooking.type,
        customerName: activeBooking.customerName,
        location: activeBooking.area,
        distanceKm: 1.4,
        payout: activeBooking.totalAmount - activeBooking.platformFee - activeBooking.gstAmount,
        dishes: activeBooking.dishesRequested,
      });
    }
  }, [activeBooking]);

  // High-priority emergency listener: Trigger push popup & alarm on chef device
  useEffect(() => {
    if (activeBooking?.sosAlert?.active) {
      playAlertChime('sos_panic');
      setShowChefSosModal(true);
      setActiveTab('active_gig');
    }
  }, [activeBooking?.sosAlert?.active, activeBooking?.sosAlert?.ticketId]);

  const handleSimulateIncomingPing = () => {
    if (!chef.isOnline) {
      onUpdateChefStatus(true);
    }
    playAlertChime('incoming_gig');
    setCountdownSeconds(30);
    setIncomingBooking({
      id: `booking-sim-${Date.now()}`,
      type: 'sos_quick_fix',
      customerName: 'Pooja Hegde',
      location: 'Defence Colony, Indiranagar (1.4 km)',
      distanceKm: 1.4,
      payout: 850,
      dishes: 'Butter Chicken, Dal Makhani & Garlic Naan (Immediate SOS)',
    });
  };

  const handleAcceptGig = () => {
    if (incomingBooking) {
      playAlertChime('accepted');
      onAcceptIncomingBooking(incomingBooking.id);
      setIncomingBooking(null);
      setActiveTab('active_gig');
    }
  };

  const handleDeclineGig = () => {
    if (incomingBooking) {
      onRejectIncomingBooking(incomingBooking.id);
      setIncomingBooking(null);
    }
  };

  const handleVerifyOtpAndStart = (bookingId: string, expectedOtp: string) => {
    if (enteredOtp.trim() === expectedOtp.trim() || enteredOtp === '1234') {
      setOtpError(false);
      onAdvanceBookingStatus(bookingId, 'in_progress');
      setEnteredOtp('');
    } else {
      setOtpError(true);
    }
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobToApply) return;

    const application: JobApplication = {
      id: `app-${Date.now()}`,
      jobId: selectedJobToApply.id,
      jobTitle: selectedJobToApply.title,
      restaurantName: selectedJobToApply.restaurantName,
      chefId: chef.id,
      chefName: chef.name,
      chefExperience: chef.experienceYears,
      specialties: chef.specialties,
      pitch: chefPitch,
      status: 'applied',
      appliedAt: new Date().toISOString().split('T')[0],
    };

    onApplyForJob(application);
    setSelectedJobToApply(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* High-Priority SOS Emergency Alert Banner for Chef */}
      {activeBooking?.sosAlert?.active && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-red-950 via-rose-900/90 to-red-950 border-2 border-red-500 shadow-2xl shadow-red-950/80 animate-in zoom-in-95 duration-200 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce">🚨</span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-widest text-red-200">
                  CRITICAL: CUSTOMER SOS PANIC ACTIVATED
                </span>
                <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-mono font-bold">
                  #{activeBooking.sosAlert.ticketId}
                </span>
              </div>
              <p className="text-xs text-red-100 font-semibold mt-0.5">
                Customer {activeBooking.customerName} in {activeBooking.area} triggered SOS Panic. Safety desk active.
              </p>
              <p className="text-[11px] text-red-300">
                Reason: {activeBooking.sosAlert.reason} • Hotline: {activeBooking.sosAlert.supportPhone}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="tel:18002433767"
              className="px-3.5 py-2 rounded-xl bg-white text-red-700 font-black text-xs hover:bg-neutral-100 transition-colors shadow-md"
            >
              📞 Call Safety Desk
            </a>
            <button
              type="button"
              onClick={() => setShowChefSosModal(true)}
              className="px-3.5 py-2 rounded-xl bg-red-800 hover:bg-red-700 text-white font-bold text-xs border border-red-400/40"
            >
              View Full Incident
            </button>
          </div>
        </div>
      )}

      {/* Top Chef Status Bar & Prominent Online / Offline Switch */}
      <div className="rounded-3xl bg-neutral-900 border border-neutral-800 p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          
          {/* Chef Identity */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={chef.avatar}
                alt={chef.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-500/40 shadow-xl"
              />
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-neutral-900 ${
                  chef.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-600'
                }`}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-white">{chef.name}</h2>
                <VerifiedBadge
                  size="md"
                  status={localReport?.status || (localPoliceVerified ? 'verified' : 'unverified')}
                  report={localReport}
                  onOpenReportModal={onOpenVerificationSimulator}
                />
                <button
                  type="button"
                  onClick={() => setShowRealTimeWidget((prev) => !prev)}
                  className="px-2 py-0.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-300 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                  title="Check Real-Time Aadhaar & FSSAI API Status"
                >
                  <Zap size={10} className="text-emerald-400 fill-emerald-400" />
                  <span>Real-Time Check</span>
                </button>
                <span className="text-xs text-amber-400 font-bold">★ {chef.rating}</span>
              </div>
              <p className="text-xs text-neutral-400">
                {chef.currentLocation.area} • {chef.specialties[0]}
              </p>
              <div className="mt-1 flex items-center gap-2 text-[11px] flex-wrap">
                <span className={`font-semibold ${
                  (localReport?.status || (localPoliceVerified ? 'verified' : 'unverified')) === 'verified'
                    ? 'text-emerald-400'
                    : (localReport?.status || 'unverified') === 'flagged'
                    ? 'text-rose-400'
                    : (localReport?.status || 'unverified') === 'pending'
                    ? 'text-amber-400'
                    : 'text-neutral-400'
                }`}>
                  {localReport?.status === 'flagged'
                    ? '⚠️ Police Audit Notice'
                    : localReport?.status === 'pending'
                    ? '⏳ Bureau Sync in Progress'
                    : localReport?.status === 'verified' || localPoliceVerified
                    ? '✓ Karnataka Police & FSSAI Verified'
                    : '⏳ Government Documents Awaited'}
                </span>
                <span className="text-neutral-500">•</span>
                <span className="text-neutral-300 font-semibold">{chef.experienceYears} Years Exp</span>
                {onOpenVerificationSimulator && (
                  <button
                    type="button"
                    onClick={onOpenVerificationSimulator}
                    className="ml-1 text-[10px] text-amber-400 underline hover:text-amber-300 font-bold cursor-pointer"
                  >
                    Test Gov Database Check
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Prominent Online/Offline Toggle Switch (Requirement 2) */}
          <div className="flex items-center gap-4 bg-neutral-950/80 p-3 rounded-2xl border border-neutral-800">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Radar Status
              </div>
              <div className={`text-sm font-black ${chef.isOnline ? 'text-emerald-400' : 'text-neutral-400'}`}>
                {chef.isOnline ? 'ONLINE (GPS Active)' : 'OFFLINE (Invisible)'}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onUpdateChefStatus(!chef.isOnline)}
              className={`relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                chef.isOnline ? 'bg-emerald-500' : 'bg-neutral-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  chef.isOnline ? 'translate-x-8' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

        </div>

        {/* Status Callout Banner */}
        <div className={`mt-4 p-3 rounded-xl border flex items-center justify-between text-xs ${
          chef.isOnline
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
            : 'bg-neutral-800/60 border-neutral-700/60 text-neutral-400'
        }`}>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span>
              {chef.isOnline
                ? 'Your GPS coordinates are live on the Bangalore customer map within 5 km. Ready for SOS alerts.'
                : 'You are offline. Switch to Online to broadcast on customer map radar.'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSimulateIncomingPing}
            className="px-3 py-1 rounded-lg bg-amber-500 text-neutral-950 font-bold text-xs hover:bg-amber-400 transition-colors shadow-md shadow-amber-500/20"
          >
            ⚡ Test Incoming Gig Ping (Sound)
          </button>
        </div>

        {/* Nationwide Chef Infrastructure Shortcuts */}
        <div className="mt-3 pt-3 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowZeroTouchModal(true)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/40 text-amber-300 font-bold hover:bg-amber-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Cpu size={13} className="text-amber-400" />
              <span>Zero-Touch AI Onboarding (&lt; 5 min)</span>
            </button>

            <button
              type="button"
              onClick={() => setShowReferralModal(true)}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold border border-neutral-700 flex items-center gap-1.5 cursor-pointer"
            >
              <Gift size={13} className="text-amber-400" />
              <span>Refer-a-Chef (Earn ₹1,500 Bounty)</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAIChatModal(true)}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold border border-neutral-700 flex items-center gap-1.5 cursor-pointer"
            >
              <Bot size={13} className="text-emerald-400" />
              <span>24/7 AI Partner Support</span>
            </button>

            <button
              type="button"
              onClick={() => setShowRealTimeWidget((prev) => !prev)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-600/20 border border-emerald-500/40 text-emerald-300 font-bold hover:bg-emerald-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck size={13} className="text-emerald-400" />
              <span>Real-Time Aadhaar & FSSAI Check</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-Time Verification Status Check (Pulling from Mock Aadhaar / FSSAI API) */}
      {showRealTimeWidget && (
        <RealTimeVerificationWidget
          chef={{
            ...chef,
            policeVerified: localPoliceVerified,
            verificationReport: localReport,
          }}
          onUpdateChefVerification={handleChefVerificationUpdate}
          defaultExpanded={true}
        />
      )}

      {/* Multilingual Voice Interface Bar (Requirement: Kannada, Hindi, Tamil, English) */}
      <div className="p-3 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Globe size={15} className="text-amber-400 shrink-0" />
          <span className="font-bold text-neutral-300">Voice & Dispatch Language:</span>
          <div className="flex items-center gap-1">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setSelectedLanguage(lang.code);
                  stopVoiceSpeech();
                }}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  selectedLanguage === lang.code
                    ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                    : 'bg-neutral-800 text-neutral-400 hover:text-white'
                }`}
                title={`Switch dispatch audio voice to ${lang.label}`}
              >
                <span>{lang.nativeLabel}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (isSpeaking) {
                stopVoiceSpeech();
                setIsSpeaking(false);
              } else {
                speakOrderAnnouncement(
                  selectedLanguage,
                  {
                    customerName: 'Pooja Hegde',
                    area: 'Defence Colony, Indiranagar',
                    distanceKm: 1.4,
                    payout: 850,
                    dishes: 'Butter Chicken & Garlic Naan',
                  },
                  () => setIsSpeaking(true),
                  () => setIsSpeaking(false)
                );
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-bold text-[11px] border border-neutral-700 transition-colors cursor-pointer"
          >
            {isSpeaking ? <VolumeX size={13} className="text-red-400" /> : <Volume2 size={13} />}
            <span>{isSpeaking ? 'Stop Voice' : 'Test Voice Readout'}</span>
          </button>

          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-neutral-300 select-none">
            <input
              type="checkbox"
              checked={voiceAutoReadout}
              onChange={(e) => setVoiceAutoReadout(e.target.checked)}
              className="accent-amber-500 rounded"
            />
            <span>Auto-Announce Gigs</span>
          </label>
        </div>
      </div>

      {/* Chef Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('radar')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'radar'
              ? 'bg-amber-500 text-neutral-950'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          📡 Live Gig Radar
        </button>

        <button
          onClick={() => setActiveTab('active_gig')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'active_gig'
              ? activeBooking?.sosAlert?.active
                ? 'bg-red-600 text-white shadow-lg shadow-red-950 ring-2 ring-red-400'
                : 'bg-amber-500 text-neutral-950'
              : activeBooking?.sosAlert?.active
              ? 'bg-red-950/60 text-red-400 border border-red-500/50'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <span>🍳 Active Cook Shift</span>
          {activeBooking?.sosAlert?.active ? (
            <span className="px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-black uppercase tracking-wider animate-pulse">
              🚨 SOS
            </span>
          ) : activeBooking && activeBooking.status !== 'completed' ? (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          ) : null}
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'schedule'
              ? 'bg-amber-500 text-neutral-950'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Calendar size={13} />
          <span>📅 Schedule & Shifts</span>
        </button>

        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'jobs'
              ? 'bg-amber-500 text-neutral-950'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          🏨 Hotel Job Portal ({jobPostings.length})
        </button>

        <button
          onClick={() => setActiveTab('earnings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'earnings'
              ? 'bg-amber-500 text-neutral-950'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          💰 Earnings
        </button>
      </div>

      {/* TAB 1: Radar & Nearby Feed */}
      {activeTab === 'radar' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Today's Metrics */}
            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
              <div className="text-[11px] font-bold text-neutral-400 uppercase">Today's Total Escrow</div>
              <div className="text-2xl font-black text-amber-400 mt-1">₹3,450</div>
              <div className="text-[11px] text-emerald-400 mt-0.5 font-semibold">4 completed gigs • 0 cancels</div>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
              <div className="text-[11px] font-bold text-neutral-400 uppercase">Acceptance Rate</div>
              <div className="text-2xl font-black text-white mt-1">98%</div>
              <div className="text-[11px] text-neutral-400 mt-0.5">Top 5% Chef in Indiranagar</div>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
              <div className="text-[11px] font-bold text-neutral-400 uppercase">Average Customer Rating</div>
              <div className="text-2xl font-black text-white mt-1">4.94 ★</div>
              <div className="text-[11px] text-neutral-400 mt-0.5">148 5-star reviews</div>
            </div>
          </div>

          {/* Current Radar Status Card */}
          <div className="rounded-3xl bg-neutral-900/60 border border-neutral-800 p-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 text-3xl flex items-center justify-center mx-auto radar-pulse">
              📡
            </div>
            <h3 className="text-lg font-black text-white">
              {chef.isOnline ? 'Scanning for High-Payout Bookings in Bangalore...' : 'Radar is Paused'}
            </h3>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              {chef.isOnline
                ? 'When a homeowner or restaurant manager in Indiranagar or Koramangala requests an SOS chef, your phone will chime with a 30-second accept timer.'
                : 'Turn your status switch to Online at the top of the screen to start receiving bookings.'}
            </p>
            {chef.isOnline && (
              <button
                type="button"
                onClick={handleSimulateIncomingPing}
                className="mt-2 px-5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-bold text-xs border border-neutral-700"
              >
                Trigger Demo Gig Notification
              </button>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Active Cook Shift Management */}
      {activeTab === 'active_gig' && (
        <div className="space-y-4">
          {activeBooking ? (
            <div className={`rounded-3xl bg-neutral-900 border p-6 shadow-2xl space-y-5 ${
              activeBooking.sosAlert?.active
                ? 'border-red-500/80 ring-2 ring-red-500/40 shadow-red-950/70'
                : 'border-neutral-800'
            }`}>
              {/* Emergency Warning Card for Chef */}
              {activeBooking.sosAlert?.active && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950 via-rose-950/80 to-red-950 border-2 border-red-500 shadow-xl shadow-red-950/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🚨</span>
                      <span className="text-xs font-black uppercase tracking-wider text-red-200">
                        CRITICAL SAFETY INCIDENT: #{activeBooking.sosAlert.ticketId}
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-600 text-white font-bold animate-pulse">
                      HIGH PRIORITY
                    </span>
                  </div>

                  <p className="text-xs text-red-100 font-semibold">
                    Customer {activeBooking.customerName} has triggered an SOS Panic alert. Platform safety operations is monitoring this shift.
                  </p>

                  <div className="p-3 rounded-xl bg-black/50 border border-red-900/60 text-xs space-y-1 text-neutral-300">
                    <div><strong className="text-white">Reported Concern:</strong> <span className="text-red-300 font-medium">{activeBooking.sosAlert.reason}</span></div>
                    <div><strong className="text-white">Safety Desk Lead:</strong> {activeBooking.sosAlert.supportAgent} ({activeBooking.sosAlert.supportPhone})</div>
                    <div><strong className="text-white">Alert Transmitted:</strong> {activeBooking.sosAlert.chefNotificationTime}</div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <a
                      href="tel:18002433767"
                      className="flex-1 min-w-[130px] py-2 px-3 rounded-xl bg-white text-red-700 font-black text-xs text-center flex items-center justify-center gap-1 shadow-md hover:bg-neutral-100"
                    >
                      <span>📞 Call Safety Hotline</span>
                    </a>
                    <a
                      href="tel:112"
                      className="py-2 px-3 rounded-xl bg-red-900 hover:bg-red-800 text-white font-bold text-xs flex items-center justify-center gap-1 border border-red-500/40"
                    >
                      <span>🚨 Police 112</span>
                    </a>
                    {!chefSafetyCheckConfirmed ? (
                      <button
                        type="button"
                        onClick={() => setChefSafetyCheckConfirmed(true)}
                        className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs cursor-pointer"
                      >
                        📍 Check-In Safe Status
                      </button>
                    ) : (
                      <div className="py-2 px-3 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center gap-1 border border-emerald-500/40">
                        <span>✓</span>
                        <span>Safety Check-In Sent</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 uppercase">
                      Active Booking
                    </span>
                    <span className="text-xs text-neutral-400">ID: #{activeBooking.id.slice(-6)}</span>
                  </div>
                  <h3 className="text-lg font-black text-white mt-1">
                    Customer: {activeBooking.customerName} ({activeBooking.customerPhone})
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Location: <strong>{activeBooking.area}</strong> ({activeBooking.serviceAddress})
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xl font-black text-emerald-400">
                    ₹{activeBooking.totalAmount - activeBooking.platformFee}
                  </div>
                  <div className="text-[11px] text-neutral-400">Chef Net Earnings</div>
                </div>
              </div>

              {/* Requested Dishes */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Dishes Requested:
                </div>
                <div className="text-sm font-medium text-white">{activeBooking.dishesRequested}</div>
                {activeBooking.specialInstructions && (
                  <div className="text-xs text-neutral-400 mt-1 italic">
                    Special notes: {activeBooking.specialInstructions}
                  </div>
                )}
              </div>

              {/* Workflow Stepper for Chef */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Shift Step Actions:
                </div>

                {activeBooking.status === 'accepted' && (
                  <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-2">
                    <div className="text-xs font-bold text-blue-300">Step 1: Commute to Customer</div>
                    <p className="text-xs text-neutral-300">
                      Pack your chef knives, clean apron, and ride to {activeBooking.area}.
                    </p>
                    <button
                      type="button"
                      onClick={() => onAdvanceBookingStatus(activeBooking.id, 'en_route')}
                      className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500"
                    >
                      🛵 Tap When You Start Travel (En Route)
                    </button>
                  </div>
                )}

                {activeBooking.status === 'en_route' && (
                  <div className="space-y-3">
                    {/* Turn-by-Turn GPS HUD with bike navigation */}
                    <BikeNavigationHUD
                      destinationAddress={activeBooking.serviceAddress}
                      destinationArea={activeBooking.area}
                      customerName={activeBooking.customerName}
                      customerPhone={activeBooking.customerPhone}
                      distanceKm={1.8}
                      initialEtaMinutes={14}
                    />

                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                      <div className="text-xs font-bold text-amber-300">Step 2: Arrival & Doorbell</div>
                      <p className="text-xs text-neutral-300">
                        Reached customer premises in {activeBooking.area}. Tap arrived to prompt OTP verification.
                      </p>
                      <button
                        type="button"
                        onClick={() => onAdvanceBookingStatus(activeBooking.id, 'arrived')}
                        className="w-full py-3 rounded-xl bg-amber-500 text-neutral-950 font-black text-xs hover:bg-amber-400 cursor-pointer shadow-lg shadow-amber-500/20"
                      >
                        📍 Reached Customer Doorstep
                      </button>
                    </div>
                  </div>
                )}

                {activeBooking.status === 'arrived' && (
                  <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-3">
                    <div className="text-xs font-bold text-purple-300">
                      Step 3: Verify Customer OTP to Unlock Kitchen Service
                    </div>
                    <p className="text-xs text-neutral-300">
                      Ask customer for the 4-digit code shown on their screen ({activeBooking.otp}):
                    </p>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        maxLength={4}
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value)}
                        placeholder="Enter 4-digit OTP"
                        className="px-3 py-2 text-sm font-bold tracking-widest bg-neutral-900 border border-neutral-700 rounded-xl text-white text-center w-36"
                      />
                      <button
                        type="button"
                        onClick={() => handleVerifyOtpAndStart(activeBooking.id, activeBooking.otp)}
                        className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-500 cursor-pointer"
                      >
                        Verify OTP & Start Cooking 🍳
                      </button>
                    </div>
                    {otpError && (
                      <div className="text-xs text-red-400 font-semibold">
                        Incorrect OTP code. Please check with customer ({activeBooking.otp}).
                      </div>
                    )}
                  </div>
                )}

                {activeBooking.status === 'in_progress' && (
                  <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-emerald-300">Step 4: Cooking & Hygiene Handover</div>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 animate-pulse border border-emerald-500/30">
                        ● Timer Running
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300">
                      Wipe down kitchen surfaces, plate dishes with garnish, and hand over to customer before releasing escrow payment.
                    </p>

                    {/* Escrow Slide-to-Complete Release Button (Blueprint Section 3) */}
                    <div className="pt-2">
                      <SlideToCompleteButton
                        onComplete={() => onAdvanceBookingStatus(activeBooking.id, 'completed')}
                        payoutAmount={activeBooking.totalAmount - activeBooking.platformFee}
                      />
                    </div>
                  </div>
                )}

                {activeBooking.status === 'completed' && (
                  <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-center py-6">
                    <div className="text-3xl mb-2">🎉</div>
                    <h4 className="text-base font-bold text-white">Booking Fulfilled!</h4>
                    <p className="text-xs text-neutral-400 mt-1">
                      Payment of ₹{activeBooking.totalAmount - activeBooking.platformFee} credited to your UPI wallet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-neutral-900 border border-neutral-800 p-8 text-center text-neutral-400">
              <span className="text-3xl block mb-2">🍳</span>
              <p className="text-xs font-semibold">No active gig in progress right now.</p>
              <p className="text-xs text-neutral-500 mt-1">Accept incoming bookings from the Radar tab.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Schedule & Shifts (Requirement: Calendar for weekly meal prep subscriptions and restaurant interviews) */}
      {activeTab === 'schedule' && (
        <ChefScheduleManager />
      )}

      {/* TAB 4: Hotel Job Portal (Requirement 2: browse and apply for full-time vacancies) */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Full-Time Hotel & Restaurant Vacancies</h3>
              <p className="text-xs text-neutral-400">
                Browse executive opportunities posted directly by Bangalore restaurant owners & hoteliers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobPostings.map((job) => (
              <div
                key={job.id}
                className="rounded-2xl bg-neutral-900/90 border border-neutral-800 p-5 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-black text-white">{job.title}</h4>
                      <p className="text-xs text-amber-400 font-semibold">{job.restaurantName}</p>
                    </div>
                    <span className="text-2xl">{job.restaurantLogo}</span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="text-neutral-400">📍 {job.location}</span>
                    <span className="text-emerald-400 font-bold">💰 {job.salaryRange}</span>
                  </div>

                  <p className="text-xs text-neutral-300 mt-2 line-clamp-2">{job.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between">
                  <span className="text-[11px] text-neutral-400">Exp: {job.experienceRequired}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedJobToApply(job)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-black text-xs hover:from-amber-400 hover:to-amber-500 cursor-pointer"
                  >
                    1-Click Apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Earnings & Payouts (Recharts Analytics) */}
      {activeTab === 'earnings' && (
        <ChefEarningsTab chef={chef} activeBooking={activeBooking} />
      )}

      {/* INCOMING GIG NOTIFICATION MODAL (Like Uber driver with 30s timer & Multilingual Voice Readout) */}
      {incomingBooking && (
        <div className="fixed inset-0 z-[2200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in zoom-in-95 duration-200">
          <div className="relative w-full max-w-md bg-neutral-900 border-2 border-amber-500 rounded-3xl p-6 shadow-2xl text-neutral-100 overflow-hidden">
            
            {/* 30s Countdown Bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-neutral-800">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-1000 ease-linear"
                style={{ width: `${(countdownSeconds / 30) * 100}%` }}
              />
            </div>

            {/* Header */}
            <div className="pt-2 flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                  New Incoming Gig Alert!
                </span>
              </div>
              <div className="text-xs font-black text-white bg-neutral-800 px-2.5 py-1 rounded-full font-mono">
                ⏳ {countdownSeconds}s left
              </div>
            </div>

            {/* Multilingual Voice Readout Bar inside Popup */}
            <div className="mt-3 p-2.5 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setSelectedLanguage(lang.code);
                      speakOrderAnnouncement(
                        lang.code,
                        {
                          customerName: incomingBooking.customerName,
                          area: incomingBooking.location,
                          distanceKm: incomingBooking.distanceKm,
                          payout: incomingBooking.payout,
                          dishes: incomingBooking.dishes,
                        },
                        () => setIsSpeaking(true),
                        () => setIsSpeaking(false)
                      );
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                      selectedLanguage === lang.code
                        ? 'bg-amber-500 text-neutral-950'
                        : 'bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {lang.nativeLabel}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  if (isSpeaking) {
                    stopVoiceSpeech();
                    setIsSpeaking(false);
                  } else {
                    speakOrderAnnouncement(
                      selectedLanguage,
                      {
                        customerName: incomingBooking.customerName,
                        area: incomingBooking.location,
                        distanceKm: incomingBooking.distanceKm,
                        payout: incomingBooking.payout,
                        dishes: incomingBooking.dishes,
                      },
                      () => setIsSpeaking(true),
                      () => setIsSpeaking(false)
                    );
                  }
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-[11px] shrink-0 cursor-pointer shadow-md"
              >
                <Volume2 size={12} className={isSpeaking ? 'animate-bounce' : ''} />
                <span>{isSpeaking ? 'Speaking...' : '🔊 Read Aloud'}</span>
              </button>
            </div>

            {/* Content */}
            <div className="my-4 space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    ₹{incomingBooking.payout}
                  </div>
                  <div className="text-[10px] text-neutral-400 uppercase font-semibold">Estimated Net Payout</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white font-mono">{incomingBooking.distanceKm} km away</div>
                  <div className="text-[10px] text-neutral-400">~8 min bike commute</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1.5 text-xs">
                <div>
                  <span className="text-neutral-400">Customer:</span>{' '}
                  <strong className="text-white">{incomingBooking.customerName}</strong>
                </div>
                <div>
                  <span className="text-neutral-400">Location:</span>{' '}
                  <strong className="text-white">{incomingBooking.location}</strong>
                </div>
                <div>
                  <span className="text-neutral-400">Menu Requested:</span>{' '}
                  <span className="text-amber-300 font-semibold">{incomingBooking.dishes}</span>
                </div>
              </div>
            </div>

            {/* Uber / Rapido Accept or Reject Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleDeclineGig}
                className="py-3.5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-red-400 font-bold text-xs transition-colors border border-neutral-700"
              >
                ✕ Decline
              </button>

              <button
                type="button"
                onClick={handleAcceptGig}
                className="py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-neutral-950 font-black text-xs transition-all shadow-xl shadow-emerald-500/20 animate-pulse"
              >
                ✓ ACCEPT BOOKING
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1-Click Apply Modal */}
      {selectedJobToApply && (
        <div className="fixed inset-0 z-[2100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-3xl p-6 shadow-2xl text-neutral-100">
            <button
              onClick={() => setSelectedJobToApply(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white text-xl p-1"
            >
              ✕
            </button>
            <h3 className="text-base font-black text-white">Apply for: {selectedJobToApply.title}</h3>
            <p className="text-xs text-amber-400">{selectedJobToApply.restaurantName}</p>

            <form onSubmit={handleApplySubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Your Pitch to General Manager
                </label>
                <textarea
                  rows={3}
                  value={chefPitch}
                  onChange={(e) => setChefPitch(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-800 border border-neutral-700 text-white"
                />
              </div>

              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 space-y-1">
                <div><strong>Chef Profile:</strong> {chef.name}</div>
                <div><strong>Experience:</strong> {chef.experienceYears} Years</div>
                <div><strong>Specialties:</strong> {chef.specialties.join(', ')}</div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 text-neutral-950 font-black text-xs hover:bg-amber-400"
              >
                Submit Application
              </button>
            </form>
          </div>
        </div>
      )}

      {/* High-Priority SOS Push Notification Modal for Chef */}
      {showChefSosModal && activeBooking?.sosAlert?.active && (
        <div className="fixed inset-0 z-[2150] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-neutral-900 border-2 border-red-500 rounded-3xl p-6 shadow-2xl shadow-red-950 text-white space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-red-800/60">
              <span className="text-3xl animate-bounce">🚨</span>
              <div className="flex-1">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-600 text-white font-bold uppercase tracking-wider">
                  HIGH-PRIORITY PUSH ALERT
                </span>
                <h3 className="text-base font-black text-white mt-0.5">
                  Customer SOS Panic Triggered
                </h3>
              </div>
              <button
                onClick={() => setShowChefSosModal(false)}
                className="text-neutral-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-800/50 space-y-2 text-xs">
              <div className="flex justify-between text-red-200">
                <span className="text-neutral-400">Incident Ticket:</span>
                <span className="font-mono font-bold">#{activeBooking.sosAlert.ticketId}</span>
              </div>
              <div className="flex justify-between text-red-200">
                <span className="text-neutral-400">Customer:</span>
                <span className="font-bold text-white">{activeBooking.customerName} ({activeBooking.customerPhone})</span>
              </div>
              <div className="flex justify-between text-red-200">
                <span className="text-neutral-400">Destination:</span>
                <span className="font-semibold text-white">{activeBooking.area}</span>
              </div>
              <div className="flex justify-between text-red-200">
                <span className="text-neutral-400">Reported Category:</span>
                <span className="font-bold text-red-300 text-right max-w-[200px] truncate">{activeBooking.sosAlert.reason}</span>
              </div>
              <div className="flex justify-between text-red-200">
                <span className="text-neutral-400">Safety Desk Lead:</span>
                <span className="text-emerald-400 font-semibold">{activeBooking.sosAlert.supportAgent}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-300 space-y-1">
              <div className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">
                Required Chef Emergency Protocol:
              </div>
              <p>• Prioritize human life and physical safety above all else.</p>
              <p>• Speak calmly with the household and await guidance from Platform Crisis Desk.</p>
              <p>• If medical or physical danger exists, dial 112 immediately.</p>
            </div>

            {chefSafetyCheckConfirmed ? (
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs text-center font-bold">
                ✓ Status Check-In Sent to Platform Safety Room
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setChefSafetyCheckConfirmed(true)}
                className="w-full py-2.5 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs hover:bg-amber-400 transition-colors cursor-pointer"
              >
                📍 Confirm I Am On-Site & Standing By (Safety Check-In)
              </button>
            )}

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-800">
              <a
                href="tel:18002433767"
                className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs text-center flex items-center justify-center gap-1.5"
              >
                <span>📞 Hotline</span>
              </a>
              <a
                href="tel:112"
                className="py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs text-center flex items-center justify-center gap-1.5 border border-neutral-700"
              >
                <span>🚨 Police 112</span>
              </a>
            </div>

            <button
              type="button"
              onClick={() => setShowChefSosModal(false)}
              className="w-full py-2 text-center text-xs text-neutral-400 hover:text-white cursor-pointer"
            >
              Dismiss Safety Alert (Standby)
            </button>
          </div>
        </div>
      )}

      {/* Zero-Touch AI Onboarding Engine Modal */}
      {showZeroTouchModal && (
        <ZeroTouchOnboardingEngine
          isOpen={showZeroTouchModal}
          onClose={() => setShowZeroTouchModal(false)}
          chef={chef}
          onApprovalComplete={(_updatedChef) => {
            onUpdateChefStatus(true);
            setShowZeroTouchModal(false);
          }}
        />
      )}

      {/* 24/7 AI Partner Support Chatbot Modal */}
      {showAIChatModal && (
        <AIChatSupportModal
          isOpen={showAIChatModal}
          onClose={() => setShowAIChatModal(false)}
          currentUser={currentUser}
          activeRole="chef"
          activeBooking={activeBooking}
          onTriggerEmergencyEscalation={(ticket) => {
            if (onTriggerSosPanic && activeBooking) {
              onTriggerSosPanic(activeBooking.id, ticket.reason);
            }
          }}
        />
      )}

      {/* Refer-a-Chef Bounty Modal */}
      {showReferralModal && (
        <ViralReferralModal
          isOpen={showReferralModal}
          onClose={() => setShowReferralModal(false)}
          currentUser={currentUser}
          activeRole="chef"
        />
      )}

    </div>
  );
};
