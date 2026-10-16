import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Chef } from '../../types';

interface BangaloreMapProps {
  chefs: Chef[];
  userLocation: { lat: number; lng: number; area: string };
  radiusKm: number;
  selectedChef: Chef | null;
  onSelectChef: (chef: Chef) => void;
  activeBookingChefId?: string;
}

export const BangaloreMap: React.FC<BangaloreMapProps> = ({
  chefs,
  userLocation,
  radiusKm,
  selectedChef,
  onSelectChef,
  activeBookingChefId,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [userLocation.lat, userLocation.lng],
      zoom: 14,
      zoomControl: false,
    });

    // Dark-styled CartoDB or OpenStreetMap tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Recenter when userLocation changes (supports instant pan across all cities in India)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 14);
  }, [userLocation.lat, userLocation.lng]);

  // Update Markers, Radius Circle & Route
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    // 1. Draw User Location Pin
    const userIconHtml = `
      <div class="relative flex items-center justify-center">
        <div class="absolute -inset-2 bg-emerald-500/20 rounded-full radar-pulse"></div>
        <div class="w-8 h-8 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/50 text-white font-bold text-xs">
          🏠
        </div>
      </div>
    `;
    const userIcon = L.divIcon({
      html: userIconHtml,
      className: 'chef-pin-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
    const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon });
    userMarker.bindTooltip(
      `<div class="text-xs font-semibold px-1 py-0.5 text-neutral-800">📍 Your Location<br/><span class="text-[10px] text-neutral-500">${userLocation.area}</span></div>`,
      { permanent: false, direction: 'top' }
    );
    markersGroup.addLayer(userMarker);

    // 2. Draw Radius Circle
    if (radiusCircleRef.current) {
      radiusCircleRef.current.remove();
    }
    const circle = L.circle([userLocation.lat, userLocation.lng], {
      radius: radiusKm * 1000,
      color: '#f59e0b',
      weight: 1.5,
      dashArray: '6, 8',
      fillColor: '#f59e0b',
      fillOpacity: 0.08,
    }).addTo(map);
    radiusCircleRef.current = circle;

    // 3. Draw Active Chefs within radius
    const chefsInRadius = chefs.filter(c => c.isOnline && c.distanceKm <= radiusKm);

    chefsInRadius.forEach((chef) => {
      const isSelected = selectedChef?.id === chef.id;
      const isActiveBooking = activeBookingChefId === chef.id;

      const chefIconHtml = `
        <div class="relative group cursor-pointer transition-transform duration-200 ${isSelected || isActiveBooking ? 'scale-125 z-30' : 'hover:scale-115'}">
          <div class="absolute -inset-1.5 ${isActiveBooking ? 'bg-amber-400' : 'bg-amber-500/40'} rounded-full blur-xs ${isActiveBooking ? 'animate-ping' : ''}"></div>
          <div class="relative w-10 h-10 ${isActiveBooking ? 'bg-amber-500 text-neutral-950 ring-2 ring-white' : isSelected ? 'bg-amber-500 text-neutral-950 ring-2 ring-amber-300' : 'bg-neutral-900 text-amber-400 border border-amber-500/60'} rounded-full flex flex-col items-center justify-center shadow-xl">
            <span class="text-sm font-black leading-none">👨‍🍳</span>
            <span class="text-[9px] font-black mt-0.5 tracking-tight">${chef.distanceKm}k</span>
          </div>
          <div class="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border border-neutral-900 rounded-full flex items-center justify-center text-[7px] text-white font-bold">
            ✓
          </div>
        </div>
      `;

      const chefIcon = L.divIcon({
        html: chefIconHtml,
        className: 'chef-pin-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker([chef.currentLocation.lat, chef.currentLocation.lng], { icon: chefIcon });

      marker.on('click', () => {
        onSelectChef(chef);
      });

      marker.bindTooltip(
        `<div class="text-xs p-1">
          <div class="font-bold text-neutral-900 flex items-center justify-between gap-1.5">
            <span>${chef.name}</span>
            <span class="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1 py-0.2 rounded">✓ Verified</span>
          </div>
          <div class="text-[11px] text-neutral-600">${chef.specialties[0]} • <span class="text-amber-600 font-semibold">★ ${chef.rating}</span></div>
          <div class="text-[10px] text-emerald-600 font-semibold mt-0.5">⚡ ${Math.round(chef.distanceKm * 7 + 5)} mins ETA • ₹${chef.sosRate} SOS</div>
          <div class="text-[9px] text-neutral-500 border-t border-neutral-200 mt-0.5 pt-0.5">🛡️ Passed Background Checks</div>
        </div>`,
        { direction: 'top', offset: [0, -16] }
      );

      markersGroup.addLayer(marker);
    });

    // 4. Draw route if booking is active
    if (routeLineRef.current) {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }

    if (activeBookingChefId) {
      const activeChef = chefs.find(c => c.id === activeBookingChefId);
      if (activeChef) {
        // Draw route line
        const latlngs: [number, number][] = [
          [activeChef.currentLocation.lat, activeChef.currentLocation.lng],
          [(activeChef.currentLocation.lat + userLocation.lat) / 2 + 0.001, (activeChef.currentLocation.lng + userLocation.lng) / 2 - 0.001],
          [userLocation.lat, userLocation.lng],
        ];
        const polyline = L.polyline(latlngs, {
          color: '#f59e0b',
          weight: 4,
          opacity: 0.9,
          dashArray: '8, 8',
        }).addTo(map);
        routeLineRef.current = polyline;
      }
    }
  }, [chefs, userLocation, radiusKm, selectedChef, activeBookingChefId, onSelectChef]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 14, { animate: true });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl bg-neutral-950">
      <div ref={mapContainerRef} className="w-full h-full min-h-[420px]" />

      {/* Floating Map HUD Top Left */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-2 pointer-events-auto">
        <div className="glass-panel px-3 py-2 rounded-xl flex items-center gap-2.5 shadow-lg border border-neutral-800">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
          <div>
            <div className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Live Radar</div>
            <div className="text-xs font-bold text-neutral-100 flex items-center gap-1.5">
              <span>{chefs.filter(c => c.isOnline && c.distanceKm <= radiusKm).length} Chefs active</span>
              <span className="text-amber-400 font-normal">within {radiusKm} km</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recenter & Map Controls Top Right */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2 pointer-events-auto">
        <button
          onClick={handleRecenter}
          className="glass-panel px-3 py-2 rounded-xl text-xs font-semibold text-neutral-200 hover:text-white hover:bg-neutral-800/80 transition-all flex items-center gap-1.5 shadow-lg border border-neutral-700/60"
          title="Recenter to my location"
        >
          <span>🎯</span>
          <span>Recenter GPS</span>
        </button>
      </div>

      {/* Bottom Map Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] pointer-events-none hidden sm:flex items-center gap-3">
        <div className="glass-panel px-3 py-1.5 rounded-lg text-[11px] text-neutral-300 flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"></span> You (GPS)
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block text-xs">👨‍🍳</span> Available Chef
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <span className="inline-block w-2.5 h-0.5 bg-amber-400"></span> Radius {radiusKm}km
          </span>
        </div>
      </div>
    </div>
  );
};
