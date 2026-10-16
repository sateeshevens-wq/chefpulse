import React, { useState } from 'react';
import {
  MapPin,
  Sparkles,
  Bell,
  Users,
  CheckCircle2,
  Building,
  ShieldAlert,
  ArrowRight,
  Flame,
  Award,
  Zap,
  Check,
  RefreshCw,
} from 'lucide-react';
import { CityInfo, CityArea, Chef } from '../../types';
import { playAlertChime } from '../../utils/sound';

interface DensityWaitlistViewProps {
  currentCity: CityInfo;
  currentArea: CityArea;
  pincode: string;
  activeChefsCount: number;
  requiredChefsCount?: number;
  onUnlockArea: () => void;
  onSwitchToDenseArea: () => void;
  onCheckDifferentArea: () => void;
  onSendWaitlistNotification: (message: string) => void;
}

export const DensityWaitlistView: React.FC<DensityWaitlistViewProps> = ({
  currentCity,
  currentArea,
  pincode,
  activeChefsCount,
  requiredChefsCount = 5,
  onUnlockArea,
  onSwitchToDenseArea,
  onCheckDifferentArea,
  onSendWaitlistNotification,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [societyName, setSocietyName] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState(48);
  const [isSimulatingOnboard, setIsSimulatingOnboard] = useState(false);
  const [votedSociety, setVotedSociety] = useState(false);

  const chefsNeeded = Math.max(0, requiredChefsCount - activeChefsCount);
  const progressPercent = Math.min(100, Math.round((activeChefsCount / requiredChefsCount) * 100));

  const handleJoinWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;
    setIsJoined(true);
    setWaitlistCount((prev) => prev + 1);
    playAlertChime('accepted');
    onSendWaitlistNotification(
      `🎉 You're on the priority waitlist for ${currentArea.label} (${pincode})! ₹200 launch credits reserved.`
    );
  };

  const handleSimulateMilestoneUnlock = () => {
    setIsSimulatingOnboard(true);
    setTimeout(() => {
      setIsSimulatingOnboard(false);
      playAlertChime('arrived');
      onSendWaitlistNotification(
        `🚨 Milestone Reached! ChefPulse is now officially LIVE in ${currentArea.label} (${pincode}) with 5/5 verified master chefs!`
      );
      onUnlockArea();
    }, 1200);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Banner Notice */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-300">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <span className="font-semibold">
            Quality & SLA Protection Active: Strict 5-Chef Density Requirement
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSwitchToDenseArea}
            className="px-3 py-1.5 rounded-xl bg-amber-500 text-neutral-950 font-bold hover:bg-amber-400 transition-all cursor-pointer text-xs"
          >
            Switch to High-Density Hub ➔
          </button>
        </div>
      </div>

      {/* Hero Waitlist Card */}
      <div className="relative overflow-hidden rounded-3xl bg-neutral-900 border border-neutral-800 p-6 sm:p-10 shadow-2xl space-y-8">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800/80 border border-neutral-700/80 text-neutral-300 text-xs font-semibold">
            <MapPin size={14} className="text-amber-400" />
            <span>
              {currentArea.name}, {currentCity.name} • PIN {pincode}
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            ChefPulse is Expanding to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">
              {currentArea.label}
            </span>{' '}
            Soon!
          </h2>

          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
            To guarantee our signature <span className="text-amber-300 font-bold">20-minute SOS dispatch SLA</span>, we never show an empty or unreliable map. We launch an area only when a minimum cluster of 5 background-checked, FSSAI-licensed master chefs are live.
          </p>
        </div>

        {/* Density Gauge */}
        <div className="p-5 sm:p-6 rounded-2xl bg-neutral-950 border border-neutral-800/90 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Neighborhood Chef Readiness Meter
              </span>
              <div className="text-lg font-black text-white mt-0.5 flex items-center gap-2">
                <span>{activeChefsCount} of {requiredChefsCount} Verified Chefs Onboarded</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold">
                  {progressPercent}% Ready
                </span>
              </div>
            </div>

            <div className="text-xs text-neutral-400">
              {chefsNeeded === 0 ? (
                <span className="text-emerald-400 font-bold">✓ Ready for Launch!</span>
              ) : (
                <span>
                  Need <strong className="text-amber-400">{chefsNeeded} more</strong> chefs to unlock PIN {pincode}
                </span>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3.5 bg-neutral-900 rounded-full overflow-hidden p-0.5 border border-neutral-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-700 shadow-lg shadow-amber-500/50"
              style={{ width: `${Math.max(10, progressPercent)}%` }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800/60">
              <div className="text-neutral-400 text-[10px]">Aadhaar KYC</div>
              <div className="font-bold text-emerald-400 mt-0.5">✓ Passed</div>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800/60">
              <div className="text-neutral-400 text-[10px]">FSSAI Hygiene</div>
              <div className="font-bold text-emerald-400 mt-0.5">✓ Certified</div>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800/60">
              <div className="text-neutral-400 text-[10px]">CCTNS Police Check</div>
              <div className="font-bold text-amber-400 mt-0.5">In Progress (3)</div>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800/60">
              <div className="text-neutral-400 text-[10px]">Taste & Plating Trial</div>
              <div className="font-bold text-neutral-300 mt-0.5">Scheduled</div>
            </div>
          </div>
        </div>

        {/* Priority Waitlist Form */}
        {!isJoined ? (
          <div className="p-6 rounded-2xl bg-gradient-to-b from-neutral-950 to-neutral-900/90 border border-neutral-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Bell size={18} className="text-amber-400" />
                  <span>Join the Priority Neighborhood Waitlist</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Be the first to be notified via automated push notification when the 5th chef goes online.
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold shrink-0">
                <Sparkles size={13} />
                <span>₹200 Welcome Credit on Launch</span>
              </div>
            </div>

            <form onSubmit={handleJoinWaitlist} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    Mobile Number (For Launch Push Alert)
                  </label>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 98450 12345"
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs font-medium placeholder:text-neutral-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    Apartment / Gated Society Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={societyName}
                    onChange={(e) => setSocietyName(e.target.value)}
                    placeholder="e.g. Prestige Lakeside / Hiranandani"
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs font-medium placeholder:text-neutral-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <Users size={14} className="text-amber-400" />
                  <span>
                    <strong className="text-white font-bold">{waitlistCount} foodies</strong> already waiting in PIN {pincode}
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Join Waitlist & Claim ₹200 Credit</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 space-y-3 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">You're # {waitlistCount} on the VIP List!</h3>
                <p className="text-xs text-neutral-300 mt-0.5">
                  We'll send an automated push notification to <strong className="text-white">{phoneNumber}</strong> the moment 5 chefs are fully verified in {pincode}.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs text-neutral-300 flex items-center justify-between">
              <span>🎁 Reserved Bonus Coupon:</span>
              <span className="font-mono font-bold text-amber-400">LAUNCH200_UNLOCKED</span>
            </div>
          </div>
        )}

        {/* Vote to Accelerate Your Gated Community */}
        <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Building size={16} className="text-amber-400" />
              <span>Top Demanded Gated Communities in PIN {pincode}</span>
            </div>
            <span className="text-[11px] text-neutral-400">We prioritize chef clusters with 20+ votes</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            {[
              { name: 'Prestige Lakeside Habitat', votes: 34 },
              { name: 'Sobha Dream Acres', votes: 29 },
              { name: 'Assetz Marq 3.0', votes: 21 },
            ].map((soc) => (
              <div
                key={soc.name}
                className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-neutral-200">{soc.name}</div>
                  <div className="text-[10px] text-neutral-400 font-mono">{soc.votes} resident votes</div>
                </div>
                <button
                  type="button"
                  onClick={() => setVotedSociety(true)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                    votedSociety
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  {votedSociety ? '✓ Voted' : '+ Vote'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Demo Milestone Simulator Controls */}
        <div className="pt-4 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-neutral-400">
            <span>Tester Action: Preview how customer is notified when threshold is met</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onCheckDifferentArea}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold cursor-pointer"
            >
              Change PIN / Area
            </button>

            <button
              type="button"
              onClick={handleSimulateMilestoneUnlock}
              disabled={isSimulatingOnboard}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20 disabled:opacity-50"
            >
              {isSimulatingOnboard ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  <span>Onboarding 5th Chef...</span>
                </>
              ) : (
                <>
                  <Zap size={13} />
                  <span>Simulate 5/5 Density (Unlock Map)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
