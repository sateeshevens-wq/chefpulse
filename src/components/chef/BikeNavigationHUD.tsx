import React, { useState, useEffect } from 'react';
import { Navigation, Compass, ExternalLink, Bike, ShieldCheck, MapPin } from 'lucide-react';

interface BikeNavigationHUDProps {
  destinationAddress: string;
  destinationArea: string;
  customerName: string;
  customerPhone?: string;
  distanceKm?: number;
  initialEtaMinutes?: number;
  onOpenShareTracking?: () => void;
}

export const BikeNavigationHUD: React.FC<BikeNavigationHUDProps> = ({
  destinationAddress,
  destinationArea,
  customerName,
  customerPhone,
  distanceKm = 2.4,
  initialEtaMinutes = 14,
  onOpenShareTracking,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [speedKmh, setSpeedKmh] = useState(24);
  const [remainingDistanceMeters, setRemainingDistanceMeters] = useState(distanceKm * 1000);

  const navigationSteps = [
    { instruction: 'Head East on 100ft Road towards 12th Main', distance: '450 m', icon: '⬆️' },
    { instruction: 'Turn left onto 12th Main Road, Indiranagar', distance: '800 m', icon: '↰' },
    { instruction: 'Keep right at Sony World junction signal', distance: '600 m', icon: '↗️' },
    { instruction: 'Turn right into 4th Cross, Defence Colony', distance: '350 m', icon: '↱' },
    { instruction: 'Destination is on the left (Apartment Gate #3)', distance: '120 m', icon: '📍' },
  ];

  // Dynamic speed oscillation simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setSpeedKmh((prev) => Math.max(16, Math.min(32, prev + (Math.random() > 0.5 ? 2 : -2))));
      setRemainingDistanceMeters((prev) => Math.max(50, prev - 40));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const currentManeuver = navigationSteps[currentStepIndex] || navigationSteps[0];

  const handleOpenGoogleMaps = () => {
    const destination = encodeURIComponent(`${destinationAddress || destinationArea}, Bengaluru`);
    const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=bicycling`;
    window.open(gmapsUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5 shadow-2xl text-neutral-100 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Bike size={18} />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <span>Rapido-Grade Bike Navigation HUD</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="text-[11px] text-neutral-400 truncate max-w-xs">
              Heading to: <strong className="text-white">{destinationArea}</strong>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenShareTracking && (
            <button
              type="button"
              onClick={onOpenShareTracking}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 text-emerald-300 font-bold text-xs transition-colors cursor-pointer"
              title="Share live bike route with customer or family"
            >
              <span>📲 Share Live Trip</span>
            </button>
          )}

          {/* Real Google Maps launch button */}
          <button
            type="button"
            onClick={handleOpenGoogleMaps}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-md shadow-blue-950 cursor-pointer"
          >
            <Navigation size={13} />
            <span>Open in Google Maps</span>
            <ExternalLink size={11} />
          </button>
        </div>
      </div>

      {/* Maneuver Big Banner */}
      <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-500 text-neutral-950 flex items-center justify-center text-3xl font-black shadow-lg shadow-amber-500/20 shrink-0">
          {currentManeuver.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
            In {currentManeuver.distance}
          </div>
          <div className="text-sm font-black text-white leading-snug">
            {currentManeuver.instruction}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setCurrentStepIndex((prev) => (prev + 1) % navigationSteps.length)}
          className="text-[10px] text-neutral-400 hover:text-amber-400 font-semibold underline shrink-0 cursor-pointer"
        >
          Next Turn ➔
        </button>
      </div>

      {/* Telemetry Grid */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800">
          <div className="text-[10px] uppercase font-bold text-neutral-400">Bike Speed</div>
          <div className="text-lg font-black text-white font-mono">{speedKmh} <span className="text-xs font-normal text-neutral-400">km/h</span></div>
        </div>
        <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800">
          <div className="text-[10px] uppercase font-bold text-neutral-400">Remaining Dist</div>
          <div className="text-lg font-black text-amber-400 font-mono">{(remainingDistanceMeters / 1000).toFixed(1)} <span className="text-xs font-normal text-neutral-400">km</span></div>
        </div>
        <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800">
          <div className="text-[10px] uppercase font-bold text-neutral-400">Live ETA</div>
          <div className="text-lg font-black text-emerald-400 font-mono">{Math.max(2, Math.round(remainingDistanceMeters / 300))} <span className="text-xs font-normal text-neutral-400">mins</span></div>
        </div>
      </div>

      {/* Destination address footer */}
      <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs flex items-center justify-between text-neutral-300">
        <div className="flex items-center gap-2 truncate">
          <MapPin size={14} className="text-amber-400 shrink-0" />
          <span className="truncate">{destinationAddress || `${destinationArea}, Bengaluru`}</span>
        </div>
        {customerPhone && (
          <a
            href={`tel:${customerPhone}`}
            className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold shrink-0 ml-2"
          >
            📞 Call {customerName.split(' ')[0]}
          </a>
        )}
      </div>
    </div>
  );
};
