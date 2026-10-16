import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Award,
  Sparkles,
  Linkedin,
  Twitter,
  Mail,
  Building2,
  Users,
  Target,
  Compass,
  HeartHandshake,
  BookOpen,
  UtensilsCrossed,
  Clock,
  ChevronRight,
  Send,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  MapPin,
  Flame,
  Star,
  Quote,
  Camera,
} from 'lucide-react';
import { getFounderPhoto } from '../../utils/founderPhotos';
import { FounderPhotoUploadModal } from '../common/FounderPhotoUploadModal';

interface FoundersViewProps {
  onNavigateToCustomer: (subOption?: 'home_services' | 'catering' | 'b2b_hire') => void;
  onNavigateToChefApp: () => void;
  onOpenVerificationSimulator?: () => void;
}

export const FoundersView: React.FC<FoundersViewProps> = ({
  onNavigateToCustomer,
  onNavigateToChefApp,
  onOpenVerificationSimulator,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'story' | 'values' | 'roadmap' | 'contact'>('overview');
  const [selectedLeader, setSelectedLeader] = useState<'ram' | 'sateesh' | 'both'>('both');
  
  // Dynamic Founder Photos with instant upload & URL replace
  const [ramPhoto, setRamPhoto] = useState<string>(() => getFounderPhoto('ram'));
  const [sateeshPhoto, setSateeshPhoto] = useState<string>(() => getFounderPhoto('sateesh'));
  const [uploadModalFounder, setUploadModalFounder] = useState<'ram' | 'sateesh' | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setRamPhoto(getFounderPhoto('ram'));
      setSateeshPhoto(getFounderPhoto('sateesh'));
    };
    window.addEventListener('chefpulse-founder-photos-updated', handleUpdate);
    return () => window.removeEventListener('chefpulse-founder-photos-updated', handleUpdate);
  }, []);
  
  // Executive Contact Modal / Form state
  const [contactRecipient, setContactRecipient] = useState<'both' | 'ram' | 'sateesh'>('both');
  const [contactSubject, setContactSubject] = useState<'partnership' | 'investment' | 'enterprise_hiring' | 'press' | 'other'>('partnership');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [showDeckModal, setShowDeckModal] = useState(false);

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedSuccess(true);
    }, 900);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-300 pb-16">
      
      {/* 1. HERO LEADERSHIP BANNER */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-amber-950/50 border border-neutral-800 p-6 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Leadership & Founding Vision • ChefPulse Pan-India 🇮🇳</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Meet the Visionaries Shaping India&rsquo;s Culinary Future.
          </h1>

          <p className="mt-4 text-sm sm:text-base text-neutral-300 leading-relaxed">
            Founded by <strong className="text-white font-bold">Ram Jagadish</strong> (Founder & CEO) and <strong className="text-white font-bold">Sateesh Chitturi</strong> (Co-Founder & Director), ChefPulse connects private households, luxury banquet hosts, and hospitality enterprises with vetted, world-class culinary talent across every city in India.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('contact')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
            >
              <Mail className="w-4 h-4 text-neutral-950" />
              <span>Contact the Founders' Desk</span>
            </button>
            <button
              onClick={() => setShowDeckModal(true)}
              className="px-4 py-2.5 rounded-xl bg-neutral-800/90 hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-xs transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Executive Briefing Deck</span>
            </button>
            {onOpenVerificationSimulator && (
              <button
                onClick={onOpenVerificationSimulator}
                className="px-4 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 font-bold text-xs transition-all flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Inspect Safety & Gov Engine</span>
              </button>
            )}
          </div>
        </div>

        {/* Operating Metrics Strip */}
        <div className="mt-10 pt-8 border-t border-neutral-800/90 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-800">
            <div className="flex items-center gap-2 text-amber-400 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Culinary Network</span>
            </div>
            <div className="text-2xl font-black text-white">1,200+</div>
            <div className="text-[11px] text-neutral-400 mt-0.5">Government-vetted chefs</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-800">
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">SOS Dispatch</span>
            </div>
            <div className="text-2xl font-black text-emerald-400">18.4 min</div>
            <div className="text-[11px] text-neutral-400 mt-0.5">Avg door arrival across BLR</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-800">
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <Building2 className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">B2B Partners</span>
            </div>
            <div className="text-2xl font-black text-blue-400">85+</div>
            <div className="text-[11px] text-neutral-400 mt-0.5">Restaurants & luxury venues</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-800">
            <div className="flex items-center gap-2 text-purple-400 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Background Safety</span>
            </div>
            <div className="text-2xl font-black text-white">100%</div>
            <div className="text-[11px] text-neutral-400 mt-0.5">UIDAI & Police audit record</div>
          </div>
        </div>
      </section>

      {/* 2. THE FOUNDERS: RAM JAGADISH & SATEESH CHITTURI IN-DEPTH PROFILES */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              <span>Executive Leadership</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Ram Jagadish & Sateesh Chitturi
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Complementary leadership pairing technology architecture with deep hospitality operations and governance.
            </p>
          </div>

          <div className="flex items-center bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-xs">
            <button
              onClick={() => setSelectedLeader('both')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                selectedLeader === 'both' ? 'bg-amber-500 text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Both Leaders
            </button>
            <button
              onClick={() => setSelectedLeader('ram')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                selectedLeader === 'ram' ? 'bg-amber-500 text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Ram Jagadish (CEO)
            </button>
            <button
              onClick={() => setSelectedLeader('sateesh')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                selectedLeader === 'sateesh' ? 'bg-amber-500 text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Sateesh Chitturi (Director)
            </button>
          </div>
        </div>

        {/* Profile Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* PROFILE 1: RAM JAGADISH (FOUNDER & CEO) */}
          {(selectedLeader === 'both' || selectedLeader === 'ram') && (
            <div className="relative rounded-3xl bg-neutral-900/90 border border-neutral-800 hover:border-amber-500/50 p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-xl overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/15 transition-all" />

              <div>
                {/* Header Badge */}
                <div className="flex items-start justify-between gap-4">
                  <div className="relative group/avatar">
                    <img
                      src={ramPhoto}
                      alt="Ram Jagadish, Founder and CEO"
                      referrerPolicy="no-referrer"
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-amber-500/40 shadow-xl shadow-amber-500/10 group-hover:scale-105 transition-transform"
                    />
                    <button
                      type="button"
                      onClick={() => setUploadModalFounder('ram')}
                      className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center text-amber-400 text-[10px] font-bold transition-opacity cursor-pointer backdrop-blur-[2px]"
                      title="Upload / Change Photo for Ram Jagadish"
                    >
                      <Camera size={18} className="mb-0.5" />
                      <span>Edit Photo</span>
                    </button>
                    <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md bg-amber-500 text-neutral-950 font-black text-[10px] uppercase tracking-wider shadow-sm z-10">
                      CEO
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-black uppercase tracking-wider">
                      Founder & CEO
                    </span>
                    <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-400" /> Bengaluru, India
                    </span>
                    <button
                      type="button"
                      onClick={() => setUploadModalFounder('ram')}
                      className="mt-1 text-[10px] font-bold text-amber-400/90 hover:text-amber-300 flex items-center gap-1 cursor-pointer bg-neutral-800/80 hover:bg-neutral-800 px-2.5 py-1 rounded-lg border border-neutral-700/60"
                    >
                      <Camera size={11} />
                      <span>Change Photo</span>
                    </button>
                    <div className="flex items-center gap-2 mt-2">
                      <a
                        href="https://linkedin.com"
                        target="_blank"
                        rel="noreferrer"
                        className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-amber-500/20 text-neutral-300 hover:text-amber-400 flex items-center justify-center transition-colors border border-neutral-700"
                        title="Ram Jagadish on LinkedIn"
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                      <a
                        href="https://twitter.com"
                        target="_blank"
                        rel="noreferrer"
                        className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-amber-500/20 text-neutral-300 hover:text-amber-400 flex items-center justify-center transition-colors border border-neutral-700"
                        title="Ram Jagadish on X / Twitter"
                      >
                        <Twitter className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => {
                          setContactRecipient('ram');
                          setActiveTab('contact');
                        }}
                        className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-amber-500/20 text-neutral-300 hover:text-amber-400 flex items-center justify-center transition-colors border border-neutral-700"
                        title="Email Ram Jagadish"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Name & Title */}
                <div className="mt-6">
                  <h3 className="text-2xl font-black text-white group-hover:text-amber-400 transition-colors">
                    Ram Jagadish
                  </h3>
                  <div className="text-sm font-bold text-amber-400 mt-0.5">
                    Founder & Chief Executive Officer
                  </div>
                  <div className="text-xs text-neutral-400 mt-0.5">
                    Strategy, Technology Architecture & Marketplace Scale
                  </div>
                </div>

                {/* Executive Quote */}
                <div className="mt-5 relative p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800">
                  <Quote className="w-5 h-5 text-amber-500/40 absolute top-3 right-3" />
                  <p className="text-xs text-neutral-300 italic leading-relaxed pr-6">
                    “India has over 2 million exceptionally gifted culinary artists whose skills were confined to informal, underpaid word-of-mouth networks. At ChefPulse, we built the technological engine that gives them instant booking liquidity, dignified income, and allows any family or restaurant in Bengaluru to summon culinary excellence within 20 minutes.”
                  </p>
                </div>

                {/* Bio & Background */}
                <div className="mt-5 space-y-3 text-xs text-neutral-300 leading-relaxed">
                  <p>
                    Ram leads executive strategy, technology architecture, and marketplace expansion for ChefPulse. With a background spanning consumer internet marketplaces, hyper-local spatial routing, and algorithmic pricing, Ram engineered ChefPulse’s real-time matching system that dispatches chefs in a 1–5 km radius with zero lag.
                  </p>
                  <p>
                    He oversees institutional investor relations, brand direction, and the platform’s pan-India scaling blueprint, ensuring every touchpoint delivers five-star hospitality standards.
                  </p>
                </div>

                {/* Leadership Focus Areas */}
                <div className="mt-6">
                  <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2.5">
                    Executive Focus Areas
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-semibold">
                      ⚡ Hyper-Local Spatial Routing (1-5km)
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-200 text-[11px] font-semibold">
                      📊 Marketplace Liquidity & Pricing
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-200 text-[11px] font-semibold">
                      🚀 Pan-India Metro Expansion
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-200 text-[11px] font-semibold">
                      💼 Direct Escrow & Instant UPI Payouts
                    </span>
                  </div>
                </div>
              </div>

              {/* Direct Action Link */}
              <div className="mt-8 pt-4 border-t border-neutral-800 flex items-center justify-between text-xs">
                <span className="text-neutral-400 font-mono text-[11px]">Direct Office: ram.jagadish@chefpulse.in</span>
                <button
                  onClick={() => {
                    setContactRecipient('ram');
                    setActiveTab('contact');
                  }}
                  className="font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  <span>Connect with Ram</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* PROFILE 2: SATEESH CHITTURI (CO-FOUNDER & DIRECTOR) */}
          {(selectedLeader === 'both' || selectedLeader === 'sateesh') && (
            <div className="relative rounded-3xl bg-neutral-900/90 border border-neutral-800 hover:border-blue-500/50 p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-xl overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/15 transition-all" />

              <div>
                {/* Header Badge */}
                <div className="flex items-start justify-between gap-4">
                  <div className="relative group/avatar">
                    <img
                      src={sateeshPhoto}
                      alt="Sateesh Chitturi, Co-founder and Director"
                      referrerPolicy="no-referrer"
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-blue-500/40 shadow-xl shadow-blue-500/10 group-hover:scale-105 transition-transform"
                    />
                    <button
                      type="button"
                      onClick={() => setUploadModalFounder('sateesh')}
                      className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center text-blue-400 text-[10px] font-bold transition-opacity cursor-pointer backdrop-blur-[2px]"
                      title="Upload / Change Photo for Sateesh Chitturi"
                    >
                      <Camera size={18} className="mb-0.5" />
                      <span>Edit Photo</span>
                    </button>
                    <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md bg-blue-500 text-white font-black text-[10px] uppercase tracking-wider shadow-sm z-10">
                      Director
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span className="px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[11px] font-black uppercase tracking-wider">
                      Co-Founder & Director
                    </span>
                    <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-blue-400" /> Bengaluru, India
                    </span>
                    <button
                      type="button"
                      onClick={() => setUploadModalFounder('sateesh')}
                      className="mt-1 text-[10px] font-bold text-blue-400/90 hover:text-blue-300 flex items-center gap-1 cursor-pointer bg-neutral-800/80 hover:bg-neutral-800 px-2.5 py-1 rounded-lg border border-neutral-700/60"
                    >
                      <Camera size={11} />
                      <span>Change Photo</span>
                    </button>
                    <div className="flex items-center gap-2 mt-2">
                      <a
                        href="https://linkedin.com"
                        target="_blank"
                        rel="noreferrer"
                        className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-blue-500/20 text-neutral-300 hover:text-blue-400 flex items-center justify-center transition-colors border border-neutral-700"
                        title="Sateesh Chitturi on LinkedIn"
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                      <a
                        href="https://twitter.com"
                        target="_blank"
                        rel="noreferrer"
                        className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-blue-500/20 text-neutral-300 hover:text-blue-400 flex items-center justify-center transition-colors border border-neutral-700"
                        title="Sateesh Chitturi on X / Twitter"
                      >
                        <Twitter className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => {
                          setContactRecipient('sateesh');
                          setActiveTab('contact');
                        }}
                        className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-blue-500/20 text-neutral-300 hover:text-blue-400 flex items-center justify-center transition-colors border border-neutral-700"
                        title="Email Sateesh Chitturi"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Name & Title */}
                <div className="mt-6">
                  <h3 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors">
                    Sateesh Chitturi
                  </h3>
                  <div className="text-sm font-bold text-blue-400 mt-0.5">
                    Co-Founder & Director
                  </div>
                  <div className="text-xs text-neutral-400 mt-0.5">
                    Operations, Governance, B2B Staffing & Safety Verification
                  </div>
                </div>

                {/* Executive Quote */}
                <div className="mt-5 relative p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800">
                  <Quote className="w-5 h-5 text-blue-500/40 absolute top-3 right-3" />
                  <p className="text-xs text-neutral-300 italic leading-relaxed pr-6">
                    “In hospitality, trust is earned in seconds and lost in an instant. Our strict four-tier background check with UIDAI, CCTNS police records, and FSSAI standards guarantees that inviting a ChefPulse chef into your home or commercial brigade is safe, dignified, and 100% compliant.”
                  </p>
                </div>

                {/* Bio & Background */}
                <div className="mt-5 space-y-3 text-xs text-neutral-300 leading-relaxed">
                  <p>
                    Sateesh directs corporate governance, enterprise hospitality partnerships, and chef quality operations at ChefPulse. With over 14 years of executive leadership in hospitality scaling, operational logistics, and regulatory compliance, Sateesh built the platform’s B2B emergency staffing arm.
                  </p>
                  <p>
                    He designed the ChefPulse Culinary Academy and pioneered the government-grade background audit framework, transforming how chefs are authenticated before stepping into customer residences and luxury resort banquets.
                  </p>
                </div>

                {/* Leadership Focus Areas */}
                <div className="mt-6">
                  <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2.5">
                    Executive Focus Areas
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[11px] font-semibold">
                      🛡️ 4-Tier Government Background Auditing
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-200 text-[11px] font-semibold">
                      🏨 B2B Hospitality & Hotel Staffing
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-200 text-[11px] font-semibold">
                      📜 FSSAI & Hygiene Quality Governance
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-200 text-[11px] font-semibold">
                      🎓 Chef Academy & Culinary Upskilling
                    </span>
                  </div>
                </div>
              </div>

              {/* Direct Action Link */}
              <div className="mt-8 pt-4 border-t border-neutral-800 flex items-center justify-between text-xs">
                <span className="text-neutral-400 font-mono text-[11px]">Direct Office: sateesh.chitturi@chefpulse.in</span>
                <button
                  onClick={() => {
                    setContactRecipient('sateesh');
                    setActiveTab('contact');
                  }}
                  className="font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <span>Connect with Sateesh</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* 3. INTERACTIVE SECTION TABS: STORY, VALUES, ROADMAP & CONTACT */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 border-b border-neutral-800 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Executive Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('story')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'story'
                ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>The Founding Story</span>
          </button>

          <button
            onClick={() => setActiveTab('values')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'values'
                ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Our Shared Values & Mission</span>
          </button>

          <button
            onClick={() => setActiveTab('roadmap')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'roadmap'
                ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Pan-India Vision & Roadmap</span>
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'contact'
                ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Direct Founders' Desk</span>
          </button>
        </div>

        {/* TAB 1: EXECUTIVE OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
            <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-lg">
                ⚡
              </div>
              <h3 className="text-base font-bold text-white">For Modern Homeowners</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Ram & Sateesh architected the on-demand SOS booking engine. If your regular cook falls sick, you can summon a verified culinary specialist within 20 minutes with live GPS tracking on the map.
              </p>
              <button
                onClick={() => onNavigateToCustomer('home_services')}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 pt-2"
              >
                <span>Try Home Services</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center font-bold text-lg">
                🥂
              </div>
              <h3 className="text-base font-bold text-white">For Luxury Event Catering</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Tailored for high-end banquets, intimate cocktail parties, and corporate galas. Hosts can browse chef portfolios, signature dish photos, and customize bespoke multi-course menus.
              </p>
              <button
                onClick={() => onNavigateToCustomer('catering')}
                className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 pt-2"
              >
                <span>Plan Event Catering</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-lg">
                🏨
              </div>
              <h3 className="text-base font-bold text-white">For Commercial Hospitality (B2B)</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Directly conceived by Sateesh Chitturi to solve weekend kitchen emergencies. Bangalore brewpubs and restaurants can request emergency shift cooks or post head chef vacancies.
              </p>
              <button
                onClick={() => onNavigateToCustomer('b2b_hire')}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 pt-2"
              >
                <span>Enter B2B Portal</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: THE FOUNDING STORY */}
        {activeTab === 'story' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-neutral-800 space-y-6 animate-in fade-in">
            <div className="max-w-3xl space-y-4">
              <h3 className="text-xl sm:text-2xl font-black text-white">
                How a Missed Family Dinner in Koramangala Sparked a Movement
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed">
                In late 2024, Ram Jagadish had invited 12 colleagues and family members to his apartment in Koramangala for an anniversary celebration. Two hours before guests were slated to arrive, his domestic cook suffered a family emergency and had to leave abruptly. Desperate to find a professional cook who could step in, Ram spent two stressful hours calling agencies and community message boards—only to be told that bookings required 48 hours notice.
              </p>
              <p className="text-sm text-neutral-300 leading-relaxed">
                That same week, Sateesh Chitturi—who was advising several microbreweries and dining establishments in Indiranagar—was managing a crisis where two line chefs failed to report for their Friday night shift, leaving the kitchen with 90-minute order delays and lost revenue.
              </p>
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm italic leading-relaxed">
                “Over coffee at Lavelle Road, we realized the core paradox: Bengaluru has tens of thousands of skilled cooks eager for higher pay and flexible hours, while households and restaurants are constantly stranded without immediate help. The missing piece was a real-time, verified platform with live geospatial dispatch and escrow guarantees.”
              </div>
              <p className="text-sm text-neutral-300 leading-relaxed">
                Together, Ram and Sateesh launched the initial 50-chef pilot in Indiranagar. By prioritizing chef dignity with instant UPI payouts and enforcing rigorous UIDAI and police background checks, word spread quickly. Today, ChefPulse is Bangalore’s premier culinary network.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: VALUES & MISSION */}
        {activeTab === 'values' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
            <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  1
                </div>
                <h3 className="text-base font-bold text-white">Chef Dignity & Fair Wages</h3>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Traditional agencies take up to 40% commissions. ChefPulse ensures 85%+ of booking revenue goes directly into the chef's bank account with immediate post-service payouts and zero delays.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  2
                </div>
                <h3 className="text-base font-bold text-white">Government-Vetted Trust</h3>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Inviting someone into your family kitchen requires absolute safety. Sateesh’s governance protocol mandates Aadhaar biometric checks, State Police criminal checks, and FSSAI health certifications.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                  3
                </div>
                <h3 className="text-base font-bold text-white">Sub-30 Minute Hyper-Local Speed</h3>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Food emergencies don’t wait. Ram’s spatial routing algorithm pairs you with the closest verified cook within 1 to 5 km, guaranteeing rapid transit and arrival before guests ring the doorbell.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                  4
                </div>
                <h3 className="text-base font-bold text-white">Culinary Artistry & Heritage</h3>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                From authentic Chettinad and Awadhi dum banquets to keto wellness bowls and live Neapolitan pizza, we celebrate India's deep gastronomic heritage alongside modern lifestyle diets.
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: PAN-INDIA ROADMAP */}
        {activeTab === 'roadmap' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-neutral-800 space-y-6 animate-in fade-in">
            <h3 className="text-xl font-black text-white">
              The 2026–2027 Expansion Blueprint
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-neutral-950/60 border border-neutral-800 space-y-2">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">Phase 1 (Active)</div>
                <h4 className="text-base font-bold text-white">Bengaluru Saturation</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Deepening network density in Indiranagar, Koramangala, HSR Layout, Whitefield, Lavelle Road, and North Bengaluru. 1,200+ active culinary professionals.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-950/60 border border-neutral-800 space-y-2">
                <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">Phase 2 (Q4 2026)</div>
                <h4 className="text-base font-bold text-white">Mumbai & Hyderabad Launch</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Bringing on-demand SOS chefs and luxury banquet catering to Bandra, Juhu, BKC, HITEC City, and Jubilee Hills with specialized regional culinary brigades.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-950/60 border border-neutral-800 space-y-2">
                <div className="text-xs font-bold text-purple-400 uppercase tracking-wider">Phase 3 (2027)</div>
                <h4 className="text-base font-bold text-white">ChefPulse Hospitality Cloud</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Enterprise workforce management SaaS for luxury hotel chains, cloud kitchens, and resort banqueting with AI shift-demand prediction and FSSAI audit sync.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: DIRECT FOUNDERS' DESK */}
        {activeTab === 'contact' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-neutral-800 animate-in fade-in">
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
                  Direct Channel
                </span>
                <h3 className="text-2xl font-black text-white mt-1">
                  Message the Founders’ Executive Office
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                  Whether you are a hospitality partner, prospective investor, culinary master, or corporate host, Ram Jagadish & Sateesh Chitturi personally review all inquiries.
                </p>
              </div>

              {submittedSuccess ? (
                <div className="p-6 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h4 className="text-lg font-black text-white">Message Dispatched to Leadership</h4>
                  <p className="text-xs text-neutral-300 max-w-md mx-auto">
                    Thank you, <strong className="text-white">{contactName}</strong>. Your correspondence has been directed to{' '}
                    <strong className="text-amber-400">
                      {contactRecipient === 'both' ? 'Ram Jagadish & Sateesh Chitturi' : contactRecipient === 'ram' ? 'Ram Jagadish (CEO)' : 'Sateesh Chitturi (Director)'}
                    </strong>
                    . The Founders' Office typically responds within 4 business hours.
                  </p>
                  <button
                    onClick={() => {
                      setSubmittedSuccess(false);
                      setContactName('');
                      setContactEmail('');
                      setContactMessage('');
                    }}
                    className="px-4 py-2 rounded-xl bg-neutral-800 text-white text-xs font-bold hover:bg-neutral-700 transition-colors"
                  >
                    Send Another Note
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitContact} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-1">
                        Direct To
                      </label>
                      <select
                        value={contactRecipient}
                        onChange={(e) => setContactRecipient(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-xs focus:outline-none focus:border-amber-400"
                      >
                        <option value="both">Both Ram Jagadish & Sateesh Chitturi</option>
                        <option value="ram">Ram Jagadish — Founder & CEO</option>
                        <option value="sateesh">Sateesh Chitturi — Co-Founder & Director</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-1">
                        Subject Matter
                      </label>
                      <select
                        value={contactSubject}
                        onChange={(e) => setContactSubject(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-xs focus:outline-none focus:border-amber-400"
                      >
                        <option value="partnership">Hospitality / B2B Partnership</option>
                        <option value="investment">Investor Relations / Capital</option>
                        <option value="enterprise_hiring">High-Volume Catering / Event Inquiry</option>
                        <option value="press">Press, Keynote & Media</option>
                        <option value="other">Executive Feedback / General</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-1">
                        Your Full Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Vikramaditya Singhania"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-1">
                        Official Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. vikram@hospitalitygroup.in"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">
                      Message / Proposal Details
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Share your goals, venue scale, partnership proposal, or questions for Ram & Sateesh..."
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Transmitting to Executive Desk...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-neutral-950" />
                        <span>Send Direct Note to Leadership</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </section>

      {/* 4. EXECUTIVE BRIEFING / COMPANY DECK MODAL */}
      {showDeckModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl bg-neutral-900 border border-neutral-700 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Confidential Executive Briefing
                </span>
                <h3 className="text-xl font-black text-white mt-2">
                  ChefPulse Platform Memorandum
                </h3>
                <p className="text-xs text-neutral-400">
                  Presented by Ram Jagadish (Founder & CEO) & Sateesh Chitturi (Co-founder & Director)
                </p>
              </div>
              <button
                onClick={() => setShowDeckModal(false)}
                className="w-8 h-8 rounded-full bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-neutral-300">
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="font-bold text-amber-400 uppercase tracking-wide text-[11px]">
                  1. The Opportunity & Market Dynamics
                </div>
                <p className="text-neutral-400">
                  India’s food services and domestic culinary sector represents a $65B opportunity. In high-density tech hubs like Bengaluru, the dual phenomena of long work hours and frequent home entertaining has created immense demand for reliable on-demand culinary services.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="font-bold text-blue-400 uppercase tracking-wide text-[11px]">
                  2. Competitive Moat & Verification Advantage
                </div>
                <p className="text-neutral-400">
                  ChefPulse's competitive moat is anchored in the 4-tier government background check engine designed by Sateesh Chitturi, combined with Ram Jagadish’s spatial dispatch architecture that guarantees sub-25 minute arrivals.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="font-bold text-emerald-400 uppercase tracking-wide text-[11px]">
                  3. Sustainable Unit Economics
                </div>
                <p className="text-neutral-400">
                  By operating with a lean 12–15% take-rate, chefs take home substantially higher wages than traditional unorganized employment, lowering churn to under 4% while creating strong network effects.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-800 flex items-center justify-between gap-3">
              <span className="text-[11px] text-neutral-500">Document Hash: CP-BLR-EXEC-2026-v4</span>
              <button
                onClick={() => setShowDeckModal(false)}
                className="px-4 py-2 rounded-xl bg-amber-500 text-neutral-950 font-black text-xs hover:bg-amber-400 transition-colors"
              >
                Close Memo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. CALL TO ACTION FOOTER BANNER */}
      <section className="rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/40 border border-amber-500/20 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white">Experience ChefPulse in Action</h3>
          <p className="text-xs text-neutral-400">
            Book an on-demand chef in your Bangalore neighborhood or explore our B2B commercial kitchen staffing network.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateToCustomer('home_services')}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs transition-all shadow-md shadow-amber-500/20"
          >
            Explore Customer App
          </button>
          <button
            onClick={onNavigateToChefApp}
            className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs transition-all border border-neutral-700"
          >
            Join as a Chef
          </button>
        </div>
      </section>

      {/* Founder Photo Upload & Replacement Modal */}
      {uploadModalFounder && (
        <FounderPhotoUploadModal
          isOpen={true}
          onClose={() => setUploadModalFounder(null)}
          founder={uploadModalFounder}
          currentPhoto={uploadModalFounder === 'ram' ? ramPhoto : sateeshPhoto}
          onPhotoUpdated={(newPhoto) => {
            if (uploadModalFounder === 'ram') setRamPhoto(newPhoto);
            else setSateeshPhoto(newPhoto);
          }}
        />
      )}

    </div>
  );
};
