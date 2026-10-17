import React from 'react';
import { CityInfo } from '../../types';
import { INDIAN_CITIES } from '../../data/indianCities';
import {
  ArrowRight, BriefcaseBusiness, ChefHat, Clock3, Heart, MapPin, Search,
  ShieldCheck, Sparkles, Star, UtensilsCrossed, UsersRound, CheckCircle2,
} from 'lucide-react';

interface CustomerHomeProps {
  onSelectOption: (option: 'home_services' | 'catering' | 'b2b_hire') => void;
  activeChefsCount: number;
  selectedCity?: CityInfo;
  selectedAreaName: string;
  onOpenAuth: () => void;
  onOpenActiveBooking: () => void;
}

const categories = [
  { key: 'home_services' as const, Icon: ChefHat, label: 'Chef Now', note: 'Cook at your home', tone: 'green' },
  { key: 'catering' as const, Icon: UtensilsCrossed, label: 'Catering', note: 'Parties & occasions', tone: 'orange' },
  { key: 'b2b_hire' as const, Icon: BriefcaseBusiness, label: 'Hire a Chef', note: 'Longer-term help', tone: 'purple' },
];

const featureCards = [
  {
    key: 'home_services' as const,
    title: 'Chef Now',
    subtitle: 'A chef comes to you',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=900&q=85',
    badge: 'Popular',
  },
  {
    key: 'catering' as const,
    title: 'Made for your moments',
    subtitle: 'Beautiful food for every gathering',
    image: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=85',
    badge: 'Events',
  },
];

export const CustomerHome: React.FC<CustomerHomeProps> = ({
  onSelectOption,
  activeChefsCount,
  selectedCity = INDIAN_CITIES[0],
  selectedAreaName,
  onOpenAuth,
  onOpenActiveBooking,
}) => {
  return (
    <div className="chef-home mx-auto w-full max-w-2xl pb-28 animate-in fade-in duration-300">
      <header className="chef-topbar">
        <div className="chef-location-pill">
          <span className="location-pin"><MapPin size={15} /></span>
          <div className="min-w-0">
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[.08em]">Delivering to</p>
            <p className="text-xs font-extrabold text-slate-900 truncate">{selectedAreaName}, {selectedCity.name}</p>
          </div>
          <span className="live-status"><span className="live-dot" /> {activeChefsCount} online</span>
        </div>
        <button type="button" onClick={onOpenAuth} className="chef-avatar-button" aria-label="Open account">
          <UsersRound size={18} />
        </button>
      </header>

      <section className="chef-hero-v2 mt-3">
        <img
          className="chef-hero-v2-image"
          src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=88"
          alt="Chef preparing a fresh meal"
        />
        <div className="chef-hero-v2-overlay" />
        <div className="chef-hero-v2-content">
          <div className="chef-hero-v2-brand"><span className="chef-brand-dot"><ChefHat size={16} /></span> ChefPulse</div>
          <div className="chef-hero-v2-kicker"><Sparkles size={12} /> Your kitchen, your way</div>
          <h1>Good food.<br /><span>Great chef.</span></h1>
          <p>Tell us what you want. We find an available chef nearby and bring the whole experience together.</p>
          <button type="button" onClick={() => onSelectOption('home_services')} className="chef-primary-cta">
            Find a chef <ArrowRight size={17} />
          </button>
        </div>
      </section>

      <section className="chef-search-v2 mt-3">
        <button type="button" onClick={() => onSelectOption('home_services')} className="chef-search w-full h-14 rounded-2xl px-4 flex items-center gap-3 text-left">
          <span className="chef-search-icon"><Search size={19} /></span>
          <span className="text-sm text-slate-500 flex-1">What would you like to cook today?</span>
          <span className="chef-filter"><Sparkles size={16} /></span>
        </button>
      </section>

      <section className="mt-5">
        <div className="section-heading">
          <div><h2>What are you looking for?</h2><p>Choose in one tap</p></div>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {categories.map(({ key, Icon, label, note, tone }) => (
            <button key={key} type="button" onClick={() => onSelectOption(key)} className={`chef-category chef-category-${tone} rounded-2xl p-3 text-left`}>
              <span className="chef-category-icon"><Icon size={22} strokeWidth={2.1} /></span>
              <span className="block text-xs font-extrabold text-slate-900 mt-2">{label}</span>
              <span className="block text-[9px] text-slate-500 leading-tight mt-1">{note}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <div className="section-heading">
          <div><h2>Made for you</h2><p>Simple services, beautifully done</p></div>
          <span className="section-link">Explore <ArrowRight size={13} /></span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {featureCards.map((card) => (
            <button key={card.title} type="button" onClick={() => onSelectOption(card.key)} className="chef-feature-card text-left">
              <div className="chef-feature-image">
                <img src={card.image} alt="" loading="lazy" />
                <span className="chef-feature-badge">{card.badge}</span>
                <span className="chef-feature-rating"><Star size={10} fill="currentColor" /> 4.9</span>
              </div>
              <div className="p-3.5"><div className="text-sm font-extrabold text-slate-900">{card.title}</div><div className="text-[10px] text-slate-500 mt-1 leading-relaxed">{card.subtitle}</div></div>
            </button>
          ))}
        </div>
      </section>

      <section className="chef-how mt-6">
        <div className="section-heading"><div><h2>ChefPulse in 3 easy steps</h2><p>No complicated setup</p></div></div>
        <div className="chef-steps">
          <div><span>1</span><div><b>Tell us what you need</b><small>Food, time and location</small></div></div>
          <div><span>2</span><div><b>Meet your nearby chef</b><small>See the request and price clearly</small></div></div>
          <div><span>3</span><div><b>Relax while we track it</b><small>From arrival to cooking complete</small></div></div>
        </div>
      </section>

      <section className="chef-trust mt-5 rounded-2xl px-3.5 py-3 flex items-center gap-3">
        <span className="chef-trust-icon"><ShieldCheck size={17} /></span>
        <div className="min-w-0 flex-1"><div className="text-[11px] font-extrabold text-slate-900">Clear, simple & trusted</div><div className="text-[9px] text-slate-500">Clear pricing · Safer bookings · Real chefs</div></div>
        <CheckCircle2 size={16} className="text-emerald-600" />
      </section>

      <nav className="chef-mobile-nav md:hidden" aria-label="Main navigation">
        <button className="active"><ChefHat size={18} /><span>Home</span></button>
        <button onClick={() => onSelectOption('home_services')}><Search size={18} /><span>Find a chef</span></button>
        <button onClick={onOpenActiveBooking}><Clock3 size={18} /><span>Bookings</span></button>
        <button onClick={onOpenAuth}><UsersRound size={18} /><span>Account</span></button>
      </nav>
    </div>
  );
};
