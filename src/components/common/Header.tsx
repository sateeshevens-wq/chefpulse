import React, { useState } from 'react';
import { User, Booking, CityInfo, CityArea } from '../../types';
import { INDIAN_CITIES } from '../../data/indianCities';
import { PWAInstallButton } from './PWAInstallButton';
import { ChefHat, LogOut, UserCheck, Sparkles, Bell, MapPin } from 'lucide-react';

interface HeaderProps {
  currentRoleView: 'customer' | 'chef' | 'admin' | 'architecture' | 'founders' | 'about';
  onSelectRoleView: (view: 'customer' | 'chef' | 'admin' | 'architecture' | 'founders' | 'about') => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  selectedCity?: CityInfo;
  selectedArea: CityArea;
  onSelectArea?: (area: CityArea) => void;
  onOpenCitySelector?: () => void;
  activeBooking: Booking | null;
  onOpenActiveBooking: () => void;
  unreadCount?: number;
  onOpenNotifications: () => void;
  onOpenChefSignup?: () => void;
  onOpenAIChat?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoleView,
  onSelectRoleView,
  currentUser,
  onOpenAuth,
  selectedCity = INDIAN_CITIES[0],
  selectedArea,
  onOpenCitySelector,
  activeBooking,
  onOpenActiveBooking,
  unreadCount = 0,
  onOpenNotifications,
  onOpenChefSignup,
  onLogout,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className={`sticky top-0 z-50 w-full backdrop-blur-md border-b ${currentRoleView === 'customer' ? 'bg-white/95 border-slate-200/80' : 'bg-neutral-950/95 border-neutral-800/80'}`}>
      <div className="max-w-5xl mx-auto px-3 sm:px-5 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            className="flex items-center gap-2 min-w-0 cursor-pointer"
            onClick={() => onSelectRoleView('customer')}
          >
            <div className="brand-mark h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/15 overflow-hidden">
              <img src="/icon.svg" alt="ChefPulse" className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 text-left">
              <div className={`font-extrabold text-sm sm:text-base ${currentRoleView === 'customer' ? 'text-slate-900' : 'text-white'} tracking-tight`}>ChefPulse</div>
              <div className="text-[9px] sm:text-[10px] text-neutral-500 truncate max-w-[170px]">{selectedArea.label}, {selectedCity.name}</div>
            </div>
          </button>

          <div className="hidden md:flex items-center gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
            <button
              type="button"
              onClick={() => onSelectRoleView('customer')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${currentRoleView === 'customer' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-400 hover:text-white'}`}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => onSelectRoleView('chef')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${currentRoleView === 'chef' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-400 hover:text-white'}`}
            >
              Chef
            </button>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {activeBooking && (
              <button
                type="button"
                onClick={onOpenActiveBooking}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold"
              >
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                Active booking
              </button>
            )}

            <button
              type="button"
              onClick={onOpenNotifications}
              className="relative h-9 w-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300 hover:text-white"
              aria-label="Notifications"
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-amber-500 text-neutral-950 font-bold text-[9px] rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => currentUser ? setShowUserMenu((v) => !v) : onOpenAuth()}
                className="h-9 rounded-xl bg-neutral-900 border border-neutral-800 px-2 flex items-center gap-1.5"
                aria-label="Account"
              >
                {currentUser ? (
                  <img src={currentUser.avatar} alt="" className="h-6 w-6 rounded-lg object-cover ring-1 ring-amber-500/30" />
                ) : (
                  <span className="text-[11px] font-bold text-amber-400">Sign in</span>
                )}
              </button>

              {showUserMenu && currentUser && (
                <div className="absolute right-0 top-full mt-2 w-60 bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl p-3 z-50">
                  <div className="flex items-center gap-2.5 pb-2.5 border-b border-neutral-800">
                    <img src={currentUser.avatar} alt="" className="w-9 h-9 rounded-xl object-cover" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
                      <div className="text-[10px] text-neutral-500 truncate">{currentUser.email || currentUser.phone}</div>
                    </div>
                  </div>
                  <div className="pt-2 space-y-1 text-xs">
                    <button type="button" onClick={() => { onSelectRoleView(currentUser.role === 'chef' ? 'chef' : 'customer'); setShowUserMenu(false); }} className="w-full text-left px-2.5 py-2 rounded-lg text-neutral-200 hover:bg-neutral-800 flex items-center gap-2">
                      <UserCheck size={14} className="text-amber-400" />
                      <span>{currentUser.role === 'chef' ? 'Chef dashboard' : 'Customer home'}</span>
                    </button>
                    {onOpenChefSignup && currentUser.role !== 'chef' && (
                      <button type="button" onClick={() => { onOpenChefSignup(); setShowUserMenu(false); }} className="w-full text-left px-2.5 py-2 rounded-lg text-neutral-200 hover:bg-neutral-800 flex items-center gap-2">
                        <ChefHat size={14} className="text-amber-400" />
                        <span>Join as a chef</span>
                      </button>
                    )}
                    <button type="button" onClick={() => { onOpenAuth(); setShowUserMenu(false); }} className="w-full text-left px-2.5 py-2 rounded-lg text-neutral-200 hover:bg-neutral-800 flex items-center gap-2">
                      <Sparkles size={14} className="text-amber-400" />
                      <span>Account settings</span>
                    </button>
                    {onLogout && (
                      <button type="button" onClick={() => { setShowUserMenu(false); onLogout(); }} className="w-full text-left px-2.5 py-2 rounded-lg text-red-400 hover:bg-red-500/10 flex items-center gap-2 border-t border-neutral-800 mt-1">
                        <LogOut size={14} />
                        <span>Sign out</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenCitySelector}
          className="mt-2 w-full md:hidden flex items-center gap-1.5 text-left text-[11px] text-neutral-400"
        >
          <MapPin size={13} className="text-amber-400 shrink-0" />
          <span>Delivering to</span>
          <span className="font-bold text-white truncate">{selectedArea.label}, {selectedCity.name}</span>
          <span className="ml-auto text-amber-400 font-bold">Change</span>
        </button>

        <div className="hidden md:flex items-center justify-between mt-2">
          <button type="button" onClick={onOpenCitySelector} className="text-[11px] text-neutral-400 hover:text-white">
            <MapPin size={13} className="text-amber-400 inline-block mr-1" /> <span className="font-semibold text-neutral-200">{selectedArea.label}, {selectedCity.name}</span> · Change location
          </button>
          <PWAInstallButton variant="header" />
        </div>
      </div>
    </header>
  );
};
