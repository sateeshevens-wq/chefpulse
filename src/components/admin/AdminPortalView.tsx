import React, { useState } from 'react';
import { Chef, Booking, JobPosting, CateringInquiry, EmergencyEscalationTicket, AutomatedDisputeResolution } from '../../types';
import { SURGE_PRESETS, SurgeTriggerType } from '../../utils/surgePricing';
import { BangaloreMap } from '../map/BangaloreMap';
import {
  ShieldCheck,
  DollarSign,
  TrendingUp,
  FileCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  CloudRain,
  Flame,
  Moon,
  Sun,
  Eye,
  Lock,
  ArrowUpRight,
  Sparkles,
  MapPin,
  Users,
  Briefcase,
  Sliders,
  RefreshCw,
  RotateCcw,
  AlertOctagon,
  Calendar,
  Layers,
  Activity,
  Zap,
  Clock,
  ExternalLink,
  ChevronRight,
  Search,
  Check,
  Radio,
  SlidersHorizontal,
  Bot,
  Phone,
  ShieldAlert,
  Navigation,
  Headphones,
} from 'lucide-react';

interface AdminPortalViewProps {
  chefs: Chef[];
  activeBooking?: Booking | null;
  currentSurge: SurgeTriggerType;
  onUpdateSurge: (surge: SurgeTriggerType) => void;
  jobPostings?: JobPosting[];
  cateringInquiries?: CateringInquiry[];
  onApproveJobPosting?: (jobId: string) => void;
  onRejectJobPosting?: (jobId: string) => void;
  onAssignCateringCrew?: (inquiryId: string, crewName: string) => void;
  onApproveChef?: (chefId: string) => void;
  onRejectChef?: (chefId: string) => void;
  onSuspendChef?: (chefId: string, reason: string) => void;
  onReinstateChef?: (chefId: string) => void;
  emergencyTickets?: EmergencyEscalationTicket[];
  onResolveEmergencyTicket?: (ticketId: string) => void;
  onDispatchSafetyUnit?: (ticketId: string) => void;
  automatedDisputes?: AutomatedDisputeResolution[];
}

interface PendingChefApplicant {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  area: string;
  experienceYears: number;
  specialties: string[];
  signatureDishes: string[];
  documents: {
    idCard: { type: 'Aadhaar' | 'PAN' | 'Passport'; number: string; verified: boolean; frontUrl?: string; backUrl?: string };
    fssai: { license: string; validTill: string; status: 'valid' | 'pending'; category: string };
    policeClearance: { status: 'passed' | 'pending' | 'flagged'; crimeRecordClear: boolean; jurisdiction: string; ref: string };
    culinaryDegree: { institution: string; year: string; verified: boolean };
  };
  reviewStatus: 'pending_review' | 'approved' | 'rejected';
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({
  chefs,
  activeBooking,
  currentSurge,
  onUpdateSurge,
  jobPostings = [],
  cateringInquiries = [],
  onApproveJobPosting,
  onRejectJobPosting,
  onAssignCateringCrew,
  onApproveChef,
  onRejectChef,
  onSuspendChef,
  onReinstateChef,
  emergencyTickets = [],
  onResolveEmergencyTicket,
  onDispatchSafetyUnit,
  automatedDisputes = [],
}) => {
  // Navigation Tabs: Financial, God Mode, User Mgmt, Moderation, Settings, AI Support Desk
  const [activeTab, setActiveTab] = useState<'financial' | 'god_mode' | 'users' | 'moderation' | 'settings' | 'ai_support'>('financial');

  // Financial & Escrow State
  const [escrowLedger, setEscrowLedger] = useState([
    {
      id: 'ESC-9101',
      bookingId: 'book-801',
      customerName: 'Rahul & Tanya Verma',
      customerPhone: '+91 98450 91234',
      customerArea: '100ft Road, Indiranagar',
      chefName: 'Chef Rajesh Sharma',
      amount: 1450,
      platformFee: 49,
      escrowState: activeBooking ? (activeBooking.status === 'completed' ? 'RELEASED' : 'HELD_IN_VAULT') : 'HELD_IN_VAULT',
      stage: activeBooking ? activeBooking.status : 'in_progress',
      dishes: 'Royal Butter Chicken & Garlic Naan',
      time: '18 mins ago',
      disputed: false,
    },
    {
      id: 'ESC-9102',
      bookingId: 'book-802',
      customerName: 'Priya Sundaram',
      customerPhone: '+91 99002 88123',
      customerArea: 'Koramangala 4th Block',
      chefName: 'Chef Anita Deshmukh',
      amount: 2200,
      platformFee: 49,
      escrowState: 'HELD_IN_VAULT',
      stage: 'en_route',
      dishes: 'Mangalorean Prawn Ghee Roast & Neer Dosa',
      time: '34 mins ago',
      disputed: false,
    },
    {
      id: 'ESC-9103',
      bookingId: 'book-803',
      customerName: 'Anand Kulkarni',
      customerPhone: '+91 98441 55670',
      customerArea: 'HSR Layout Sector 2',
      chefName: 'Chef Vikramaditya Rao',
      amount: 1850,
      platformFee: 49,
      escrowState: 'RELEASED',
      stage: 'completed',
      dishes: 'Hyderabadi Zafrani Dum Biryani',
      time: '2 hours ago',
      disputed: false,
    },
    {
      id: 'ESC-9104',
      bookingId: 'book-804',
      customerName: 'Devika Singhania',
      customerPhone: '+91 97410 22901',
      customerArea: 'Lavelle Road',
      chefName: 'Chef Marcus Fernandez',
      amount: 3200,
      platformFee: 49,
      escrowState: 'RELEASED',
      stage: 'completed',
      dishes: 'Handmade Truffle Fettuccine & Tiramisu',
      time: '4 hours ago',
      disputed: false,
    },
  ]);

  const [batchPayoutMessage, setBatchPayoutMessage] = useState<string | null>(null);
  const [refundAlert, setRefundAlert] = useState<string | null>(null);

  // Dynamic Variable Settings
  const [matchingRadiusKm, setMatchingRadiusKm] = useState<number>(5);
  const [trafficOverrideActive, setTrafficOverrideActive] = useState<boolean>(false);
  const [platformFeeFixed, setPlatformFeeFixed] = useState<number>(49);
  const [chefSharePercent, setChefSharePercent] = useState<number>(85);
  const [autoSurgeEnabled, setAutoSurgeEnabled] = useState<boolean>(true);
  const [demandSupplyRatio, setDemandSupplyRatio] = useState<number>(1.85);

  // Geofence Surges Across Bangalore
  const [geofenceSurges, setGeofenceSurges] = useState<Record<string, number>>({
    Koramangala: 1.5,
    Indiranagar: 1.35,
    'HSR Layout': 1.25,
    Whitefield: 1.6,
    'CBD / Lavelle Road': 1.4,
    'Jayanagar / JP Nagar': 1.2,
  });

  // User Management State
  const [userMgmtSubTab, setUserMgmtSubTab] = useState<'onboarding_queue' | 'suspension_hub'>('onboarding_queue');
  const [applicantQueue, setApplicantQueue] = useState<PendingChefApplicant[]>([
    {
      id: 'chef-app-01',
      name: 'Chef Suresh Rao',
      phone: '+91 98451 44521',
      avatar: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&w=300&q=80',
      area: 'Koramangala 5th Block, Bengaluru',
      experienceYears: 12,
      specialties: ['South Indian / Coastal', 'Tandoor & Kebabs'],
      signatureDishes: ['Kundapura Ghee Roast', 'Mangalore Anjal Fry', 'Appam & Stew'],
      documents: {
        idCard: {
          type: 'Aadhaar',
          number: 'XXXX-XXXX-4819',
          verified: true,
          frontUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=300&q=80',
          backUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=300&q=80',
        },
        fssai: { license: 'FSSAI-11223344556677', validTill: '2028-12-31', status: 'valid', category: 'Central FoSCoS Category 16' },
        policeClearance: { status: 'passed', crimeRecordClear: true, jurisdiction: 'Karnataka Police CCTNS Indiranagar Div', ref: 'PCC-KA-2026-9901' },
        culinaryDegree: { institution: 'Welcomgroup Graduate School (Manipal)', year: '2014', verified: true },
      },
      reviewStatus: 'pending_review',
    },
    {
      id: 'chef-app-02',
      name: 'Chef Meenakshi Sundaram',
      phone: '+91 98452 77123',
      avatar: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?auto=format&fit=crop&w=300&q=80',
      area: 'Sadashivanagar, Bengaluru',
      experienceYears: 9,
      specialties: ['Healthy / Diet / Keto', 'Continental & Italian'],
      signatureDishes: ['Truffle Quinoa Risotto', 'Herb Crusted Salmon', 'Sugar-Free Avocado Mousse'],
      documents: {
        idCard: {
          type: 'Aadhaar',
          number: 'XXXX-XXXX-8902',
          verified: true,
          frontUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=300&q=80',
          backUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=300&q=80',
        },
        fssai: { license: 'FSSAI-99887766554433', validTill: '2027-08-15', status: 'valid', category: 'FSSAI FoSCoS State Licensed' },
        policeClearance: { status: 'passed', crimeRecordClear: true, jurisdiction: 'Sadashivanagar Police Station', ref: 'PCC-KA-2026-7844' },
        culinaryDegree: { institution: 'IHM Bangalore Diploma in Culinary Arts', year: '2017', verified: true },
      },
      reviewStatus: 'pending_review',
    },
    {
      id: 'chef-app-03',
      name: 'Chef Farhan Qureshi',
      phone: '+91 97410 99281',
      avatar: 'https://images.unsplash.com/photo-1581299894007-aaa50297cf16?auto=format&fit=crop&w=300&q=80',
      area: 'Frazer Town, Bengaluru',
      experienceYears: 14,
      specialties: ['North Indian / Mughlai', 'Awadhi Banquet'],
      signatureDishes: ['Galouti Kebab', 'Nihari Gosht', 'Sheermal'],
      documents: {
        idCard: {
          type: 'Aadhaar',
          number: 'XXXX-XXXX-1144',
          verified: true,
        },
        fssai: { license: 'FSSAI-22334411223344', validTill: '2029-05-20', status: 'valid', category: 'Central Commercial Catering License' },
        policeClearance: { status: 'passed', crimeRecordClear: true, jurisdiction: 'Pulakeshinagar Police Station', ref: 'PCC-KA-2026-4412' },
        culinaryDegree: { institution: 'Ex-Sous Chef Dum Pukht (ITC Windsor)', year: '2012', verified: true },
      },
      reviewStatus: 'pending_review',
    },
  ]);

  const [selectedApplicant, setSelectedApplicant] = useState<PendingChefApplicant | null>(null);

  // Suspension Hub Items (Below 3.5 stars or triggered SOS)
  const [flaggedAccounts, setFlaggedAccounts] = useState([
    {
      id: 'flag-01',
      targetType: 'chef' as const,
      name: 'Chef Alok Nambiar',
      phone: '+91 98450 12891',
      area: 'Koramangala 1st Block',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      rating: 3.2,
      triggerType: 'LOW_RATING_THRESHOLD' as const,
      reason: 'Average rating 3.2★ has dropped below the platform 3.5★ safety limit (Feedback tags: Delayed Arrival, Untidy Prep Counter)',
      status: 'SUSPENDED' as const,
      flaggedAt: '2026-10-12',
    },
    {
      id: 'flag-02',
      targetType: 'chef' as const,
      name: 'Chef Deepak Verma',
      phone: '+91 97412 88910',
      area: 'Indiranagar 12th Main',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      rating: 3.4,
      triggerType: 'LOW_RATING_THRESHOLD' as const,
      reason: 'Rating dropped to 3.4★ across last 8 gigs. Quality warnings dispatched.',
      status: 'UNDER_REVIEW' as const,
      flaggedAt: '2026-10-11',
    },
    {
      id: 'flag-03',
      targetType: 'customer' as const,
      name: 'Vikas Aggarwal (Host)',
      phone: '+91 98451 90812',
      area: 'Bellandur Green Glen Layout',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      rating: 2.8,
      triggerType: 'SOS_PANIC_ALERT' as const,
      reason: 'Chef triggered SOS Panic: Host insisted on cooking beyond agreed 6-hour shift and behaved aggressively.',
      status: 'SUSPENDED' as const,
      flaggedAt: '2026-10-13',
    },
  ]);

  // Moderation State: Option 2 (Catering) Inquiries & Option 3 (B2B) Vacancies
  const [moderationTab, setModerationTab] = useState<'catering' | 'b2b_jobs'>('catering');
  const [cateringInquiryList, setCateringInquiryList] = useState<CateringInquiry[]>(
    cateringInquiries.length > 0
      ? cateringInquiries
      : [
          {
            id: 'cat-inq-01',
            customerName: 'Aakash & Devika',
            customerPhone: '+91 98450 99882',
            customerEmail: 'aakash.devika@gmail.com',
            eventDate: '2026-11-18',
            eventTime: '7:30 PM Onwards',
            eventType: 'Cocktail Party',
            guestCount: 65,
            budgetPerPlate: 2200,
            totalBudgetEstimate: 143000,
            preferredCuisines: ['Continental & Italian', 'Pan-Asian & Dimsum', 'Tandoor & Kebabs'],
            liveCountersNeeded: ['Mobile Woodfire Pizza', 'Dimsum Steamer Tower', 'Sigri Grill'],
            dietaryPreferences: ['50% Vegetarian', 'No Beef / Pork', 'Gluten-free options needed'],
            venueLocation: 'Private Villa, Sadashivanagar, Bengaluru',
            additionalNotes: 'Need 4 uniformed servers, 2 lead chefs, and bar-tending ice setup.',
            status: 'under_review',
            createdAt: '2026-10-10',
          },
          {
            id: 'cat-inq-02',
            customerName: 'Dr. Ramesh Narayan',
            customerPhone: '+91 98440 33119',
            customerEmail: 'ramesh.narayan@aiims.edu',
            eventDate: '2026-12-05',
            eventTime: '12:00 PM (Lunch)',
            eventType: 'Wedding / Sangeet',
            guestCount: 150,
            budgetPerPlate: 1450,
            totalBudgetEstimate: 217500,
            preferredCuisines: ['South Indian / Coastal', 'Healthy / Diet / Keto'],
            liveCountersNeeded: ['Live Appam & Stew Bar', 'Filter Coffee Counter', 'Tender Coconut Payasam'],
            dietaryPreferences: ['Strictly Vegetarian', 'No Onion / Garlic for elderly guests'],
            venueLocation: 'Palace Grounds (Sheesh Mahal), Bengaluru',
            additionalNotes: 'Traditional banana leaf sit-down arrangement required.',
            status: 'submitted',
            createdAt: '2026-10-12',
          },
        ]
  );

  const [assignedCrewMap, setAssignedCrewMap] = useState<Record<string, string>>({
    'cat-inq-01': 'Artisan Woodfire & Dimsum Crew (Lead: Chef Marco)',
  });

  const [jobVacanciesList, setJobVacanciesList] = useState<JobPosting[]>(
    jobPostings.length > 0
      ? jobPostings.map((j) => ({ ...j, status: j.status || 'pending_approval' }))
      : [
          {
            id: 'job-101',
            title: 'Senior Tandoor & Grill Master',
            restaurantName: 'Toit Brewpub & Kitchen',
            restaurantLogo: '🍺',
            location: '100ft Road, Indiranagar, Bengaluru',
            type: 'Full-time',
            experienceRequired: '4 - 7 years high-volume live kitchen',
            salaryRange: '₹45,000 - ₹60,000 / month + Tips',
            cuisineCategory: 'Tandoor & Woodfire Grills',
            description: 'Lead the high-volume tandoor station during Friday & Saturday night microbrewery covers. Marinade crafting, smoke balancing, and hygiene protocols.',
            requirements: ['High physical stamina', 'Must hold valid FSSAI food handler certificate', 'Proficiency in seekh and tikkas'],
            benefits: ['Duty meals included', 'ESIC + Medical insurance', 'Weekly performance bonuses'],
            postedDate: 'Today',
            applicantsCount: 14,
            status: 'pending_approval',
          },
          {
            id: 'job-102',
            title: 'Executive Sous Chef (Continental & Italian)',
            restaurantName: 'Smoke House Deli',
            restaurantLogo: '🍝',
            location: 'Lavelle Road, Central Bengaluru',
            type: 'Head Chef Track',
            experienceRequired: '6 - 10 years in upscale casual dining',
            salaryRange: '₹65,000 - ₹85,000 / month',
            cuisineCategory: 'Modern European & Artisanal Pastas',
            description: 'Oversee daily kitchen line operations, food plating consistency, inventory wastage minimization, and chef brigade training.',
            requirements: ['Culinary degree or equivalent diploma', 'Expertise in pasta dough rolling and emulsion sauces', 'Experience managing 10+ line cooks'],
            benefits: ['Competitive corporate pay', 'PF + Medical', 'Paid annual leaves'],
            postedDate: '1 day ago',
            applicantsCount: 9,
            status: 'approved',
          },
        ]
  );

  // Financial Calculations
  const totalGMV = 482500;
  const collectedPlatformFees = escrowLedger.length * platformFeeFixed + 14200;
  const activeEscrowVault = escrowLedger
    .filter((e) => e.escrowState === 'HELD_IN_VAULT')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalDispatchedPayouts = 392400;

  // Handlers for User Management
  const handleApproveApplicant = (id: string) => {
    setApplicantQueue((prev) =>
      prev.map((a) => (a.id === id ? { ...a, reviewStatus: 'approved' } : a))
    );
    if (onApproveChef) onApproveChef(id);
  };

  const handleRejectApplicant = (id: string) => {
    setApplicantQueue((prev) =>
      prev.map((a) => (a.id === id ? { ...a, reviewStatus: 'rejected' } : a))
    );
    if (onRejectChef) onRejectChef(id);
  };

  const handleReinstateAccount = (flagId: string, name: string) => {
    setFlaggedAccounts((prev) => prev.filter((f) => f.id !== flagId));
    setRefundAlert(`Account for ${name} has been reinstated to active standing.`);
    setTimeout(() => setRefundAlert(null), 3000);
  };

  const handleSuspendAccount = (flagId: string) => {
    setFlaggedAccounts((prev) =>
      prev.map((f) => (f.id === flagId ? { ...f, status: 'SUSPENDED' } : f))
    );
  };

  // Handlers for Moderation
  const handleAssignCrew = (inquiryId: string, crewName: string) => {
    setAssignedCrewMap((prev) => ({ ...prev, [inquiryId]: crewName }));
    setCateringInquiryList((prev) =>
      prev.map((inq) => (inq.id === inquiryId ? { ...inq, status: 'proposal_sent' } : inq))
    );
    if (onAssignCateringCrew) onAssignCateringCrew(inquiryId, crewName);
  };

  const handleApproveJobVacancy = (jobId: string) => {
    setJobVacanciesList((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: 'approved' } : j))
    );
    if (onApproveJobPosting) onApproveJobPosting(jobId);
  };

  const handleRejectJobVacancy = (jobId: string) => {
    setJobVacanciesList((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: 'rejected' } : j))
    );
    if (onRejectJobPosting) onRejectJobPosting(jobId);
  };

  // Handlers for Financials
  const handleBatchProcessPayouts = () => {
    setEscrowLedger((prev) =>
      prev.map((e) =>
        e.stage === 'completed' && e.escrowState === 'HELD_IN_VAULT'
          ? { ...e, escrowState: 'RELEASED' }
          : e
      )
    );
    setBatchPayoutMessage(
      'Batch Payout Dispatched: ₹' +
        activeEscrowVault.toLocaleString('en-IN') +
        ' transferred to 4 Chef UPI handles via Razorpay Route & ICICI NEFT stack.'
    );
    setTimeout(() => setBatchPayoutMessage(null), 4000);
  };

  const handle1ClickRefund = (ledgerId: string, customerName: string, amount: number) => {
    setEscrowLedger((prev) =>
      prev.map((e) =>
        e.id === ledgerId ? { ...e, escrowState: 'REFUNDED_TO_CUSTOMER', disputed: true } : e
      )
    );
    setRefundAlert(`Dispute Resolved: Full refund of ₹${amount} initiated to ${customerName} (Txn Ref: RFD-${Date.now().toString().slice(-6)})`);
    setTimeout(() => setRefundAlert(null), 4000);
  };

  const handleManualRelease = (ledgerId: string) => {
    setEscrowLedger((prev) =>
      prev.map((e) => (e.id === ledgerId ? { ...e, escrowState: 'RELEASED', stage: 'completed' } : e))
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="rounded-3xl bg-neutral-900 border border-neutral-800 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-mono font-bold border border-amber-500/30 uppercase tracking-wider">
              Admin & Operations Room
            </span>
            <span className="text-xs text-neutral-400">Bangalore Central Command Desk</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1.5 flex items-center gap-2">
            <span>Chef Pulse Operations Dashboard</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Full marketplace oversight: Revenue & Escrow, God Mode Map, User Moderation & Dynamic Surge Geofencing.
          </p>
        </div>

        {/* Global Key Metrics Pills */}
        <div className="flex flex-wrap items-center gap-2 bg-neutral-950 p-2.5 rounded-2xl border border-neutral-800 text-xs">
          <div className="text-right pr-3 border-r border-neutral-800">
            <div className="text-[10px] uppercase font-bold text-neutral-400">Escrow in Vault</div>
            <div className="text-sm font-black text-amber-400 font-mono">₹{activeEscrowVault.toLocaleString('en-IN')}</div>
          </div>
          <div className="text-right pr-3 border-r border-neutral-800">
            <div className="text-[10px] uppercase font-bold text-neutral-400">Active Surge</div>
            <div className="text-sm font-black text-cyan-400 font-mono">
              {SURGE_PRESETS[currentSurge]?.badge || '1.0x'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-neutral-400">Demand/Supply</div>
            <div className={`text-sm font-black font-mono ${demandSupplyRatio > 1.5 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {demandSupplyRatio}x Ratio
            </div>
          </div>
        </div>
      </div>

      {/* Global Toast / Feedback Alerts */}
      {batchPayoutMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-400" />
            <span>{batchPayoutMessage}</span>
          </div>
          <button onClick={() => setBatchPayoutMessage(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {refundAlert && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs flex items-center justify-between animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-2">
            <RotateCcw size={16} className="text-amber-400" />
            <span>{refundAlert}</span>
          </div>
          <button onClick={() => setRefundAlert(null)} className="text-amber-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Primary Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-3 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('financial')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'financial'
              ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
              : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <DollarSign size={14} />
          <span>Revenue & Escrow Vault</span>
        </button>

        <button
          onClick={() => setActiveTab('god_mode')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'god_mode'
              ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
              : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Activity size={14} />
          <span>God Mode Operations Map</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'users'
              ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
              : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Users size={14} />
          <span>User & Provider Mgmt</span>
          {applicantQueue.filter((a) => a.reviewStatus === 'pending_review').length > 0 && (
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('moderation')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'moderation'
              ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
              : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Briefcase size={14} />
          <span>Catering & B2B Moderation</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'settings'
              ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
              : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <SlidersHorizontal size={14} />
          <span>Surge & System Variables</span>
        </button>

        <button
          onClick={() => setActiveTab('ai_support')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'ai_support'
              ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 font-black'
              : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <ShieldAlert size={14} className={emergencyTickets.filter(t => t.status !== 'RESOLVED').length > 0 ? "text-red-400 animate-pulse" : ""} />
          <span>24/7 AI Support & Safety Desk</span>
          {emergencyTickets.filter(t => t.status !== 'RESOLVED').length > 0 ? (
            <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-black animate-pulse">
              🚨 {emergencyTickets.filter(t => t.status !== 'RESOLVED').length} CRITICAL
            </span>
          ) : (
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
              Active
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: REVENUE & ESCROW MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          {/* Financial KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4">
              <div className="text-[11px] text-neutral-400 uppercase font-bold flex items-center justify-between">
                <span>Total GMV (Gross Value)</span>
                <TrendingUp size={14} className="text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono mt-1">₹{totalGMV.toLocaleString('en-IN')}</div>
              <div className="text-[10px] text-emerald-400 mt-1">▲ +24.8% vs last week across Bangalore</div>
            </div>

            <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4">
              <div className="text-[11px] text-neutral-400 uppercase font-bold flex items-center justify-between">
                <span>Platform & Safety Fees</span>
                <ShieldCheck size={14} className="text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-400 font-mono mt-1">₹{collectedPlatformFees.toLocaleString('en-IN')}</div>
              <div className="text-[10px] text-neutral-400 mt-1">Fixed ₹49/booking + 15% surge retention</div>
            </div>

            <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4">
              <div className="text-[11px] text-neutral-400 uppercase font-bold flex items-center justify-between">
                <span>Active Escrow in Vault</span>
                <Lock size={14} className="text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-cyan-400 font-mono mt-1">₹{activeEscrowVault.toLocaleString('en-IN')}</div>
              <div className="text-[10px] text-neutral-400 mt-1">Held until chef swipes "Job Completed"</div>
            </div>

            <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4">
              <div className="text-[11px] text-neutral-400 uppercase font-bold flex items-center justify-between">
                <span>Dispatched Chef Payouts</span>
                <CheckCircle size={14} className="text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-1">₹{totalDispatchedPayouts.toLocaleString('en-IN')}</div>
              <div className="text-[10px] text-neutral-400 mt-1">Cleared 100% via instant UPI & NEFT</div>
            </div>
          </div>

          {/* Action Bar: Batch Payouts & Dispute Resolution */}
          <div className="rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>⚡ Automated Escrow Payouts Engine</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                  Razorpay Route Active
                </span>
              </h3>
              <p className="text-neutral-400 mt-0.5">
                Customer payments are held 100% upfront in ChefPulse Escrow. Funds split automatically upon shift swipe.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleBatchProcessPayouts}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-neutral-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950 cursor-pointer"
              >
                <Zap size={13} />
                <span>Batch-Process Daily Payouts (UPI / NEFT)</span>
              </button>
            </div>
          </div>

          {/* Escrow Ledger & One-Click Refund Table */}
          <div className="rounded-3xl bg-neutral-900 border border-neutral-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Live Escrow & Booking Transaction Ledger</h3>
                <p className="text-xs text-neutral-400">
                  Monitor active bookings, release funds manually, or execute 1-click customer refunds for dispute resolution.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-300">
                <thead className="border-b border-neutral-800 text-[11px] font-bold uppercase text-neutral-400">
                  <tr>
                    <th className="pb-3">Ledger ID / Time</th>
                    <th className="pb-3">Customer & Location</th>
                    <th className="pb-3">Assigned Chef</th>
                    <th className="pb-3">Dishes Ordered</th>
                    <th className="pb-3">Escrow Value</th>
                    <th className="pb-3">Vault Status</th>
                    <th className="pb-3 text-right">Dispute Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 font-mono">
                  {escrowLedger.map((row) => (
                    <tr key={row.id} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="py-3.5 pr-2">
                        <div className="font-bold text-white">{row.id}</div>
                        <div className="text-[10px] text-neutral-500 font-sans">{row.time}</div>
                      </td>
                      <td className="py-3.5 pr-2 font-sans">
                        <div className="font-semibold text-white">{row.customerName}</div>
                        <div className="text-[10px] text-neutral-400">{row.customerArea}</div>
                      </td>
                      <td className="py-3.5 pr-2 font-sans">
                        <div className="font-semibold text-amber-400">{row.chefName}</div>
                      </td>
                      <td className="py-3.5 pr-2 font-sans text-neutral-300 max-w-[180px] truncate">
                        {row.dishes}
                      </td>
                      <td className="py-3.5 pr-2">
                        <div className="font-bold text-white">₹{row.amount}</div>
                        <div className="text-[10px] text-neutral-400 font-sans">
                          +₹{row.platformFee} Platform Fee
                        </div>
                      </td>
                      <td className="py-3.5 pr-2 font-sans">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            row.escrowState === 'RELEASED'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : row.escrowState === 'REFUNDED_TO_CUSTOMER'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 animate-pulse'
                          }`}
                        >
                          {row.escrowState}
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-sans space-x-1.5">
                        {row.escrowState === 'HELD_IN_VAULT' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleManualRelease(row.id)}
                              className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-[11px] font-bold cursor-pointer transition-all"
                              title="Release funds to chef wallet immediately"
                            >
                              Release Payout
                            </button>
                            <button
                              type="button"
                              onClick={() => handle1ClickRefund(row.id, row.customerName, row.amount)}
                              className="px-2.5 py-1 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 text-[11px] font-bold cursor-pointer transition-all"
                              title="1-Click Refund to Customer for dispute resolution"
                            >
                              1-Click Refund
                            </button>
                          </>
                        )}
                        {row.escrowState === 'RELEASED' && (
                          <span className="text-[11px] text-neutral-500">Fulfilled & Settled</span>
                        )}
                        {row.escrowState === 'REFUNDED_TO_CUSTOMER' && (
                          <span className="text-[11px] text-amber-400">Refund Credited</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: GOD MODE LIVE OPERATIONS MAP */}
      {/* ========================================================================= */}
      {activeTab === 'god_mode' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>🛰️ Bangalore City-Wide 'God Mode' Radar</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold">
                  Live GPS Polling
                </span>
              </h3>
              <p className="text-neutral-400 mt-0.5">
                Monitoring {chefs.filter((c) => c.isOnline).length} online chefs, active ride routes, and real-time surge clusters.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-neutral-400">Global Geofence Radius:</span>
              <span className="px-2 py-1 rounded-lg bg-neutral-800 text-amber-400 font-bold font-mono">
                {matchingRadiusKm} km
              </span>
            </div>
          </div>

          {/* Interactive Map Container */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-3xl overflow-hidden border border-neutral-800 h-[480px] relative shadow-2xl">
              <BangaloreMap
                chefs={chefs}
                userLocation={{
                  lat: 12.9716,
                  lng: 77.5946,
                  area: 'Central Bengaluru Operations Hub',
                }}
                radiusKm={matchingRadiusKm}
                selectedChef={chefs[0]}
                onSelectChef={() => {}}
                activeBookingChefId={activeBooking?.chefId}
              />

              {/* God Mode Overlays */}
              <div className="absolute top-4 left-4 z-[1000] p-3 rounded-2xl bg-neutral-950/90 border border-neutral-800 backdrop-blur-md text-xs space-y-1.5 shadow-xl max-w-xs">
                <div className="text-[10px] uppercase font-bold text-neutral-400">Live Active Surge Zones</div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-cyan-300">
                    <span>🌧️ Koramangala 4th-7th Block</span>
                    <strong className="font-mono">1.50x</strong>
                  </div>
                  <div className="flex items-center justify-between text-amber-300">
                    <span>⚡ Indiranagar 100ft Road</span>
                    <strong className="font-mono">1.35x</strong>
                  </div>
                  <div className="flex items-center justify-between text-purple-300">
                    <span>🌙 HSR Layout Sectors 1-4</span>
                    <strong className="font-mono">1.25x</strong>
                  </div>
                </div>
              </div>

              {/* Active SOS Indicator if present */}
              {activeBooking?.sosAlert?.active && (
                <div className="absolute top-4 right-4 z-[1000] p-3 rounded-2xl bg-red-950/90 border-2 border-red-500 text-white backdrop-blur-md text-xs shadow-2xl animate-bounce">
                  <div className="font-black text-red-200 flex items-center gap-1.5">
                    <span>🚨 LIVE SOS PANIC DETECTED</span>
                  </div>
                  <div className="text-[11px] text-red-200 mt-1 font-mono">
                    #{activeBooking.sosAlert.ticketId} • {activeBooking.area}
                  </div>
                </div>
              )}
            </div>

            {/* Live Operations Feed Sidebar */}
            <div className="space-y-3">
              <div className="p-4 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
                  <span>Live Shift Radar</span>
                  <span className="text-[10px] text-emerald-400">● Real-time</span>
                </h4>

                <div className="space-y-2.5 max-h-[390px] overflow-y-auto pr-1">
                  {chefs.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800/80 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={c.avatar}
                          alt={c.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0 border border-neutral-700"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-white truncate">{c.name}</div>
                          <div className="text-[10px] text-neutral-400 truncate">{c.currentLocation.area}</div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.isOnline
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-neutral-800 text-neutral-500'
                          }`}
                        >
                          {c.isOnline ? 'Online' : 'Offline'}
                        </span>
                        <div className="text-[10px] text-amber-400 font-mono mt-0.5">
                          ⭐ {c.rating.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: USER & PROVIDER MANAGEMENT (ONBOARDING & SUSPENSION HUB) */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Subtabs: Onboarding Queue vs Suspension Hub */}
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-2 text-xs">
            <button
              onClick={() => setUserMgmtSubTab('onboarding_queue')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                userMgmtSubTab === 'onboarding_queue'
                  ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white'
              }`}
            >
              <FileCheck size={13} />
              <span>Chef Onboarding Queue ({applicantQueue.filter((a) => a.reviewStatus === 'pending_review').length})</span>
            </button>

            <button
              onClick={() => setUserMgmtSubTab('suspension_hub')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                userMgmtSubTab === 'suspension_hub'
                  ? 'bg-red-600 text-white shadow-md shadow-red-950'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white'
              }`}
            >
              <AlertOctagon size={13} />
              <span>Suspension Hub ({flaggedAccounts.length})</span>
            </button>
          </div>

          {/* SUB-VIEW 1: ONBOARDING QUEUE */}
          {userMgmtSubTab === 'onboarding_queue' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4">
                <h3 className="text-sm font-bold text-white">Manual Document Verification Pipeline</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Review uploaded Aadhaar identity cards, FSSAI Food Safety licenses, and Karnataka Police background clearances.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {applicantQueue.map((app) => (
                  <div
                    key={app.id}
                    className="rounded-3xl bg-neutral-900 border border-neutral-800 p-5 space-y-4 shadow-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start gap-3">
                        <img
                          src={app.avatar}
                          alt={app.name}
                          className="w-12 h-12 rounded-2xl object-cover shrink-0 border border-neutral-700"
                        />
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-white truncate">{app.name}</h4>
                          <p className="text-xs text-amber-400 font-semibold">{app.experienceYears} Years Exp • {app.phone}</p>
                          <p className="text-[11px] text-neutral-400 truncate">{app.area}</p>
                        </div>
                      </div>

                      {/* Document Verification Checklist */}
                      <div className="mt-4 p-3 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs">
                        <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                          Document Checklist
                        </div>

                        {/* Aadhaar Check */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-emerald-400 font-bold">✓</span>
                            <span>Aadhaar:</span>
                          </div>
                          <span className="font-mono text-neutral-300 font-semibold">{app.documents.idCard.number}</span>
                        </div>

                        {/* FSSAI Check */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-emerald-400 font-bold">✓</span>
                            <span>FSSAI License:</span>
                          </div>
                          <span className="font-mono text-emerald-400 text-[11px]">Valid till {app.documents.fssai.validTill}</span>
                        </div>

                        {/* Police Clearance Check */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-emerald-400 font-bold">✓</span>
                            <span>Police CCTNS:</span>
                          </div>
                          <span className="font-mono text-neutral-300 text-[11px]">{app.documents.policeClearance.status === 'passed' ? 'Clear (PCC)' : 'Pending'}</span>
                        </div>
                      </div>

                      <div className="mt-3 text-xs text-neutral-300">
                        <span className="text-neutral-500">Culinary Track:</span>{' '}
                        <span>{app.documents.culinaryDegree.institution}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-neutral-800 flex items-center justify-between gap-2">
                      {app.reviewStatus === 'pending_review' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleRejectApplicant(app.id)}
                            className="flex-1 py-2 px-3 rounded-xl bg-neutral-800 hover:bg-red-950 text-neutral-300 hover:text-red-400 text-xs font-bold transition-all border border-neutral-700 cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApproveApplicant(app.id)}
                            className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-black transition-all shadow-md shadow-emerald-950 cursor-pointer"
                          >
                            Approve
                          </button>
                        </>
                      ) : (
                        <div className="w-full text-center py-1.5">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              app.reviewStatus === 'approved'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}
                          >
                            {app.reviewStatus === 'approved' ? '✓ Profile Approved & Active' : '✕ Application Rejected'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUB-VIEW 2: SUSPENSION HUB (RATINGS < 3.5 & SOS ALERTS) */}
          {userMgmtSubTab === 'suspension_hub' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-gradient-to-r from-red-950/40 via-neutral-900 to-neutral-900 border border-red-500/40 p-4">
                <div className="flex items-center gap-2">
                  <AlertOctagon size={18} className="text-red-400" />
                  <h3 className="text-sm font-bold text-white">Automated Safety & Suspension Hub</h3>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  Accounts flagged automatically by policy rules: Average rating drops below <strong>3.5★</strong> or participation in active <strong>SOS Panic alerts</strong>.
                </p>
              </div>

              <div className="space-y-3">
                {flaggedAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="p-4 rounded-3xl bg-neutral-900 border border-red-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={account.avatar}
                        alt={account.name}
                        className="w-12 h-12 rounded-2xl object-cover shrink-0 border border-neutral-700"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{account.name}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 uppercase font-mono">
                            {account.targetType}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              account.status === 'SUSPENDED'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            }`}
                          >
                            {account.status}
                          </span>
                        </div>

                        <div className="text-xs text-neutral-400 mt-1 flex items-center gap-3">
                          <span className="text-red-400 font-mono font-bold">⭐ {account.rating} / 5.0 Rating</span>
                          <span>•</span>
                          <span>{account.area}</span>
                          <span>•</span>
                          <span>Phone: {account.phone}</span>
                        </div>

                        <p className="text-xs text-red-300/90 mt-2 p-2.5 rounded-xl bg-red-950/40 border border-red-900/50">
                          {account.reason}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row md:flex-col items-center md:items-end gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleReinstateAccount(account.id, account.name)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs transition-all shadow-md cursor-pointer"
                      >
                        Reinstate Account
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSuspendAccount(account.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-red-900 text-neutral-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        Mandatory Audit Notice
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: JOB & INQUIRY MODERATION (CATERING & B2B) */}
      {/* ========================================================================= */}
      {activeTab === 'moderation' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-2 text-xs">
            <button
              onClick={() => setModerationTab('catering')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                moderationTab === 'catering'
                  ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white'
              }`}
            >
              <Calendar size={13} />
              <span>Option 2: Catering Event Inquiries ({cateringInquiryList.length})</span>
            </button>

            <button
              onClick={() => setModerationTab('b2b_jobs')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                moderationTab === 'b2b_jobs'
                  ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white'
              }`}
            >
              <Briefcase size={13} />
              <span>Option 3: B2B Vacancy Approvals ({jobVacanciesList.length})</span>
            </button>
          </div>

          {/* SUB-PANEL 1: CATERING EVENT INQUIRY MANAGEMENT */}
          {moderationTab === 'catering' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4">
                <h3 className="text-sm font-bold text-white">Catering & Banquet Inquiries Panel</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Inspect multi-step customer inquiries for large gatherings and assign specialized chef brigades.
                </p>
              </div>

              <div className="space-y-4">
                {cateringInquiryList.map((inq) => (
                  <div
                    key={inq.id}
                    className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4 shadow-xl"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-white">{inq.customerName}</h4>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                            {inq.eventType}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-1">
                          📍 {inq.venueLocation} • Date: {inq.eventDate} ({inq.eventTime})
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <div className="text-xl font-black text-amber-400 font-mono">
                          ₹{inq.totalBudgetEstimate.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[11px] text-neutral-400">
                          {inq.guestCount} Guests • ₹{inq.budgetPerPlate}/plate
                        </div>
                      </div>
                    </div>

                    {/* Inquiry Details Pill Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800">
                        <span className="text-[10px] text-neutral-500 uppercase font-bold block">Cuisines Requested</span>
                        <span className="text-neutral-200 font-semibold">{inq.preferredCuisines.join(', ')}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800">
                        <span className="text-[10px] text-neutral-500 uppercase font-bold block">Live Counters</span>
                        <span className="text-amber-300 font-semibold">{inq.liveCountersNeeded.join(', ')}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800">
                        <span className="text-[10px] text-neutral-500 uppercase font-bold block">Dietary Restrictions</span>
                        <span className="text-neutral-200 font-semibold">{inq.dietaryPreferences.join(', ')}</span>
                      </div>
                    </div>

                    {/* Assigned Crew and Action Controls */}
                    <div className="pt-3 border-t border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-400">Assigned Crew:</span>
                        <span className="text-emerald-400 font-bold">
                          {assignedCrewMap[inq.id] || 'Unassigned (Standing by)'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          onChange={(e) => handleAssignCrew(inq.id, e.target.value)}
                          defaultValue=""
                          className="px-3 py-1.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs"
                        >
                          <option value="" disabled>Assign Specialized Brigade...</option>
                          <option value="Royal Awadhi Brigade (Lead: Chef Imran Qureshi)">Royal Awadhi Brigade</option>
                          <option value="Dakshin Coastal Banana Leaf Crew (Lead: Chef Vikramaditya)">Dakshin Coastal Crew</option>
                          <option value="Artisan Woodfire & Dimsum Crew (Lead: Chef Marco)">Woodfire & Dimsum Crew</option>
                          <option value="Continental Gala Brigade (Lead: Chef Suresh Rao)">Continental Gala Brigade</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUB-PANEL 2: B2B VACANCY APPROVALS */}
          {moderationTab === 'b2b_jobs' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4">
                <h3 className="text-sm font-bold text-white">B2B Permanent Vacancies Moderation Queue</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Approve or reject full-time restaurant postings before they appear in the Chef App job portal.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobVacanciesList.map((job) => (
                  <div
                    key={job.id}
                    className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between space-y-4 shadow-xl"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-base font-bold text-white">{job.title}</h4>
                          <p className="text-xs text-amber-400 font-semibold">{job.restaurantName}</p>
                          <p className="text-[11px] text-neutral-400 mt-0.5">📍 {job.location}</p>
                        </div>
                        <span className="text-3xl">{job.restaurantLogo}</span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                          💰 {job.salaryRange}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-neutral-800 text-neutral-300">
                          Exp: {job.experienceRequired}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-300 mt-2.5 line-clamp-2">{job.description}</p>
                    </div>

                    <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          job.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : job.status === 'rejected'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        Status: {job.status || 'pending_approval'}
                      </span>

                      {job.status !== 'approved' && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleRejectJobVacancy(job.id)}
                            className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApproveJobVacancy(job.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs cursor-pointer"
                          >
                            Approve Vacancy
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SURGE PRICING CONTROLS & SYSTEM VARIABLE OVERRIDES */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Dynamic Radius Override Panel */}
          <div className="rounded-3xl bg-neutral-900 border border-neutral-800 p-6 space-y-5 shadow-xl">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders size={18} className="text-amber-400" />
                <span>Hyper-Local Matching Radius & Traffic Override</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Configure GPS dispatch boundary for SOS & home cooking bookings. Reduce radius during peak Bangalore gridlocks.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-neutral-300">
                <span>Active Dispatch Radius:</span>
                <span className="text-amber-400 text-base font-mono font-black">{matchingRadiusKm} km</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={0.5}
                value={matchingRadiusKm}
                onChange={(e) => setMatchingRadiusKm(parseFloat(e.target.value))}
                className="w-full accent-amber-500 h-2 bg-neutral-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                <span>1 km (Ultra-Local)</span>
                <span>5 km (Standard Default)</span>
                <span>10 km (Expanded Outer Ring)</span>
              </div>

              {/* Extreme Traffic One-Touch Override */}
              <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Peak Traffic Emergency Constraint</div>
                  <div className="text-[10px] text-neutral-400">Instantly caps radius to 3 km to prevent bike transit delays</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !trafficOverrideActive;
                    setTrafficOverrideActive(next);
                    if (next) setMatchingRadiusKm(3);
                    else setMatchingRadiusKm(5);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    trafficOverrideActive
                      ? 'bg-red-600 text-white shadow-md shadow-red-950'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {trafficOverrideActive ? '🚨 3km Traffic Override ON' : 'Override Disabled'}
                </button>
              </div>
            </div>
          </div>

          {/* Surge Multiplier & Demand-to-Supply Trigger Controls */}
          <div className="rounded-3xl bg-neutral-900 border border-neutral-800 p-6 space-y-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap size={18} className="text-amber-400" />
                  <span>Surge Multiplier & Automated Demand-to-Supply Rules</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Trigger weather surge multipliers or enable automated triggers based on live customer demand vs. online chefs.
                </p>
              </div>

              {/* Automated Ratio Toggle */}
              <button
                type="button"
                onClick={() => setAutoSurgeEnabled(!autoSurgeEnabled)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  autoSurgeEnabled
                    ? 'bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-950'
                    : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                {autoSurgeEnabled ? '✓ Auto Demand-to-Supply Surge: ON' : 'Auto Surge: OFF'}
              </button>
            </div>

            {/* Demand-Supply Ratio Slider */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-neutral-300">
                <span>Active Demand-to-Supply Ratio:</span>
                <span className={`text-base font-mono font-black ${demandSupplyRatio > 1.5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {demandSupplyRatio}x Ratio
                </span>
              </div>
              <input
                type="range"
                min={0.8}
                max={3.0}
                step={0.05}
                value={demandSupplyRatio}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setDemandSupplyRatio(val);
                  if (autoSurgeEnabled && val >= 1.6) {
                    onUpdateSurge('rain_monsoon');
                  } else if (autoSurgeEnabled && val < 1.3) {
                    onUpdateSurge('normal');
                  }
                }}
                className="w-full accent-amber-500 h-2 bg-neutral-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                <span>1.0x (Balanced)</span>
                <span>1.6x (Surge Threshold)</span>
                <span>3.0x (Extreme Deficit)</span>
              </div>
            </div>

            {/* Geofence Multipliers Table */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Geofenced Locality Multipliers
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(geofenceSurges).map(([area, mult]) => (
                  <div
                    key={area}
                    className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{area}</div>
                      <div className="text-[10px] text-neutral-400 font-mono">Active Geofence</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setGeofenceSurges((prev) => ({
                            ...prev,
                            [area]: Math.max(1.0, parseFloat((mult - 0.1).toFixed(2))),
                          }))
                        }
                        className="w-6 h-6 rounded-lg bg-neutral-800 text-white font-bold text-xs hover:bg-neutral-700"
                      >
                        -
                      </button>
                      <span className="text-xs font-black text-amber-400 font-mono px-1">
                        {mult.toFixed(2)}x
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setGeofenceSurges((prev) => ({
                            ...prev,
                            [area]: parseFloat((mult + 0.1).toFixed(2)),
                          }))
                        }
                        className="w-6 h-6 rounded-lg bg-neutral-800 text-white font-bold text-xs hover:bg-neutral-700"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Macro Preset Triggers */}
            <div className="pt-3 border-t border-neutral-800 space-y-2">
              <div className="text-xs font-bold text-neutral-400">One-Tap Macro Surge Triggers:</div>
              <div className="flex flex-wrap gap-2 text-xs">
                {(Object.keys(SURGE_PRESETS) as SurgeTriggerType[]).map((key) => {
                  const preset = SURGE_PRESETS[key];
                  const isCurrent = currentSurge === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => onUpdateSurge(key)}
                      className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                          : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                      }`}
                    >
                      <span>{preset.icon}</span>
                      <span>{preset.label}</span>
                      <span className="font-mono text-[11px] opacity-80">({preset.badge})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: 24/7 AI SUPPORT & EMERGENCY SAFETY DESK */}
      {/* ========================================================================= */}
      {activeTab === 'ai_support' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Top Safety Operations Banner */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-red-950/80 via-neutral-900 to-amber-950/40 border border-red-500/60 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-red-600/20 text-red-400 border border-red-500/40 flex items-center justify-center shrink-0">
                <ShieldAlert size={26} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-black text-white">24/7 AI Support & Emergency Operations Desk</span>
                  <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[10px] font-mono font-bold border border-red-500/40">
                    SENTINEL ACTIVE
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30">
                    AUTONOMOUS SLA &lt; 3.2s
                  </span>
                </div>
                <p className="text-xs text-neutral-300 mt-1 max-w-2xl leading-relaxed">
                  Real-time AI monitoring across Pan-India customer bookings and chef navigation. Intercepts safety-critical keywords (harassment, accident, fire, threat) and dispatches instant level-1 escalation alarms to this desk while automating delay credits and no-show escrow refunds.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href="tel:18002433767"
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-red-950 transition-all"
              >
                <Phone size={14} />
                <span>Hotline: 1800-243-CHEF</span>
              </a>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-neutral-900 border border-red-500/40 p-4 relative overflow-hidden">
              <div className="text-[11px] text-red-300 uppercase font-bold flex items-center justify-between">
                <span>Active Safety Emergencies</span>
                <AlertOctagon size={14} className="text-red-400 animate-pulse" />
              </div>
              <div className="text-2xl font-black text-red-400 font-mono mt-1">
                {emergencyTickets.filter((t) => t.status !== 'RESOLVED').length}
              </div>
              <div className="text-[10px] text-neutral-400 mt-1">
                {emergencyTickets.filter((t) => t.status !== 'RESOLVED').length > 0
                  ? '⚠️ Requires immediate operator check-in'
                  : '✓ All safety tickets cleared & verified safe'}
              </div>
            </div>

            <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4">
              <div className="text-[11px] text-neutral-400 uppercase font-bold flex items-center justify-between">
                <span>Total AI Disputes Resolved</span>
                <Bot size={14} className="text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono mt-1">
                {automatedDisputes.length + 142}
              </div>
              <div className="text-[10px] text-emerald-400 mt-1">
                ⚡ 99.4% resolved with 0 human friction
              </div>
            </div>

            <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4">
              <div className="text-[11px] text-neutral-400 uppercase font-bold flex items-center justify-between">
                <span>Automated SLA Delay Credits</span>
                <Clock size={14} className="text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-400 font-mono mt-1">
                ₹{(automatedDisputes.filter((d) => d.type === 'delay_credit').length * 150 + 12450).toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-neutral-400 mt-1">
                ₹150 credited per transit delay violation
              </div>
            </div>

            <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4">
              <div className="text-[11px] text-neutral-400 uppercase font-bold flex items-center justify-between">
                <span>Escrow No-Show Refunds</span>
                <RotateCcw size={14} className="text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-cyan-400 font-mono mt-1">
                ₹{(automatedDisputes.filter((d) => d.type === 'no_show_refund').length * 849 + 18600).toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-neutral-400 mt-1">
                100% Digital Escrow refunded instantly
              </div>
            </div>
          </div>

          {/* SECTION 1: Active Emergency Escalation Alarms Queue */}
          <div className="rounded-3xl bg-neutral-900 border border-neutral-800 p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <ShieldAlert size={18} className="text-red-400" />
                    <span>Emergency Safety Incident Queue (Keyword Intercepts)</span>
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-red-600/30 text-red-300 text-[10px] font-mono font-bold">
                    {emergencyTickets.filter((t) => t.status !== 'RESOLVED').length} PENDING
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Triggered autonomously by AI Sentinel when users mention safety-critical terms like harassment, fire, accident, or threat.
                </p>
              </div>
            </div>

            {emergencyTickets.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 rounded-2xl bg-neutral-950/40 border border-dashed border-neutral-800 text-xs">
                <ShieldCheck size={28} className="mx-auto text-emerald-400 mb-2 opacity-80" />
                <p className="font-bold text-neutral-300">No Active Emergency Alarms</p>
                <p className="mt-1">All safety monitors across Bangalore, Mumbai, Delhi, and Pan-India are normal.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {emergencyTickets.map((ticket) => {
                  const isResolved = ticket.status === 'RESOLVED';
                  return (
                    <div
                      key={ticket.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        isResolved
                          ? 'bg-neutral-950/60 border-neutral-800 opacity-60'
                          : 'bg-red-950/30 border-red-500/70 shadow-lg shadow-red-950/40'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl mt-0.5">
                            {isResolved ? '✅' : '🚨'}
                          </span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono font-bold text-red-400">
                                #{ticket.id}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  ticket.severity === 'CRITICAL_LEVEL_1'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-amber-600 text-white'
                                }`}
                              >
                                {ticket.severity}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 text-[10px] font-bold uppercase">
                                {ticket.userType === 'chef' ? '👨‍🍳 Chef Triggered' : '🍽️ Customer Triggered'}
                              </span>
                              <span className="text-[10px] text-neutral-400 font-mono">
                                🕒 {ticket.timestamp}
                              </span>
                            </div>

                            <div className="mt-1 text-sm font-black text-white">
                              {ticket.reason}
                            </div>

                            <p className="text-xs text-neutral-300 mt-1 max-w-3xl leading-relaxed">
                              {ticket.details}
                            </p>

                            <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                              <span className="flex items-center gap-1 text-neutral-200 font-medium">
                                <span>User:</span> <strong className="text-white">{ticket.userName}</strong>
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <span>Phone:</span>{' '}
                                <a
                                  href={`tel:${ticket.userPhone}`}
                                  className="text-amber-400 hover:underline font-mono font-bold"
                                >
                                  {ticket.userPhone}
                                </a>
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <MapPin size={12} className="text-amber-400" />
                                <span>{ticket.location}</span>
                              </span>
                            </div>

                            {ticket.flaggedKeywords && ticket.flaggedKeywords.length > 0 && (
                              <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-bold text-neutral-400 uppercase">
                                  Flagged Keywords:
                                </span>
                                {ticket.flaggedKeywords.map((kw, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-0.5 rounded-md bg-red-500/30 text-red-200 border border-red-500/50 text-[10px] font-bold font-mono"
                                  >
                                    "{kw}"
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Incident Actions */}
                        <div className="flex flex-wrap md:flex-col items-end gap-2 shrink-0">
                          {!isResolved ? (
                            <>
                              <a
                                href={`tel:${ticket.userPhone}`}
                                className="px-3.5 py-1.5 rounded-xl bg-white text-neutral-950 font-black text-xs hover:bg-neutral-100 flex items-center gap-1.5 shadow-md"
                              >
                                <Phone size={13} />
                                <span>Call User</span>
                              </a>

                              <button
                                type="button"
                                onClick={() => {
                                  if (onDispatchSafetyUnit) onDispatchSafetyUnit(ticket.id);
                                }}
                                className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                              >
                                <ShieldAlert size={13} />
                                <span>Dispatch Rapid Response</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (onResolveEmergencyTicket) onResolveEmergencyTicket(ticket.id);
                                }}
                                className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-emerald-600 hover:text-white text-emerald-400 font-bold text-xs border border-neutral-700 transition-colors cursor-pointer"
                              >
                                ✓ Mark De-Escalated & Safe
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle size={14} />
                              <span>De-escalated & Incident Closed</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION 2: Automated Dispute Resolution Ledger (AI Bot Audit) */}
          <div className="rounded-3xl bg-neutral-900 border border-neutral-800 p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Bot size={18} className="text-amber-400" />
                  <span>24/7 Autonomous Dispute Ledger (AI Resolutions)</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Automated credits, escrow refunds, and navigation assists executed instantly without manual human touch.
                </p>
              </div>
              <div className="text-xs text-neutral-400 font-mono">
                Real-Time Telemetry Audit: ACTIVE
              </div>
            </div>

            {/* Dispute Table / List */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    <th className="pb-3">Dispute Ref</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Party & User</th>
                    <th className="pb-3">Action Executed</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Timestamp</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/80">
                  {/* Default Seeded Log Entries + Any Dynamic Log Entries */}
                  {automatedDisputes.map((disp) => (
                    <tr key={disp.id} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="py-3 font-mono font-bold text-amber-400">{disp.id}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-200 font-medium capitalize">
                          {disp.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 font-semibold text-white">
                        {disp.userName} ({disp.userRole})
                      </td>
                      <td className="py-3 text-neutral-300">{disp.reason}</td>
                      <td className="py-3 font-mono font-bold text-emerald-400">
                        {disp.amount ? `₹${disp.amount}` : 'N/A (Assistance)'}
                      </td>
                      <td className="py-3 text-neutral-400">{disp.timestamp}</td>
                      <td className="py-3 text-right">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                          {disp.status}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {/* Seeded Records */}
                  <tr className="hover:bg-neutral-800/30 transition-colors">
                    <td className="py-3 font-mono font-bold text-amber-400">DISP-LATE-8901</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-200 font-medium">
                        SLA Delay Credit
                      </span>
                    </td>
                    <td className="py-3 font-semibold text-white">Priya Sundaram (customer)</td>
                    <td className="py-3 text-neutral-300">Transit exceeded 20 min SLA (+6m delay)</td>
                    <td className="py-3 font-mono font-bold text-emerald-400">₹150</td>
                    <td className="py-3 text-neutral-400">14 mins ago</td>
                    <td className="py-3 text-right">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                        CREDITED
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-neutral-800/30 transition-colors">
                    <td className="py-3 font-mono font-bold text-amber-400">DISP-NAV-3312</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-200 font-medium">
                        Chef Navigation
                      </span>
                    </td>
                    <td className="py-3 font-semibold text-white">Chef Rajesh Sharma (chef)</td>
                    <td className="py-3 text-neutral-300">Sent landmark coordinates + SMS buzzer to host</td>
                    <td className="py-3 font-mono font-bold text-neutral-400">Coordinate Sync</td>
                    <td className="py-3 text-neutral-400">32 mins ago</td>
                    <td className="py-3 text-right">
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-[10px]">
                        DISPATCHED
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-neutral-800/30 transition-colors">
                    <td className="py-3 font-mono font-bold text-amber-400">DISP-NOSHOW-4109</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-200 font-medium">
                        No-Show Escrow Refund
                      </span>
                    </td>
                    <td className="py-3 font-semibold text-white">Vikramaditya Rao (customer)</td>
                    <td className="py-3 text-neutral-300">Chef failed OTP arrival geofence check</td>
                    <td className="py-3 font-mono font-bold text-emerald-400">₹849</td>
                    <td className="py-3 text-neutral-400">1 hour ago</td>
                    <td className="py-3 text-right">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                        REFUNDED
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
