import React, { useState } from 'react';
import { Booking, BookingStatus, FeedbackSubmission } from '../../types';
import { SmartGroceryIntegration } from './SmartGroceryIntegration';
import { ShareRideTrackingModal } from '../common/ShareRideTrackingModal';
import { TwoWayBlindRatingModal } from '../common/TwoWayBlindRatingModal';
import { Share2, Star, Bot } from 'lucide-react';

interface ActiveBookingModalProps {
  booking: Booking | null;
  onClose: () => void;
  onUpdateStatus: (bookingId: string, newStatus: BookingStatus) => void;
  onCancelBooking: (bookingId: string) => void;
  onTriggerSosPanic?: (bookingId: string, reason: string) => void;
  onResolveSosAlert?: (bookingId: string) => void;
  onOpenAIChat?: () => void;
}

const EMERGENCY_REASONS = [
  '⚠️ Physical Safety / Threat Concern',
  '🚑 Medical / Injury Emergency',
  '🔥 Kitchen Fire / Gas Leak Hazard',
  '🚨 Inappropriate Conduct / Dispute',
  '🆘 Immediate Platform Assistance Needed',
];

export const ActiveBookingModal: React.FC<ActiveBookingModalProps> = ({
  booking,
  onClose,
  onUpdateStatus,
  onCancelBooking,
  onTriggerSosPanic,
  onResolveSosAlert,
  onOpenAIChat,
}) => {
  const [showPanicDialog, setShowPanicDialog] = useState(false);
  const [selectedReason, setSelectedReason] = useState(EMERGENCY_REASONS[0]);
  const [customReasonNote, setCustomReasonNote] = useState('');
  const [isSubmittingSos, setIsSubmittingSos] = useState(false);
  const [showResolveConfirm, setShowResolveConfirm] = useState(false);
  const [showShareTrackingModal, setShowShareTrackingModal] = useState(false);
  const [showBlindRatingModal, setShowBlindRatingModal] = useState(false);

  if (!booking) return null;

  const isSosActive = Boolean(booking.sosAlert?.active);

  const steps: { key: BookingStatus; label: string; desc: string }[] = [
    { key: 'pending_acceptance', label: 'Broadcast', desc: 'Dispatching to nearby chef radar' },
    { key: 'accepted', label: 'Accepted', desc: 'Chef confirmed and prepping travel kit' },
    { key: 'en_route', label: 'En Route', desc: `Traveling to ${booking.area}` },
    { key: 'arrived', label: 'Doorstep OTP', desc: 'Verify 4-digit security code' },
    { key: 'in_progress', label: 'Cooking', desc: 'Preparing requested dishes' },
    { key: 'completed', label: 'Finished', desc: 'Clean kitchen handover' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === booking.status);

  const handleConfirmTriggerSos = () => {
    setIsSubmittingSos(true);
    const reasonText = customReasonNote.trim()
      ? `${selectedReason} - Note: ${customReasonNote.trim()}`
      : selectedReason;

    if (onTriggerSosPanic) {
      onTriggerSosPanic(booking.id, reasonText);
    }
    setTimeout(() => {
      setIsSubmittingSos(false);
      setShowPanicDialog(false);
    }, 400);
  };

  const handleConfirmResolve = () => {
    if (onResolveSosAlert) {
      onResolveSosAlert(booking.id);
    }
    setShowResolveConfirm(false);
  };

  return (
    <div className="fixed inset-0 z-[2060] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`relative w-full max-w-lg bg-neutral-900 border rounded-3xl p-6 sm:p-7 shadow-2xl text-neutral-100 max-h-[92vh] overflow-y-auto transition-all ${
        isSosActive
          ? 'border-red-500/80 ring-2 ring-red-500/30 shadow-red-950/60'
          : 'border-neutral-700'
      }`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white text-xl p-1 z-10"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Top Emergency Active Warning Banner */}
        {isSosActive && (
          <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-red-950 via-rose-900/60 to-red-950 border border-red-500/80 shadow-lg shadow-red-950/60 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-3.5 w-3.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
                </span>
                <div>
                  <div className="text-xs font-black uppercase tracking-widest text-red-200 flex items-center gap-2">
                    <span>🚨 SOS PANIC ACTIVE</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500 text-white font-mono font-bold">
                      #{booking.sosAlert?.ticketId}
                    </span>
                  </div>
                  <p className="text-[11px] text-red-200/90 mt-0.5 font-medium">
                    Platform 24/7 Safety Desk is intervening. High-priority push sent to Chef.
                  </p>
                </div>
              </div>
            </div>

            {/* Emergency Status Grid */}
            <div className="mt-3.5 pt-3 border-t border-red-800/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-black/40 border border-red-800/40">
                <div className="text-[10px] uppercase font-bold text-red-300">Platform Safety Team</div>
                <div className="text-white font-semibold flex items-center gap-1.5 mt-0.5">
                  <span className="text-emerald-400">✓</span>
                  <span>{booking.sosAlert?.supportAgent || 'Crisis Desk Lead Dispatched'}</span>
                </div>
                <div className="text-[10px] text-neutral-300 mt-0.5 font-mono">
                  Direct Line: {booking.sosAlert?.supportPhone || '+91 80 6900 9112'}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-red-800/40">
                <div className="text-[10px] uppercase font-bold text-red-300">Assigned Chef Status</div>
                <div className="text-white font-semibold flex items-center gap-1.5 mt-0.5">
                  <span className="text-emerald-400">✓</span>
                  <span>Chef {booking.chefName} Alerted</span>
                </div>
                <div className="text-[10px] text-neutral-300 mt-0.5">
                  Notification blasted at {booking.sosAlert?.chefNotificationTime || 'Just now'}
                </div>
              </div>
            </div>

            {/* Emergency Hotline Quick Actions */}
            <div className="mt-3.5 flex flex-wrap gap-2">
              <a
                href="tel:18002433767"
                className="flex-1 min-w-[140px] py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs text-center flex items-center justify-center gap-1.5 transition-all shadow-md shadow-red-950"
              >
                <span>📞 Call Safety Desk</span>
                <span className="text-[10px] opacity-80">(1800-CHEF-SOS)</span>
              </a>

              <a
                href="tel:112"
                className="py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-red-500/50 text-red-300 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <span>🚨 Police / SOS 112</span>
              </a>

              <a
                href="https://wa.me/919845099911"
                target="_blank"
                rel="noreferrer"
                className="py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <span>💬 WhatsApp Desk</span>
              </a>
            </div>

            {/* De-escalate button */}
            <div className="mt-3 pt-2 text-right">
              {!showResolveConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowResolveConfirm(true)}
                  className="text-xs text-neutral-300 hover:text-white underline font-semibold"
                >
                  I am safe now • Stand down emergency alert
                </button>
              ) : (
                <div className="flex items-center justify-end gap-2 text-xs">
                  <span className="text-neutral-300">Confirm situation is resolved?</span>
                  <button
                    type="button"
                    onClick={handleConfirmResolve}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-500"
                  >
                    Yes, Mark Safe
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResolveConfirm(false)}
                    className="px-2 py-1 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <img
              src={booking.chefAvatar}
              alt={booking.chefName}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-amber-500/50 shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-wide">
                  {booking.type === 'sos_quick_fix' ? 'SOS Quick-Fix' : 'Meal Prep Booking'}
                </span>
                <span className="text-xs text-neutral-400">#{booking.id.slice(-6)}</span>
              </div>
              <h3 className="text-base font-black text-white mt-1 truncate">{booking.chefName}</h3>
              <p className="text-xs text-neutral-400 truncate">Destination: {booking.area}</p>
            </div>
          </div>

          {/* SOS Panic Trigger Button in Header */}
          {booking.status !== 'completed' && booking.status !== 'cancelled' && (
            <div className="shrink-0 mt-1">
              {!isSosActive ? (
                <button
                  type="button"
                  onClick={() => setShowPanicDialog(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-black shadow-lg shadow-red-950/60 ring-2 ring-red-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer animate-pulse"
                  title="Immediately alerts platform crisis desk and assigned chef"
                >
                  <span className="text-sm">🚨</span>
                  <span>SOS Panic</span>
                </button>
              ) : (
                <div className="px-2.5 py-1.5 rounded-xl bg-red-600/30 border border-red-500/60 text-red-300 text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
                  <span>SOS Live</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SOS Panic Trigger Modal / Sheet Overlay */}
        {showPanicDialog && (
          <div className="my-4 p-5 rounded-3xl bg-neutral-950 border-2 border-red-500/80 shadow-2xl shadow-red-950/80 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">🚨</span>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">
                    Confirm SOS Panic Transmission
                  </h4>
                  <p className="text-[11px] text-red-400">
                    Immediate emergency dispatch protocol
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPanicDialog(false)}
                className="text-neutral-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="my-3 space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/60 text-red-200">
                <p className="font-semibold">
                  Pressing this button triggers instant high-priority emergency actions:
                </p>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-red-300">
                  <li>Notifies the <strong>Platform Safety & Crisis Operations Team</strong> immediately with high-priority SLA.</li>
                  <li>Blasts a <strong>high-priority emergency push notification</strong> directly to Chef <strong>{booking.chefName}</strong>.</li>
                  <li>Transmits your verified GPS coordinates in <strong>{booking.area}</strong> to local emergency escalation desks.</li>
                </ul>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Select Incident Category:
                </label>
                <div className="space-y-1.5">
                  {EMERGENCY_REASONS.map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setSelectedReason(reason)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                        selectedReason === reason
                          ? 'bg-red-500/20 border-red-500 text-white ring-1 ring-red-500/40'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-400 mt-2 mb-1">
                  Additional Details / Notes (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Need immediate safety assistance or medical response"
                  value={customReasonNote}
                  onChange={(e) => setCustomReasonNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:ring-1 focus:ring-red-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowPanicDialog(false)}
                className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isSubmittingSos}
                onClick={handleConfirmTriggerSos}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-red-950 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmittingSos ? (
                  <span>Transmitting Alert...</span>
                ) : (
                  <>
                    <span>🚨</span>
                    <span>Transmitting SOS Panic Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Live OTP Box */}
        {booking.status !== 'completed' && booking.status !== 'cancelled' && (
          <div className="my-5 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-transparent border border-amber-500/30 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                Doorstep Security Code (OTP)
              </div>
              <div className="text-2xl font-black text-amber-400 tracking-widest mt-0.5">
                {booking.otp}
              </div>
              <div className="text-[11px] text-neutral-400">
                Share with {booking.chefName.split(' ')[0]} upon arrival to verify booking
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl font-bold">
              🔑
            </div>
          </div>
        )}

        {/* Real-Time GPS Tracking Sharing Button (Requirement 3) */}
        {booking.status !== 'completed' && booking.status !== 'cancelled' && (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowShareTrackingModal(true)}
              className="w-full py-2.5 px-4 rounded-2xl bg-neutral-950 border border-emerald-500/40 hover:border-emerald-500/80 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer hover:bg-neutral-900"
            >
              <Share2 size={13} className="text-emerald-400" />
              <span>Share Real-Time GPS Ride Tracking (WhatsApp & Family Link)</span>
            </button>
          </div>
        )}

        {/* Progress Step Line */}
        <div className="space-y-4 my-6">
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
            Live Booking Timeline
          </div>
          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-800">
            {steps.map((st, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={st.key} className="relative flex items-start gap-3">
                  <div
                    className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 transition-all ${
                      isCurrent
                        ? 'bg-amber-500 border-amber-300 ring-4 ring-amber-500/20'
                        : isPast
                        ? 'bg-emerald-500 border-emerald-400 text-white'
                        : 'bg-neutral-800 border-neutral-700'
                    }`}
                  />
                  <div>
                    <div
                      className={`text-xs font-bold ${
                        isCurrent ? 'text-amber-400' : isPast ? 'text-neutral-200' : 'text-neutral-500'
                      }`}
                    >
                      {st.label}
                      {isCurrent && <span className="ml-2 text-[10px] text-amber-300 animate-pulse font-normal">● In Progress</span>}
                    </div>
                    <div className="text-[11px] text-neutral-400">{st.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Details Accordion */}
        <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs">
          <div className="flex justify-between text-neutral-300">
            <span className="text-neutral-400">Dishes Requested:</span>
            <span className="font-semibold text-right max-w-[220px] truncate text-white">
              {booking.dishesRequested}
            </span>
          </div>
          <div className="flex justify-between text-neutral-300">
            <span className="text-neutral-400">Total Escrow:</span>
            <span className="font-bold text-amber-400">₹{booking.totalAmount} (Paid via Razorpay)</span>
          </div>
        </div>

        {/* The Bangalore Hack: Live Synchronized Grocery Cart for SOS bookings */}
        {booking.type === 'sos_quick_fix' && booking.status !== 'completed' && booking.status !== 'cancelled' && (
          <div className="my-4">
            <SmartGroceryIntegration
              dishesText={booking.dishesRequested}
              chefEtaMinutes={booking.etaMinutes || 24}
              customerArea={booking.area}
              variant="compact"
            />
          </div>
        )}

        {/* Dedicated SOS Safety Card for easy access */}
        {!isSosActive && booking.status !== 'completed' && booking.status !== 'cancelled' && (
          <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-red-950/30 via-neutral-900 to-neutral-900 border border-red-500/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🛡️</span>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>ChefPulse 24/7 Safety Escort</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                    Live
                  </span>
                </div>
                <div className="text-[11px] text-neutral-400">
                  Feel uncomfortable or facing an emergency? Tap SOS Panic.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPanicDialog(true)}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shrink-0 shadow-md shadow-red-950 transition-all cursor-pointer"
            >
              🚨 Panic SOS
            </button>
          </div>
        )}

        {/* Simulated Stage Advancement for testing */}
        <div className="mt-5 p-3 rounded-2xl bg-neutral-800/60 border border-neutral-700/60">
          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>⚡ Interactive Simulator Controls</span>
            <span className="text-[10px] text-neutral-400">Advance gig lifecycle</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            {booking.status === 'pending_acceptance' && (
              <button
                type="button"
                onClick={() => onUpdateStatus(booking.id, 'accepted')}
                className="col-span-3 py-2 rounded-xl bg-amber-500 text-neutral-950 font-bold hover:bg-amber-400"
              >
                Simulate: Chef Accepts Booking
              </button>
            )}
            {booking.status === 'accepted' && (
              <button
                type="button"
                onClick={() => onUpdateStatus(booking.id, 'en_route')}
                className="col-span-3 py-2 rounded-xl bg-amber-500 text-neutral-950 font-bold hover:bg-amber-400"
              >
                Simulate: Chef En Route (On Bike)
              </button>
            )}
            {booking.status === 'en_route' && (
              <button
                type="button"
                onClick={() => onUpdateStatus(booking.id, 'arrived')}
                className="col-span-3 py-2 rounded-xl bg-amber-500 text-neutral-950 font-bold hover:bg-amber-400"
              >
                Simulate: Chef Arrives at Door
              </button>
            )}
            {booking.status === 'arrived' && (
              <button
                type="button"
                onClick={() => onUpdateStatus(booking.id, 'in_progress')}
                className="col-span-3 py-2 rounded-xl bg-amber-500 text-neutral-950 font-bold hover:bg-amber-400"
              >
                Simulate: OTP Verified → Start Cooking
              </button>
            )}
            {booking.status === 'in_progress' && (
              <button
                type="button"
                onClick={() => onUpdateStatus(booking.id, 'completed')}
                className="col-span-3 py-2 rounded-xl bg-emerald-500 text-neutral-950 font-black hover:bg-emerald-400"
              >
                Simulate: Cooking Finished & Release Escrow
              </button>
            )}
            {booking.status === 'completed' && (
              <div className="col-span-3 py-2 text-center text-xs text-emerald-400 font-bold">
                ✓ Meal finished & kitchen cleaned! Escrow credited to Chef.
              </div>
            )}
          </div>
        </div>

        {/* Two-Way Blind Rating Trigger (Requirement 2) */}
        {booking.status === 'completed' && (
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-neutral-900 to-amber-950/30 border border-purple-500/40 text-center space-y-2">
            <div className="text-xs font-black text-white flex items-center justify-center gap-1.5">
              <Star size={14} className="text-amber-400 fill-amber-400" />
              <span>Two-Way Blind Review Active</span>
            </div>
            <p className="text-[11px] text-neutral-300">
              Submit your private review for Chef {booking.chefName}. Ratings stay blind until both parties complete their review.
            </p>
            <button
              type="button"
              onClick={() => setShowBlindRatingModal(true)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 cursor-pointer"
            >
              ⭐ Rate Chef & View Mutual Blind Status
            </button>
          </div>
        )}

        {/* 24/7 AI Dispute Assistant Link */}
        {onOpenAIChat && (
          <div className="mt-4 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onOpenAIChat}
              className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-neutral-800 via-neutral-900 to-neutral-800 hover:from-neutral-700 hover:to-neutral-800 border border-neutral-700 hover:border-amber-500/50 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm group"
            >
              <Bot size={15} className="text-amber-400 group-hover:scale-110 transition-transform" />
              <span>Delay or Dispute? Chat with 24/7 AI Concierge</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                Auto-Refund
              </span>
            </button>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-5 flex items-center justify-between gap-3">
          {booking.status !== 'completed' && (
            <button
              type="button"
              onClick={() => onCancelBooking(booking.id)}
              className="text-xs text-red-400 hover:text-red-300 font-semibold"
            >
              Cancel Booking
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold"
          >
            Close Sheet
          </button>
        </div>
      </div>

      {/* Sub-Modals */}
      <ShareRideTrackingModal
        isOpen={showShareTrackingModal}
        onClose={() => setShowShareTrackingModal(false)}
        booking={booking}
      />

      <TwoWayBlindRatingModal
        isOpen={showBlindRatingModal}
        onClose={() => setShowBlindRatingModal(false)}
        booking={booking}
        initialRole="customer"
        onSubmitFeedback={(bookingId, submission) => {
          // feedback saved
        }}
      />
    </div>
  );
};
