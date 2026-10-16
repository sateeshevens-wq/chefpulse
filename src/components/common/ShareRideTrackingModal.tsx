import React, { useState } from 'react';
import { Booking } from '../../types';
import { Share2, Copy, Check, ExternalLink, Navigation, Bike, ShieldCheck, MapPin, Phone, AlertCircle } from 'lucide-react';

interface ShareRideTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
}

export const ShareRideTrackingModal: React.FC<ShareRideTrackingModalProps> = ({
  isOpen,
  onClose,
  booking,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const trackingToken = booking.sharedTrackingToken || `TRK-${booking.id.slice(-6).toUpperCase()}`;
  const trackingUrl = `https://chefpulse.in/live-track/${trackingToken}`;

  const shareText = `🍽️ Live Chef Tracker: I've booked ${booking.chefName} on ChefPulse for ${booking.area}. Track their live bike commute & arrival ETA here: ${trackingUrl}`;

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(trackingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
    }
  };

  const handleWhatsAppShare = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-[2250] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-3xl p-6 sm:p-7 shadow-2xl text-neutral-100 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Share2 size={18} />
            </div>
            <div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold uppercase tracking-wider">
                LIVE EN ROUTE TELEMETRY
              </span>
              <h3 className="text-base font-black text-white mt-0.5">
                Share Real-Time GPS Tracking
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white text-lg p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-neutral-300">
          Share this live link with family members or friends so they can monitor {booking.chefName}'s live bike location, speed, and doorstep arrival.
        </p>

        {/* Live Telemetry Card */}
        <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <strong className="text-white">Active Bike Commute</strong>
            </div>
            <span className="font-mono text-emerald-400 font-bold">Token: {trackingToken}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800">
              <div className="text-[10px] text-neutral-400 uppercase font-bold">Speed</div>
              <div className="text-sm font-black text-white font-mono mt-0.5">24 km/h</div>
            </div>
            <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800">
              <div className="text-[10px] text-neutral-400 uppercase font-bold">Remaining</div>
              <div className="text-sm font-black text-amber-400 font-mono mt-0.5">1.8 km</div>
            </div>
            <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800">
              <div className="text-[10px] text-neutral-400 uppercase font-bold">ETA</div>
              <div className="text-sm font-black text-emerald-400 font-mono mt-0.5">{booking.etaMinutes || 14} mins</div>
            </div>
          </div>

          <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 pt-1">
            <MapPin size={12} className="text-amber-400 shrink-0" />
            <span className="truncate">Destination: <strong>{booking.area}</strong> ({booking.serviceAddress})</span>
          </div>
        </div>

        {/* Shareable Link Box */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Shareable Live Tracking URL:
          </label>
          <div className="flex items-center gap-2 p-2 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs">
            <span className="text-neutral-400 truncate flex-1 font-mono text-[11px]">
              {trackingUrl}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* Direct WhatsApp Share Button */}
        <button
          type="button"
          onClick={handleWhatsAppShare}
          className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-950/60 cursor-pointer"
        >
          <span>📲 Share Live Trip via WhatsApp</span>
          <ExternalLink size={13} />
        </button>

        <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-2 border-t border-neutral-800">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck size={12} />
            <span>Encrypted Live GPS Feed</span>
          </span>
          <span>ChefPulse 24/7 Ops Desk</span>
        </div>

      </div>
    </div>
  );
};
