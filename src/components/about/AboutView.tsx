import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Award,
  Users,
  Clock,
  Building2,
  MapPin,
  Star,
  ChefHat,
  ArrowRight,
  FileText,
  Mail,
  Linkedin,
  Twitter,
  CheckCircle2,
  HeartHandshake,
  Send,
  Zap,
  Camera,
} from 'lucide-react';
import { INDIAN_CITIES } from '../../data/indianCities';
import { CityInfo, CityArea } from '../../types';
import { getFounderPhoto } from '../../utils/founderPhotos';
import { FounderPhotoUploadModal } from '../common/FounderPhotoUploadModal';

interface AboutViewProps {
  onNavigateToCustomer: (subOption?: 'home_services' | 'catering' | 'b2b_hire') => void;
  onNavigateToChefApp: () => void;
  selectedCity?: CityInfo;
  selectedArea?: CityArea;
  onQuickSwitchCity?: (cityId: string) => void;
  onOpenCitySelector?: () => void;
  onOpenChefSignup?: () => void;
  onOpenVerificationSimulator?: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({
  onNavigateToCustomer,
  onNavigateToChefApp,
  selectedCity = INDIAN_CITIES[0],
  selectedArea,
  onQuickSwitchCity,
  onOpenCitySelector,
  onOpenChefSignup,
  onOpenVerificationSimulator,
}) => {
  const [activeTab, setActiveTab] = useState<'network' | 'founders' | 'safety' | 'partners'>('network');
  const [selectedLeader, setSelectedLeader] = useState<'both' | 'ram' | 'sateesh'>('both');

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

  // Contact the Founders Desk State
  const [contactRecipient, setContactRecipient] = useState<'both' | 'ram' | 'sateesh'>('both');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [showDeckModal, setShowDeckModal] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedSuccess(true);
    }, 700);
  };

  const popularCities = INDIAN_CITIES.slice(0, 10);

  return (
    <div className="space-y-10 animate-in fade-in duration-300 pb-16">
      
      {/* 1. TOP HEADER & PAN-INDIA NETWORK HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/40 border border-neutral-800 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>About ChefPulse • Pan-India Culinary Network • {selectedCity.name} Hub</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            India&rsquo;s On-Demand Chef Network in Every City.
          </h1>
          
          <p className="mt-3 text-sm sm:text-base text-neutral-300 leading-relaxed">
            ChefPulse is India&rsquo;s premier two-sided culinary marketplace. We empower homeowners with 20-minute SOS dinner cooks, curate luxury banquets and destination catering for high-profile gatherings, and supply certified emergency shift relief to high-volume restaurants across 25+ cities.
          </p>

          {/* Quick City Switcher Strip */}
          <div className="mt-6 pt-5 border-t border-neutral-800/80">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>📍 Quick City Switch:</span>
              </span>
              {onOpenCitySelector && (
                <button
                  type="button"
                  onClick={onOpenCitySelector}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Explore All 25+ Cities</span>
                  <span>→</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
              {popularCities.map((c) => {
                const isActive = c.id === selectedCity.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onQuickSwitchCity?.(c.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                        : 'bg-neutral-800/90 text-neutral-300 hover:text-white hover:bg-neutral-700 border border-neutral-700/60'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className="text-[9px] font-mono opacity-80">({c.code})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateToCustomer()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
            >
              <span>Explore The 3 Service Pathways</span>
              <ArrowRight size={14} />
            </button>
            <button
              onClick={() => setShowDeckModal(true)}
              className="px-4 py-2.5 rounded-xl bg-neutral-800/90 hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <FileText size={14} className="text-amber-400" />
              <span>Executive Briefing Deck</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. TRUST & OPERATING GUARANTEE METRICS */}
      <section className="rounded-3xl bg-neutral-900/60 border border-neutral-800 p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="p-3">
          <div className="text-2xl sm:text-3xl font-black text-amber-400">100%</div>
          <div className="text-xs font-bold text-white mt-1">CCTNS Police & Hygiene Vetted</div>
          <div className="text-[11px] text-neutral-400 mt-0.5">UIDAI & State Police clearance</div>
        </div>
        <div className="p-3">
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">22 min</div>
          <div className="text-xs font-bold text-white mt-1">Average SOS Dispatch</div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Rapid live map matching within 5 km</div>
        </div>
        <div className="p-3">
          <div className="text-2xl sm:text-3xl font-black text-cyan-400">25+ Hubs</div>
          <div className="text-xs font-bold text-white mt-1">Live Cities Across India</div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Pan-India regional geofences</div>
        </div>
        <div className="p-3">
          <div className="text-2xl sm:text-3xl font-black text-purple-400">4.94 ★</div>
          <div className="text-xs font-bold text-white mt-1">Pan-India Dining Rating</div>
          <div className="text-[11px] text-neutral-400 mt-0.5">From 48,000+ completed bookings</div>
        </div>
      </section>

      {/* 3. SECTION NAVIGATION PILLS */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-3 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('network')}
          className={`px-4 py-2 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'network'
              ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
              : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          🌐 Network & Model
        </button>
        <button
          onClick={() => setActiveTab('founders')}
          className={`px-4 py-2 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'founders'
              ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
              : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          👥 Founders (Ram & Sateesh)
        </button>
        <button
          onClick={() => setActiveTab('safety')}
          className={`px-4 py-2 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'safety'
              ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
              : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          🛡️ Safety & 4-Tier Verification
        </button>
        <button
          onClick={() => setActiveTab('partners')}
          className={`px-4 py-2 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'partners'
              ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
              : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          👨‍🍳 Chef Partner Community
        </button>
      </div>

      {/* 4. TAB CONTENT: NETWORK & BUSINESS MODEL */}
      {activeTab === 'network' && (
        <div className="space-y-6">
          <div className="rounded-3xl bg-neutral-900 border border-neutral-800 p-6 sm:p-8 space-y-4">
            <h2 className="text-2xl font-black text-white">The Three-Pillar Architecture</h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-3xl">
              Unlike traditional food delivery apps that ship lukewarm prepared meals in boxes, ChefPulse delivers the culinary talent directly into the kitchen. We segregate our platform into three focused user journeys:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-3">
              <div
                onClick={() => onNavigateToCustomer('home_services')}
                className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-amber-500/50 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl mb-3">
                  ⚡
                </div>
                <div className="text-[10px] font-bold text-amber-400 uppercase">Pillar 1</div>
                <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors mt-0.5">
                  Home Services
                </h3>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                  SOS Quick-Fix dinners (20-min arrival) & scheduled healthy weekly meal prep. Smart Zepto/Blinkit grocery deep-links for instant ingredient arrival.
                </p>
                <div className="mt-4 text-xs font-bold text-amber-400 flex items-center gap-1">
                  <span>Enter Home Services</span>
                  <span>→</span>
                </div>
              </div>

              <div
                onClick={() => onNavigateToCustomer('catering')}
                className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-purple-500/50 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-xl mb-3">
                  🥂
                </div>
                <div className="text-[10px] font-bold text-purple-400 uppercase">Pillar 2</div>
                <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors mt-0.5">
                  Catering Service
                </h3>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                  Curated banquet inquiry wizard for 15+ guests. High-res plated food portfolios, live sigri BBQ stations, and bespoke executive quotes.
                </p>
                <div className="mt-4 text-xs font-bold text-purple-400 flex items-center gap-1">
                  <span>Design Banquet</span>
                  <span>→</span>
                </div>
              </div>

              <div
                onClick={() => onNavigateToCustomer('b2b_hire')}
                className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-blue-500/50 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-xl mb-3">
                  🏨
                </div>
                <div className="text-[10px] font-bold text-blue-400 uppercase">Pillar 3</div>
                <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors mt-0.5">
                  Hire Chef (B2B)
                </h3>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                  Hospitality staffing portal for hotels, breweries, and cloud kitchens. Instant relief gig cooks + verified permanent executive recruitment.
                </p>
                <div className="mt-4 text-xs font-bold text-blue-400 flex items-center gap-1">
                  <span>Enter B2B Portal</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB CONTENT: FOUNDERS & LEADERSHIP */}
      {activeTab === 'founders' && (
        <div className="space-y-8">
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
                Combining high-throughput technology architecture with deep hospitality operations and compliance.
              </p>
            </div>

            <div className="flex items-center bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-xs">
              <button
                onClick={() => setSelectedLeader('both')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedLeader === 'both' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Both Leaders
              </button>
              <button
                onClick={() => setSelectedLeader('ram')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedLeader === 'ram' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Ram Jagadish (CEO)
              </button>
              <button
                onClick={() => setSelectedLeader('sateesh')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedLeader === 'sateesh' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Sateesh Chitturi (Director)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* RAM JAGADISH */}
            {(selectedLeader === 'both' || selectedLeader === 'ram') && (
              <div className="rounded-3xl bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 p-6 sm:p-7 flex flex-col justify-between transition-all group">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="relative group/avatar">
                      <img
                        src={ramPhoto}
                        alt="Ram Jagadish, Founder and CEO"
                        referrerPolicy="no-referrer"
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-amber-500/40 ring-1 ring-amber-500/20 shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setUploadModalFounder('ram')}
                        className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center text-amber-400 text-[10px] font-bold transition-opacity cursor-pointer backdrop-blur-[2px]"
                        title="Upload / Change Photo for Ram Jagadish"
                      >
                        <Camera size={16} className="mb-0.5" />
                        <span>Edit Photo</span>
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-black uppercase">
                        Founder & CEO
                      </span>
                      <div className="text-[11px] text-neutral-400 mt-1">Bengaluru, India</div>
                      <button
                        type="button"
                        onClick={() => setUploadModalFounder('ram')}
                        className="mt-2 text-[10px] font-bold text-amber-400/90 hover:text-amber-300 flex items-center gap-1 ml-auto cursor-pointer bg-neutral-800/80 hover:bg-neutral-800 px-2.5 py-1 rounded-lg border border-neutral-700/60"
                      >
                        <Camera size={11} />
                        <span>Change Photo</span>
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-white mt-4 group-hover:text-amber-400 transition-colors">
                    Ram Jagadish
                  </h3>
                  <div className="text-xs text-neutral-400 font-medium">Chief Executive Officer & Product Lead</div>

                  <p className="text-xs text-neutral-300 mt-3 leading-relaxed">
                    Ram spearheads ChefPulse&rsquo;s product vision, real-time dispatch algorithms, and gig-worker empowerment model. An engineer by training with over a decade scaling hyper-local marketplace logistics, Ram architected our sub-second geofencing engine, digital escrow vault, and automated AI dispute resolution system.
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-neutral-800 flex items-center justify-between text-xs">
                  <span className="text-neutral-400 font-mono">Focus: Platform Scalability & Tech</span>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 hover:underline font-bold"
                  >
                    LinkedIn Profile ↗
                  </a>
                </div>
              </div>
            )}

            {/* SATEESH CHITTURI */}
            {(selectedLeader === 'both' || selectedLeader === 'sateesh') && (
              <div className="rounded-3xl bg-neutral-900 border border-neutral-800 hover:border-blue-500/50 p-6 sm:p-7 flex flex-col justify-between transition-all group">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="relative group/avatar">
                      <img
                        src={sateeshPhoto}
                        alt="Sateesh Chitturi, Co-founder and Director"
                        referrerPolicy="no-referrer"
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-blue-500/40 ring-1 ring-blue-500/20 shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setUploadModalFounder('sateesh')}
                        className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center text-blue-400 text-[10px] font-bold transition-opacity cursor-pointer backdrop-blur-[2px]"
                        title="Upload / Change Photo for Sateesh Chitturi"
                      >
                        <Camera size={16} className="mb-0.5" />
                        <span>Edit Photo</span>
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-black uppercase">
                        Co-Founder & Director
                      </span>
                      <div className="text-[11px] text-neutral-400 mt-1">Hyderabad & Bengaluru</div>
                      <button
                        type="button"
                        onClick={() => setUploadModalFounder('sateesh')}
                        className="mt-2 text-[10px] font-bold text-blue-400/90 hover:text-blue-300 flex items-center gap-1 ml-auto cursor-pointer bg-neutral-800/80 hover:bg-neutral-800 px-2.5 py-1 rounded-lg border border-neutral-700/60"
                      >
                        <Camera size={11} />
                        <span>Change Photo</span>
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-white mt-4 group-hover:text-blue-400 transition-colors">
                    Sateesh Chitturi
                  </h3>
                  <div className="text-xs text-neutral-400 font-medium">Director of Hospitality & Operational Governance</div>

                  <p className="text-xs text-neutral-300 mt-3 leading-relaxed">
                    Sateesh directs ChefPulse&rsquo;s nationwide culinary standards, commercial restaurant partnerships, and 4-tier CCTNS background checking pipeline. With deep roots across luxury hospitality networks, Sateesh oversees vetting for over 1,200 chefs and ensures flawless standards for banquets and Michelin-grade dining.
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-neutral-800 flex items-center justify-between text-xs">
                  <span className="text-neutral-400 font-mono">Focus: Hospitality & Vetting Governance</span>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:underline font-bold"
                  >
                    LinkedIn Profile ↗
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Contact the Founders Desk Form */}
          <div className="rounded-3xl bg-neutral-900 border border-neutral-800 p-6 sm:p-8">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Mail size={18} className="text-amber-400" />
              <span>Direct Executive Inquiry to Founders&rsquo; Desk</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              For high-value catering banquets, multi-property hotel staffing partnerships, or press inquiries.
            </p>

            {submittedSuccess ? (
              <div className="mt-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>Inquiry transmitted directly to Ram Jagadish & Sateesh Chitturi. Executive desk will respond within 4 hours.</span>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <input
                  type="text"
                  placeholder="Your Name"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white placeholder:text-neutral-500"
                />
                <input
                  type="email"
                  placeholder="Your Work Email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white placeholder:text-neutral-500"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send size={14} />
                  <span>{isSubmitting ? 'Transmitting...' : 'Send to Founders'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 6. TAB CONTENT: 4-TIER SAFETY & VERIFICATION */}
      {activeTab === 'safety' && (
        <div className="space-y-6">
          <div className="rounded-3xl bg-neutral-900 border border-neutral-800 p-6 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  <ShieldCheck size={24} className="text-emerald-400" />
                  <span>The 4-Tier Security & Hygiene Pipeline</span>
                </h2>
                <p className="text-xs sm:text-sm text-neutral-300 mt-1">
                  How ChefPulse achieves 100% verified kitchen safety across all 25+ cities in India.
                </p>
              </div>

              {onOpenVerificationSimulator && (
                <button
                  type="button"
                  onClick={onOpenVerificationSimulator}
                  className="px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <span>Launch Gov Audit Simulator</span>
                  <span>→</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3">
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                <div className="text-amber-400 font-bold text-xs">Tier 1: Government ID</div>
                <div className="text-sm font-bold text-white mt-1">Aadhaar OCR & PAN Audit</div>
                <p className="text-[11px] text-neutral-400 mt-2">
                  Automated biometric text match against UIDAI and Income Tax databases with liveness selfie facial verification.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                <div className="text-emerald-400 font-bold text-xs">Tier 2: Police Record</div>
                <div className="text-sm font-bold text-white mt-1">CCTNS Criminal Database</div>
                <p className="text-[11px] text-neutral-400 mt-2">
                  Police Clearance Certificate (PCC) cross-referenced against Crime and Criminal Tracking Network & Systems.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                <div className="text-cyan-400 font-bold text-xs">Tier 3: Food Safety</div>
                <div className="text-sm font-bold text-white mt-1">FSSAI FoSCoS Hygiene</div>
                <p className="text-[11px] text-neutral-400 mt-2">
                  Food Safety and Standards Authority of India commercial catering registration and food handler pathogen screening.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                <div className="text-purple-400 font-bold text-xs">Tier 4: Live Culinary</div>
                <div className="text-sm font-bold text-white mt-1">Live Taste & Knife Audits</div>
                <p className="text-[11px] text-neutral-400 mt-2">
                  Practical cooking assessment by senior sous chefs before radar pin activation, ensuring consistent 5-star palate ratings.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. TAB CONTENT: CHEF PARTNER REGISTRATION */}
      {activeTab === 'partners' && (
        <div className="space-y-6">
          <div className="rounded-3xl bg-neutral-900 border border-amber-500/35 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Gig-Worker Empowerment
                </span>
                <span className="text-xs text-emerald-400 font-bold">Earn ₹35,000 – ₹85,000 / month</span>
              </div>
              <h2 className="text-2xl font-black text-white">
                Become a Verified ChefPulse Partner
              </h2>
              <p className="text-xs text-neutral-300 max-w-2xl leading-relaxed">
                Take charge of your culinary career. Set your own pricing rates for SOS quick-fix visits and recurring meal preps. Enjoy guaranteed 100% upfront digital escrow payments, instant 24/7 bank payouts with zero waiting periods, and multilingual voice-guided dispatch.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              {onOpenChefSignup && (
                <button
                  type="button"
                  onClick={onOpenChefSignup}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-xs shadow-md shadow-amber-500/20 cursor-pointer flex items-center gap-2"
                >
                  <ChefHat size={16} />
                  <span>Register as Chef Partner</span>
                </button>
              )}
              <button
                type="button"
                onClick={onNavigateToChefApp}
                className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs border border-neutral-700 cursor-pointer"
              >
                <span>Launch Chef App Portal</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Briefing Deck Modal */}
      {showDeckModal && (
        <div className="fixed inset-0 z-[2500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-700 rounded-3xl p-6 sm:p-7 shadow-2xl text-neutral-100 space-y-4">
            <button
              onClick={() => setShowDeckModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white text-lg p-1"
            >
              ✕
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
                📄
              </div>
              <div>
                <h3 className="text-base font-bold text-white">ChefPulse Executive Briefing Deck</h3>
                <p className="text-xs text-neutral-400">Pan-India Culinary Marketplace Architecture</p>
              </div>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              The confidential executive deck covers our zero-touch OCR onboarding pipeline, 1 to 5 km geofenced dispatch radius, tiered regional pricing engine across 25+ cities, and digital escrow unit economics.
            </p>
            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs space-y-1.5 font-mono">
              <div className="text-amber-400 font-bold">Key Investor & Executive Highlights:</div>
              <div>• Target Markets: 25 Tier-1 & Tier-2 Indian Metros</div>
              <div>• Average Ticket: SOS ₹850 | Prep ₹1,800 | Catering ₹45,000</div>
              <div>• Take Rate: 15% Platform Commission + Digital Escrow</div>
              <div>• Founders: Ram Jagadish (CEO) & Sateesh Chitturi (Director)</div>
            </div>
            <button
              type="button"
              onClick={() => setShowDeckModal(false)}
              className="w-full py-2.5 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs hover:bg-amber-400"
            >
              Close Briefing Deck
            </button>
          </div>
        </div>
      )}

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
