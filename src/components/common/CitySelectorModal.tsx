import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Search,
  Navigation,
  Check,
  Building2,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  X,
  Compass,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { CityInfo, CityArea } from '../../types';
import { INDIAN_CITIES, searchCitiesAndAreas, createCustomIndianCity } from '../../data/indianCities';

interface CitySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCity: CityInfo;
  selectedArea: CityArea;
  onSelectCityAndArea: (city: CityInfo, area: CityArea) => void;
}

export const CitySelectorModal: React.FC<CitySelectorModalProps> = ({
  isOpen,
  onClose,
  selectedCity,
  selectedArea,
  onSelectCityAndArea,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRegion, setActiveRegion] = useState<'All' | 'Metro' | 'South' | 'North' | 'West' | 'East & Central'>('All');
  const [tempSelectedCity, setTempSelectedCity] = useState<CityInfo>(selectedCity);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsDetectedMessage, setGpsDetectedMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter cities by search query and region
  const filteredCities = useMemo(() => {
    let list = INDIAN_CITIES;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return INDIAN_CITIES.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.state.toLowerCase().includes(q) ||
          c.tagline.toLowerCase().includes(q) ||
          c.areas.some(a => a.name.toLowerCase().includes(q) || a.label.toLowerCase().includes(q))
      );
    }

    if (activeRegion === 'Metro') {
      return list.filter(c => c.tier === 'Metro');
    }
    if (activeRegion === 'South') {
      return list.filter(c => c.region === 'South');
    }
    if (activeRegion === 'North') {
      return list.filter(c => c.region === 'North');
    }
    if (activeRegion === 'West') {
      return list.filter(c => c.region === 'West');
    }
    if (activeRegion === 'East & Central') {
      return list.filter(c => c.region === 'East' || c.region === 'Central');
    }

    return list;
  }, [searchQuery, activeRegion]);

  const handleSelectCity = (city: CityInfo) => {
    setTempSelectedCity(city);
    // Automatically pick the first area or preserve equivalent if matched
    const defaultArea = city.areas[0];
    onSelectCityAndArea(city, defaultArea);
    onClose();
  };

  const handleSelectArea = (area: CityArea) => {
    onSelectCityAndArea(tempSelectedCity, area);
    onClose();
  };

  const handleSimulateGps = () => {
    setIsDetectingGps(true);
    setGpsDetectedMessage('Triangulating GPS coordinates within Indian telecom network...');
    setTimeout(() => {
      // Pick current selected or toggle between Bangalore / Mumbai / Delhi
      const sampleCity = tempSelectedCity.id === 'bengaluru' ? INDIAN_CITIES[1] : INDIAN_CITIES[0];
      setTempSelectedCity(sampleCity);
      onSelectCityAndArea(sampleCity, sampleCity.areas[0]);
      setIsDetectingGps(false);
      setGpsDetectedMessage(`📍 Located in ${sampleCity.name} (${sampleCity.areas[0].label})! Active chefs loaded.`);
      setTimeout(() => {
        onClose();
      }, 700);
    }, 900);
  };

  const handleCreateCustomCity = () => {
    if (!searchQuery.trim()) return;
    const custom = createCustomIndianCity(searchQuery.trim());
    onSelectCityAndArea(custom, custom.areas[0]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-neutral-800 bg-neutral-950/70 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <span>🇮🇳</span>
                <span>Pan-India Coverage</span>
              </span>
              <span className="text-xs text-neutral-400 font-medium">
                25+ Metros & Tier-1/2 Hubs
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Select Your City & Culinary Hub
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Currently serving: <span className="text-amber-400 font-bold">{selectedCity.name}</span> • Hub:{' '}
              <span className="text-white font-semibold">{selectedArea.label}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & GPS Action Bar */}
        <div className="p-4 sm:p-6 pb-2 space-y-4 bg-neutral-900">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any Indian city, district, or area (e.g. Bandra, Jubilee Hills, Gurugram, Goa, Kochi)..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-white placeholder-neutral-500 text-sm focus:outline-none transition-colors"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleSimulateGps}
              disabled={isDetectingGps}
              className="px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
            >
              <Navigation className={`w-4 h-4 text-amber-400 ${isDetectingGps ? 'animate-spin' : ''}`} />
              <span>{isDetectingGps ? 'Detecting Location...' : 'Use Current GPS'}</span>
            </button>
          </div>

          {gpsDetectedMessage && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 shrink-0" />
              <span>{gpsDetectedMessage}</span>
            </div>
          )}

          {/* Region Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
            {(['All', 'Metro', 'South', 'North', 'West', 'East & Central'] as const).map((region) => (
              <button
                key={region}
                onClick={() => {
                  setActiveRegion(region);
                  setSearchQuery('');
                }}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  activeRegion === region && !searchQuery
                    ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                    : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700'
                }`}
              >
                {region === 'All' ? '🇮🇳 All India (25+)' : region}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body: Two columns if a city is active, or responsive grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Column 1 & 2: Cities Grid */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-neutral-400 mb-1">
              <span>Cities ({filteredCities.length})</span>
              <span className="text-[11px] text-neutral-500">Tap to select or explore hubs</span>
            </div>

            {filteredCities.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-neutral-950/50 border border-neutral-800 space-y-4">
                <p className="text-sm text-neutral-300">
                  No indexed city found for &ldquo;<span className="text-amber-400 font-bold">{searchQuery}</span>&rdquo;.
                </p>
                <button
                  type="button"
                  onClick={handleCreateCustomCity}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 text-neutral-950 font-black text-xs hover:bg-amber-400 transition-colors inline-flex items-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Activate &ldquo;{searchQuery}&rdquo; Culinary Hub in India</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
                {filteredCities.map((city) => {
                  const isCurrent = city.id === selectedCity.id;
                  const isTemp = city.id === tempSelectedCity.id;
                  return (
                    <div
                      key={city.id}
                      onClick={() => handleSelectCity(city)}
                      className={`group relative p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/10'
                          : isTemp
                          ? 'bg-neutral-800/80 border-amber-500/50'
                          : 'bg-neutral-950/70 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-black text-white group-hover:text-amber-400 transition-colors">
                              {city.name}
                            </span>
                            <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700 font-mono">
                              {city.code}
                            </span>
                          </div>

                          {isCurrent && (
                            <span className="w-5 h-5 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center text-xs font-black shadow-xs">
                              ✓
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-neutral-400 line-clamp-1 mb-2">
                          {city.state} • {city.tagline}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60 text-[10px]">
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span>{city.activeChefsCount} Chefs Online</span>
                        </span>
                        <span className="text-neutral-500 font-mono">
                          {city.statePoliceCode}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Column 3: Neighborhood / Local Hub Details for Active City */}
          <div className="space-y-4 rounded-2xl bg-neutral-950/70 border border-neutral-800 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div>
                  <div className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
                    Active City Hubs
                  </div>
                  <h3 className="text-lg font-black text-white flex items-center gap-1.5">
                    <span>{tempSelectedCity.name}</span>
                    <span className="text-xs text-neutral-400 font-normal">({tempSelectedCity.state})</span>
                  </h3>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono font-bold">
                  {tempSelectedCity.code}
                </span>
              </div>

              {/* Police Clearance & CCTNS Badge */}
              <div className="mt-3 p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Police jurisdiction</span>
                </div>
                <p className="text-[10px] text-neutral-400 leading-tight">
                  {tempSelectedCity.statePoliceJurisdiction}
                </p>
              </div>

              {/* Local Areas List */}
              <div className="mt-3">
                <div className="text-xs font-bold text-neutral-300 mb-2">
                  Select Specific Neighborhood / Area:
                </div>
                <div className="space-y-1.5 max-h-[28vh] overflow-y-auto pr-1">
                  {tempSelectedCity.areas.map((area) => {
                    const isAreaActive =
                      tempSelectedCity.id === selectedCity.id && area.name === selectedArea.name;
                    return (
                      <button
                        key={area.name}
                        type="button"
                        onClick={() => handleSelectArea(area)}
                        className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between group ${
                          isAreaActive
                            ? 'bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/20'
                            : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white border border-neutral-800/80'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className={`w-3.5 h-3.5 ${isAreaActive ? 'text-neutral-950' : 'text-amber-400'}`} />
                          <span className="truncate">{area.label}</span>
                        </div>
                        {isAreaActive ? (
                          <Check className="w-3.5 h-3.5 text-neutral-950" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-300" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Popular Cuisines in this city */}
            <div className="pt-3 border-t border-neutral-800">
              <div className="text-[11px] font-bold text-neutral-400 mb-1.5 flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-400" />
                <span>Popular in {tempSelectedCity.name}:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {tempSelectedCity.popularCuisines.map((c) => (
                  <span
                    key={c}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-900 text-neutral-300 border border-neutral-800"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-neutral-800 bg-neutral-950/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Verification is shown only after ChefPulse completes and records the required checks.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectCityAndArea(tempSelectedCity, tempSelectedCity.areas[0]);
                onClose();
              }}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black transition-colors shadow-md shadow-amber-500/20"
            >
              Confirm {tempSelectedCity.name}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
