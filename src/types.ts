export type UserRole = 'customer' | 'chef' | 'restaurant_manager';

export interface CityArea {
  name: string;
  lat: number;
  lng: number;
  label: string;
  pincode?: string;
}

export interface CityInfo {
  id: string;
  name: string;
  code: string; // e.g., 'BLR', 'BOM', 'DEL', 'HYD', 'MAA', 'CCU', 'PNQ', 'AMD', 'JAI', 'GOI', 'COK', 'IXC', 'LKO', etc.
  state: string;
  statePoliceCode: string;
  statePoliceJurisdiction: string;
  region: 'South' | 'North' | 'West' | 'East' | 'Central';
  tier: 'Metro' | 'Tier-1' | 'Tier-2';
  tagline: string;
  popularCuisines: string[];
  activeChefsCount: number;
  centerLat: number;
  centerLng: number;
  areas: CityArea[];
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  avatar: string;
  verified: boolean;
  address?: string;
  cityId?: string;
  cityName?: string;
  location: {
    lat: number;
    lng: number;
    area: string;
  };
  dietaryPreference?: 'all' | 'veg' | 'non_veg' | 'jain' | 'vegan';
  householdSize?: string;
  favoriteCuisines?: string[];
  chefProfileId?: string;
  authProvider?: 'phone' | 'email' | 'google' | 'both';
  isFirstLogin?: boolean;
  averageRatingScore?: number;
  totalRatingsCount?: number;
  isSuspended?: boolean;
  suspensionReason?: string;
}

export type ChefSpecialty = 
  | 'North Indian / Mughlai' 
  | 'South Indian / Coastal' 
  | 'Tandoor & Kebabs' 
  | 'Continental & Italian' 
  | 'Pan-Asian & Dimsum' 
  | 'Pastry & Bakery' 
  | 'Healthy / Diet / Keto' 
  | 'Awadhi Banquet'
  | 'Mexican & Street Food'
  | 'Maharashtrian & Malvani'
  | 'Rajasthani & Marwari'
  | 'Bengali Royal Feast'
  | 'Goan Portuguese & Coastal'
  | 'Hyderabadi Dum & Nizami';

export type VerificationStatus = 'verified' | 'pending' | 'flagged' | 'rejected' | 'unverified';

export interface VerificationCheckDetail {
  id: string;
  name: string;
  authority: string;
  status: 'passed' | 'review_required' | 'in_progress' | 'failed';
  referenceId: string;
  verifiedAt?: string;
  notes: string;
}

export interface ChefVerificationReport {
  status: VerificationStatus;
  overallScore: number; // 0-100 score
  verifiedDate: string;
  dossierNumber: string;
  karnatakaPolicePCC: {
    reference: string;
    status: 'passed' | 'flagged' | 'pending';
    crimeRecordClear: boolean;
    jurisdiction: string;
    verifiedAt: string;
  };
  statePolicePCC?: {
    reference: string;
    status: 'passed' | 'flagged' | 'pending';
    crimeRecordClear: boolean;
    jurisdiction: string;
    state: string;
    verifiedAt: string;
  };
  aadhaarPANVerification: {
    maskedAadhaar: string;
    maskedPAN: string;
    status: 'passed' | 'failed' | 'pending';
    nameMatchPercentage: number;
    dobVerified: boolean;
  };
  fssaiCertification: {
    licenseNumber: string;
    category: string;
    validThrough: string;
    status: 'passed' | 'expired' | 'pending';
  };
  kitchenHygieneAudit: {
    score: number; // e.g. 98/100
    auditor: string;
    swabCultureTest: 'negative' | 'positive';
    status: 'passed' | 'review_required';
  };
  checks: VerificationCheckDetail[];
  lastAuditedTimestamp: string;
}

export interface Review {
  id: string;
  chefId: string;
  customerName: string;
  customerAvatar?: string;
  customerArea: string;
  rating: number; // 1 to 5
  date: string;
  serviceType: 'SOS Quick-Fix' | 'Daily Meal Prep' | 'Dinner Party Banquet' | 'B2B Restaurant Shift' | string;
  dishesOrdered: string;
  comment: string;
  helpfulCount: number;
  aspects: {
    taste: number;
    hygiene: number;
    punctuality: number;
  };
  verifiedBooking: boolean;
}

export type ChefReview = Review;

export interface Chef {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  cityId?: string;
  cityName?: string;
  rating: number;
  averageRatingScore?: number; // Average rating score
  averageRating?: number; // Alias for average rating score
  reviewsCount: number;
  experienceYears: number;
  specialties: ChefSpecialty[];
  currentLocation: {
    lat: number;
    lng: number;
    area: string;
  };
  distanceKm: number;
  isOnline: boolean;
  status: 'available' | 'busy' | 'en_route' | 'offline';
  hourlyRate: number; // in INR ₹
  sosRate: number; // in INR ₹ for immediate quick-fix (approx 1.5 - 2 hrs)
  dayPrepRate: number; // for daily meal prep package
  shiftRate: number; // 6-hour emergency shift
  bio: string;
  languages: string[];
  hygieneCertified: boolean;
  policeVerified: boolean;
  signatureDishes: string[];
  galleryImages: string[];
  reviews?: Review[]; // Array of customer reviews
  portfolio?: PortfolioItem[];
  verificationReport?: ChefVerificationReport;
  livenessCheck?: ChefLivenessCheck;
  documentUploads?: ChefDocumentUploads;
  isSuspended?: boolean;
  suspensionReason?: string;
}

export interface ChefLivenessCheck {
  passed: boolean;
  timestamp: string; // ISO string
  selfieUrl: string;
  expiresAt: string; // valid for 12 hours
  confidenceScore: number; // e.g. 99.4
  facialFramingPassed: boolean;
  chefAttireVerified: boolean;
}

export interface AadhaarKycData {
  aadhaarNumber: string; // 12 digits
  maskedAadhaar: string; // e.g. XXXX XXXX 4819
  verified: boolean;
  nameOnAadhaar: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  verifiedAt?: string;
  txnId?: string;
  cardFrontUrl?: string;
  cardBackUrl?: string;
}

export interface ChefDocumentUploads {
  aadhaar: AadhaarKycData;
  fssaiLicense: {
    licenseNumber: string;
    validThrough: string;
    verified: boolean;
    documentUrl?: string;
  };
  policeBackgroundCheck: {
    pccNumber: string;
    statePolice: string;
    clearanceStatus: 'cleared' | 'pending' | 'review_required';
    verified: boolean;
    documentUrl?: string;
  };
  healthFitnessCertificate: {
    doctorRegistration: string;
    testedNegativeDate: string;
    verified: boolean;
    documentUrl?: string;
  };
}

export interface FeedbackSubmission {
  role: 'customer' | 'chef';
  reviewerName: string;
  targetId: string; // chefId or customerId
  targetName: string;
  rating: number; // 1 to 5 stars
  tags: string[]; // selected granular feedback tags
  comment: string;
  submittedAt: string;
}

export interface TwoWayBlindRating {
  bookingId: string;
  customerRating?: FeedbackSubmission;
  chefRating?: FeedbackSubmission;
  status: 'pending_both' | 'customer_submitted' | 'chef_submitted' | 'revealed_both';
  unsealedAt?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  imageUrl: string;
  category: 'Banquet Platters' | 'Live Grills & Counters' | 'Artisanal Plated' | 'Gourmet Desserts';
  platingStyle: string;
  description: string;
  prepTime?: string;
  pairingNotes?: string;
}

export type BookingType = 'sos_quick_fix' | 'scheduled_prep' | 'b2b_gig_shift';

export type BookingStatus = 
  | 'pending_acceptance' 
  | 'accepted' 
  | 'en_route' 
  | 'arrived' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled';

export interface Booking {
  id: string;
  type: BookingType;
  customerId: string;
  customerName: string;
  customerPhone: string;
  chefId: string;
  chefName: string;
  chefAvatar: string;
  serviceAddress: string;
  area: string;
  lat: number;
  lng: number;
  scheduledTime: string; // "Immediate" or ISO string
  guestCount?: number;
  cuisines: string[];
  dishesRequested: string;
  specialInstructions?: string;
  totalAmount: number; // INR ₹
  platformFee: number;
  gstAmount: number;
  status: BookingStatus;
  otp: string; // 4-digit arrival verification
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
  etaMinutes?: number;
  sosAlert?: SosAlertInfo;
  twoWayRating?: TwoWayBlindRating;
  sharedTrackingToken?: string;
  sharedTrackingUrl?: string;
}

export interface SosAlertInfo {
  active: boolean;
  ticketId: string;
  triggeredAt: string;
  triggeredBy: string;
  reason: string;
  supportStatus: 'ESCALATED_DISPATCH' | 'SAFETY_DESK_CONNECTED' | 'RESOLVED';
  supportAgent: string;
  supportPhone: string;
  chefNotified: boolean;
  chefNotificationTime: string;
  actionTaken?: string;
}

export interface CateringInquiry {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  eventDate: string;
  eventTime: string;
  eventType: 'Wedding / Sangeet' | 'Corporate Gala' | 'Cocktail Party' | 'Intimate Villa Dinner' | 'Birthday Bash';
  guestCount: number;
  budgetPerPlate: number; // INR ₹
  totalBudgetEstimate: number;
  preferredCuisines: string[];
  liveCountersNeeded: string[];
  dietaryPreferences: string[];
  venueLocation: string;
  additionalNotes: string;
  status: 'submitted' | 'under_review' | 'proposal_sent' | 'booked';
  createdAt: string;
}

export interface B2BShiftRequest {
  id: string;
  restaurantName: string;
  managerName: string;
  managerPhone: string;
  area: string;
  date: string;
  shiftTiming: 'Lunch Rush (11 AM - 4 PM)' | 'Dinner Rush (6 PM - 11 PM)' | 'Full Double (11 AM - 11 PM)';
  roleNeeded: 'Tandoor Chef' | 'Line Cook / CDP' | 'South Indian Master' | 'Continental & Grill' | 'Kitchen Steward';
  hourlyRate: number;
  totalPayout: number;
  status: 'open' | 'matched' | 'fulfilled';
  assignedChefId?: string;
}

export interface JobPosting {
  id: string;
  title: string;
  restaurantName: string;
  restaurantLogo: string;
  location: string; // e.g., "Indiranagar, Bangalore"
  type: 'Full-time' | 'Contract' | 'Head Chef Track';
  experienceRequired: string;
  salaryRange: string; // e.g. "₹45,000 - ₹65,000 / month"
  cuisineCategory: string;
  description: string;
  requirements: string[];
  benefits: string[];
  postedDate: string;
  applicantsCount: number;
  status?: 'pending_approval' | 'approved' | 'rejected';
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  restaurantName: string;
  chefId: string;
  chefName: string;
  chefExperience: number;
  specialties: string[];
  pitch: string;
  status: 'applied' | 'shortlisted' | 'trial_scheduled' | 'hired';
  appliedAt: string;
}

export interface EmergencyEscalationTicket {
  id: string;
  reason: string;
  userType: 'customer' | 'chef' | string;
  userName: string;
  userPhone: string;
  details: string;
  timestamp: string;
  status: 'DISPATCHED' | 'MONITORING' | 'RESOLVED';
  severity: 'CRITICAL_LEVEL_1' | 'HIGH';
  location: string;
  flaggedKeywords: string[];
  actionTaken?: string;
  bookingId?: string;
}

export interface AutomatedDisputeResolution {
  id: string;
  type: 'delay_credit' | 'no_show_refund' | 'quality_voucher' | 'navigation_assistance' | 'emergency_escalation';
  userRole: 'customer' | 'chef';
  userName: string;
  bookingId?: string;
  amount?: number;
  reason: string;
  timestamp: string;
  status: 'PROCESSED' | 'CREDITED' | 'ESCALATED';
}
