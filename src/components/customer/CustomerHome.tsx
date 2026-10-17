import React from 'react';
import { CityInfo } from '../../types';
import { INDIAN_CITIES } from '../../data/indianCities';
import {
  ArrowRight, BriefcaseBusiness, ChefHat, Clock3, Heart, MapPin, Search,
  ShieldCheck, Sparkles, UtensilsCrossed, UsersRound, CheckCircle2, CalendarDays,
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
  { key: 'home_services' as const, Icon: ChefHat, label: 'Cook at home', note: 'A chef comes to you', tone: 'green' },
  { key: 'catering' as const, Icon: UtensilsCrossed, label: 'Catering', note: 'For parties & events', tone: 'orange' },
  { key: 'b2b_hire' as const, Icon: BriefcaseBusiness, label: 'Hire a chef', note: 'Ongoing kitchen help', tone: 'purple' },
];

const moments = [
  {
    key: 'home_services' as const,
    title: 'Dinner at home',
    subtitle: 'A chef, your kitchen, your menu.',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=900&q=85',
    tone: 'green',
  },
  {
    key: 'catering' as const,
    title: 'Make the occasion special',
    subtitle: 'Thoughtful food for the people you invite.',
    image: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=85',
    tone: 'orange',
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
  const onlineLabel = activeChefsCount > 0 ? `${activeChefsCount} available now` : 'Check availability';

  return (
    <div className="chef-home mx-auto w-full max-w-2xl pb-28 animate-in fade-in duration-300">
      <header className="chef-topbar">
        <div className="chef-location-pill">
          <span className="location-pin"><MapPin size={15} /></span>
          <div className="min-w-0">
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[.08em]">Your kitchen</p>
            <p className="text-xs font-extrabold text-slate-900 truncate">{selectedAreaName}, {selectedCity.name}</p>
          </div>
          <span className="live-status"><span className="live-dot" /> {onlineLabel}</span>
        </div>
        <button type="button" onClick={onOpenAuth} className="chef-avatar-button" aria-label="Open your ChefPulse account">
          <UsersRound size={18} />
        </button>
      </header>

      <section className="chef-hero-v2 mt-3" aria-label="Find a personal chef">
        <img
          className="chef-hero-v2-image"
          src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=88"
          alt="Chef preparing a fresh meal in a kitchen"
        />
        <div className="chef-hero-v2-overlay" />
        <div className="chef-hero-v2-content">
          <div className="chef-hero-v2-brand"><span className="chef-brand-dot"><ChefHat size={16} /></span> ChefPulse</div>
          <div className="chef-hero-v2-kicker"><Sparkles size={12} /> Food made personal</div>
          <h1>Your kitchen.<br /><span>Your chef.</span></h1>
          <p>From tonight's dinner to your next big celebration, tell us what you need and we will help you get started.</p>
          <button type="button" onClick={() => onSelectOption('home_services')} className="chef-primary-cta">
            Find a chef <ArrowRight size={17} />
          </button>
        </div>
      </section>

      <section className="chef-search-v2 mt-3" aria-label="Chef search">
        <button type="button" onClick={() => onSelectOption('home_services')} className="chef-search w-full h-14 rounded-2xl px-4 flex items-center gap-3 text-left" aria-label="Start finding a chef">
          <span className="chef-search-icon"><Search size={19} /></span>
          <span className="text-sm text-slate-500 flex-1">What do you want to cook?</span>
          <span className="chef-filter"><ArrowRight size={16} /></span>
        </button>
      </section>

      <section className="mt-6">
        <div className="section-heading">
          <div><h2>What do you need?</h2><p>Start in one tap</p></div>
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
          <div><h2>Made for your moment</h2><p>Whether it is tonight or next month</p></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {moments.map((card) => (
            <button key={card.title} type="button" onClick={() => onSelectOption(card.key)} className="chef-feature-card text-left" aria-label={card.title}>
              <div className="chef-feature-image">
                <img src={card.image} alt="" loading="lazy" />
                <span className={`chef-feature-badge chef-feature-badge-${card.tone}`}>{card.tone === 'green' ? 'Everyday' : 'Celebrations'}</span>
              </div>
              <div className="p-3.5"><div className="text-sm font-extrabold text-slate-900">{card.title}</div><div className="text-[10px] text-slate-500 mt-1 leading-relaxed">{card.subtitle}</div></div>
            </button>
          ))}
        </div>
      </section>

      <section className="chef-how mt-6">
        <div className="section-heading"><div><h2>How ChefPulse works</h2><p>Designed to keep things simple</p></div></div>
        <div className="chef-steps">
          <div><span>1</span><div><b>Tell us what you need</b><small>Choose your service, time and location.</small></div></div>
          <div><span>2</span><div><b>Review the chef request</b><small>See the details before you confirm.</small></div></div>
          <div><span>3</span><div><b>Enjoy the experience</b><small>Track your booking from start to finish.</small></div></div>
        </div>
      </section>

      <section className="chef-value-grid mt-5" aria-label="Why ChefPulse">
        <div><span><ShieldCheck size={16} /></span><b>Clear & transparent</b><small>Know what you are booking.</small></div>
        <div><span><CalendarDays size={16} /></span><b>Built around you</b><small>Book for now or plan ahead.</small></div>
        <div><span><Heart size={16} /></span><b>Made for real homes</b><small>A simpler way to get help in the kitchen.</small></div>
      </section>

      <section className="chef-trust mt-5 rounded-2xl px-3.5 py-3 flex items-center gap-3">
        <span className="chef-trust-icon"><CheckCircle2 size={17} /></span>
        <div className="min-w-0 flex-1"><div className="text-[11px] font-extrabold text-slate-900">Your choice. Your kitchen. Your control.</div><div className="text-[9px] text-slate-500">Clear steps · Simple booking · Support when you need it</div></div>
      </section>

      <nav className="chef-mobile-nav md:hidden" aria-label="Main navigation">
        <button className="active" type="button"><ChefHat size={18} /><span>Home</span></button>
        <button type="button" onClick={() => onSelectOption('home_services')}><Search size={18} /><span>Find a chef</span></button>
        <button type="button" onClick={onOpenActiveBooking}><Clock3 size={18} /><span>Bookings</span></button>
        <button type="button" onClick={onOpenAuth}><UsersRound size={18} /><span>Account</span></button>
      </nav>
    </div>
  );
};
