import React, { useState } from 'react';
import {
  Gift,
  Share2,
  Copy,
  Check,
  Users,
  Award,
  Sparkles,
  ArrowRight,
  DollarSign,
  TrendingUp,
  Building,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { User, UserRole } from '../../types';
import { playAlertChime } from '../../utils/sound';

interface ViralReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  activeRole: UserRole;
  onOpenSignUpWithReferralCode?: (code: string) => void;
}

export const ViralReferralModal: React.FC<ViralReferralModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  activeRole,
  onOpenSignUpWithReferralCode,
}) => {
  const [tab, setTab] = useState<'customer' | 'chef'>(
    activeRole === 'chef' ? 'chef' : 'customer'
  );
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const rawName = currentUser?.name ? currentUser.name.split(' ')[0].toUpperCase() : 'PULSE';
  const customerReferralCode = `PULSE-${rawName}150`;
  const chefReferralCode = `CHEF-${rawName}1500`;

  const currentCode = tab === 'customer' ? customerReferralCode : chefReferralCode;
  const currentDeepLink = `https://chefpulse.in/join?ref=${currentCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentCode);
    setCopiedCode(true);
    playAlertChime('accepted');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentDeepLink);
    setCopiedLink(true);
    playAlertChime('accepted');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text =
      tab === 'customer'
        ? `Hey! Hire a certified 5-star private chef at home on ChefPulse. Use my referral code ${customerReferralCode} to get ₹150 off your first SOS meal: ${currentDeepLink}`
        : `Calling all culinary professionals! Join ChefPulse as a verified chef partner with instant 24/7 bank withdrawals. Use my partner invite ${chefReferralCode} to sign up: ${currentDeepLink}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleTestDeepLinkSignUp = () => {
    if (onOpenSignUpWithReferralCode) {
      onOpenSignUpWithReferralCode(currentCode);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[2400] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-700 rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto text-neutral-100 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Gift size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold uppercase tracking-wider">
                  VIRAL GROWTH ENGINE
                </span>
              </div>
              <h3 className="text-lg font-black text-white mt-0.5">
                {tab === 'customer' ? 'Give ₹150, Get ₹150 Referral' : 'Refer-a-Chef Cash Bounty'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white text-lg p-1 cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setTab('customer')}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              tab === 'customer'
                ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            🎁 Customer: Give ₹150 / Get ₹150
          </button>
          <button
            type="button"
            onClick={() => setTab('chef')}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              tab === 'chef'
                ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            👨‍🍳 Chef: Earn ₹1,500 Cash Bounty
          </button>
        </div>

        {/* TAB 1: CUSTOMER REFERRAL */}
        {tab === 'customer' && (
          <div className="space-y-5">
            <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-neutral-300">
                <span>How the Customer Referral Works:</span>
                <span className="text-amber-400 font-mono">Dual Wallet Credit</span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                  <div className="text-base font-black text-amber-400">1. Share</div>
                  <div className="text-[10px] text-neutral-400">Send invite link with your code</div>
                </div>
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                  <div className="text-base font-black text-amber-400">2. Cook</div>
                  <div className="text-[10px] text-neutral-400">Friend gets ₹150 off first meal</div>
                </div>
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                  <div className="text-base font-black text-emerald-400">3. Earn</div>
                  <div className="text-[10px] text-neutral-400">You receive ₹150 wallet credit!</div>
                </div>
              </div>
            </div>

            {/* Unique Code & Deep Link Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300">Your Personal Referral Code:</span>
                <span className="text-[10px] font-mono text-emerald-400">Active Pan-India</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                <span className="text-base font-mono font-black text-white tracking-widest">
                  {customerReferralCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-200 flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedCode ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>

              {/* Deep Link */}
              <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800/80 flex items-center justify-between text-xs">
                <span className="truncate text-neutral-400 font-mono text-[11px] max-w-[280px]">
                  {currentDeepLink}
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="text-amber-400 hover:text-amber-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer shrink-0 ml-2"
                >
                  {copiedLink ? 'Link Copied!' : 'Copy Deep-Link'}
                </button>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-950"
              >
                <span>💬 Share via WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleTestDeepLinkSignUp}
                className="py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-950"
              >
                <span>🔗 Test Pre-Applied Sign-Up</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Referral Stats Ledger */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-neutral-300">
                <span>Referral Earnings Summary:</span>
                <span className="text-emerald-400 font-mono">₹900 Total Earned</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-[11px] pt-1">
                <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                  <div className="text-white font-bold">6</div>
                  <div className="text-neutral-500 text-[10px]">Friends Invited</div>
                </div>
                <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                  <div className="text-white font-bold">4</div>
                  <div className="text-neutral-500 text-[10px]">First Orders Done</div>
                </div>
                <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                  <div className="text-amber-400 font-bold">2</div>
                  <div className="text-neutral-500 text-[10px]">Pending First Meal</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CHEF RECRUITMENT PROGRAM */}
        {tab === 'chef' && (
          <div className="space-y-5">
            <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-neutral-300">
                <span>Tiered Chef Partner Bounty:</span>
                <span className="text-emerald-400 font-mono">Instant Bank Transfer</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Refer certified professional cooks, commis chefs, or catering masters. When your referred chef verifies their Aadhaar/FSSAI and completes <strong className="text-amber-400">5 successful gigs</strong>, we transfer cash straight to your bank account!
              </p>
            </div>

            {/* Tiers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1">
                <span className="text-[10px] text-amber-400 font-bold uppercase">TIER 1 (1-3 Chefs)</span>
                <div className="text-base font-black text-white">₹1,500 / Chef</div>
                <div className="text-[10px] text-neutral-400">After 5 gigs completed</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-amber-500/40 space-y-1">
                <span className="text-[10px] text-amber-400 font-bold uppercase">TIER 2 (4-9 Chefs)</span>
                <div className="text-base font-black text-amber-300">₹2,500 / Chef</div>
                <div className="text-[10px] text-neutral-400">+ ₹5,000 Milestone Bonus</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-emerald-500/40 space-y-1">
                <span className="text-[10px] text-emerald-400 font-bold uppercase">TIER 3 (10+ Chefs)</span>
                <div className="text-base font-black text-emerald-400">₹3,500 / Chef</div>
                <div className="text-[10px] text-neutral-400">+ ₹25,000 Ambassador Pool</div>
              </div>
            </div>

            {/* Chef Referral Code */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-300">Your Chef Recruitment Code:</span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="text-amber-400 hover:text-amber-300 font-bold font-mono"
                >
                  {copiedCode ? '✓ Copied' : 'Copy Code'}
                </button>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 font-mono font-bold text-center text-lg text-amber-400">
                {chefReferralCode}
              </div>
            </div>

            {/* Share CTA */}
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Share Partner Invite via WhatsApp</span>
              <Share2 size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
