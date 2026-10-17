import React from 'react';
import { CityInfo } from '../../types';
import { INDIAN_CITIES } from '../../data/indianCities';
import {
  ArrowRight, BriefcaseBusiness, ChefHat, Clock3, Heart, Search, ShieldCheck,
  Sparkles, Star, UtensilsCrossed, UsersRound, MapPin
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
  { key: 'home_services' as const, Icon: ChefHat, label: 'Chef Now', note: 'A chef at your home', tone: 'green' },
  { key: 'catering' as const, Icon: UtensilsCrossed, label: 'Catering', note: 'For special occasions', tone: 'orange' },
  { key: 'b2b_hire' as const, Icon: BriefcaseBusiness, label: 'Hire a Chef', note: 'Homes, events & business', tone: 'purple' },
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
      <section className="chef-home-location pt-1">
        <div className="flex items-center gap-2 min-w-0">
          <span className="location-pin"><MapPin size={15} /></span>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-500 font-semibold">Your location</p>
            <p className="text-sm font-extrabold text-slate-900 truncate">{selectedAreaName}, {selectedCity.name}</p>
          </div>
          <span className="ml-auto flex items-center gap-1 text-[10px] font-bold text-emerald-700 whitespace-nowrap">
            <span className="live-dot" /> {activeChefsCount} chefs online
          </span>
        </div>
      </section>

      <section className="chef-hero mt-4 rounded-[28px] overflow-hidden relative">
        <div className="chef-hero-pattern" />
        <div className="chef-hero-glow" />
        <div className="relative z-10 p-5 sm:p-7">
          <div className="chef-hero-brand">
            <span className="chef-hero-logo"><img src="/icon.svg" alt="" /></span>
            <span>ChefPulse</span>
          </div>
          <h1 className="mt-4 text-[30px] sm:text-4xl font-black leading-[1.03] tracking-tight text-white max-w-[300px]">
            Your personal chef.<br /><span>Just a tap away.</span>
          </h1>
          <p className="mt-3 text-sm text-white/75 leading-relaxed max-w-[360px]">
            Request a chef, get matched nearby, order ingredients and track everything in one place.
          </p>
          <button type="button" onClick={() => onSelectOption('home_services')} className="chef-hero-button mt-5 h-12 px-5 rounded-xl font-extrabold text-sm flex items-center gap-2">
            Find my chef <ArrowRight size={17} />
          </button>
        </div>
        <div className="chef-hero-dish" aria-hidden="true"><ChefHat size={72} strokeWidth={1.35} /></div>
      </section>

      <section className="mt-4">
        <button type="button" onClick={() => onSelectOption('home_services')} className="chef-search w-full h-14 rounded-2xl px-4 flex items-center gap-3 text-left">
          <span className="chef-search-icon"><Search size={19} /></span>
          <span className="text-sm text-slate-500 flex-1">What do you need today?</span>
          <span className="chef-filter"><Sparkles size={16} /></span>
        </button>
      </section>

      <section className="mt-5">
        <div className="grid grid-cols-3 gap-2.5">
          {categories.map(({ key, Icon, label, note, tone }) => (
            <button key={key} type="button" onClick={() => onSelectOption(key)} className={`chef-category chef-category-${tone} rounded-2xl p-3 text-center`}>
              <span className="chef-category-icon mx-auto"><Icon size={23} strokeWidth={2.1} /></span>
              <span className="block text-xs font-extrabold text-slate-900 mt-2">{label}</span>
              <span className="block text-[9px] text-slate-500 leading-tight mt-1">{note}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <div className="flex items-end justify-between mb-3 px-0.5">
          <div>
            <h2 className="text-lg font-black text-slate-900">Popular near you</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Fresh food, chefs and groceries — together</p>
          </div>
          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">See all <ArrowRight size={13} /></span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => onSelectOption('home_services')} className="chef-service-card text-left rounded-2xl overflow-hidden">
            <div className="chef-service-photo chef-service-home"><UtensilsCrossed size={31} /><span><Star size={10} fill="currentColor" /> 4.9</span></div>
            <div className="p-3"><div className="text-sm font-extrabold text-slate-900">Chef Now · Indian home cooking</div><div className="text-[10px] text-slate-500 mt-1">Chef + ingredients delivered to your home</div></div>
          </button>
          <button type="button" onClick={() => onSelectOption('catering')} className="chef-service-card text-left rounded-2xl overflow-hidden">
            <div className="chef-service-photo chef-service-party"><UsersRound size={31} /><span><Clock3 size={10} /> Events</span></div>
            <div className="p-3"><div className="text-sm font-extrabold text-slate-900">Party & catering</div><div className="text-[10px] text-slate-500 mt-1">Birthdays, weddings & more</div></div>
          </button>
        </div>
      </section>

      <section className="chef-trust mt-5 rounded-2xl px-3.5 py-3 flex items-center gap-3">
        <span className="chef-trust-icon"><ShieldCheck size={17} /></span>
        <div className="min-w-0 flex-1"><div className="text-[11px] font-extrabold text-slate-900">Simple, clear & trusted</div><div className="text-[9px] text-slate-500">Clear pricing · Safer bookings · Real chefs</div></div>
        <Heart size={15} className="text-emerald-600" fill="currentColor" />
      </section>

      <nav className="chef-mobile-nav md:hidden" aria-label="Main navigation">
        <button className="active"><ChefHat size={18} /><span>Home</span></button>
        <button onClick={() => onSelectOption('home_services')}><Search size={18} /><span>Explore</span></button>
        <button onClick={onOpenActiveBooking}><Clock3 size={18} /><span>Bookings</span></button>
        <button onClick={onOpenAuth}><UsersRound size={18} /><span>Account</span></button>
      </nav>
    </div>
  );
};
