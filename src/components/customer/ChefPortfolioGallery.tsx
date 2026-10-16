import React, { useState } from 'react';
import { Chef, PortfolioItem } from '../../types';
import { Sparkles, X, ZoomIn, Clock, Utensils, Award } from 'lucide-react';

interface ChefPortfolioGalleryProps {
  chef: Chef;
  onSelectDishForBooking?: (dishTitle: string) => void;
}

export const ChefPortfolioGallery: React.FC<ChefPortfolioGalleryProps> = ({
  chef,
  onSelectDishForBooking,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeItem, setActiveItem] = useState<PortfolioItem | null>(null);

  // Fallback to galleryImages if no portfolio items defined
  const portfolioItems: PortfolioItem[] = chef.portfolio && chef.portfolio.length > 0
    ? chef.portfolio
    : (chef.galleryImages || []).map((img, idx) => ({
        id: `port-fb-${idx}`,
        title: chef.signatureDishes[idx] || `Signature Creation ${idx + 1}`,
        imageUrl: img,
        category: idx === 0 ? 'Banquet Platters' : idx === 1 ? 'Live Grills & Counters' : 'Artisanal Plated',
        platingStyle: 'Fine Dining Event Presentation',
        description: `Handcrafted specialty by ${chef.name}. Prepared with premium ingredients, specialized seasoning techniques, and immaculate contemporary plating.`,
        prepTime: '2 - 3 Hours Slow Cooking',
        pairingNotes: 'Complimentary artisanal bread & dips',
      }));

  const categories = [
    { id: 'all', label: 'All Dishes' },
    { id: 'Banquet Platters', label: 'Banquet Platters' },
    { id: 'Live Grills & Counters', label: 'Live Grills' },
    { id: 'Artisanal Plated', label: 'Artisanal Plated' },
    { id: 'Gourmet Desserts', label: 'Desserts' },
  ];

  const filteredItems = selectedCategory === 'all'
    ? portfolioItems
    : portfolioItems.filter((item) => item.category === selectedCategory);

  return (
    <div className="mt-5 pt-5 border-t border-neutral-800 space-y-4">
      
      {/* Section Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400">✨</span>
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">
              Culinary Portfolio & Plating Showcase
            </h4>
          </div>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            High-resolution presentation history for luxury events, private dinners & banquets
          </p>
        </div>

        <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
          Luxury Standard
        </span>
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              selectedCategory === cat.id
                ? 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Portfolio Image Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveItem(item)}
            className="group relative rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800/80 hover:border-amber-500/60 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 flex flex-col justify-between"
          >
            {/* Image Box */}
            <div className="relative h-32 sm:h-36 w-full overflow-hidden bg-neutral-900">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />
              
              {/* Category Pill Tag */}
              <div className="absolute top-2 left-2">
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-amber-300 border border-white/10">
                  {item.category}
                </span>
              </div>

              {/* Hover Zoom Icon */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-full p-1 text-white">
                <ZoomIn size={13} />
              </div>
            </div>

            {/* Dish Card Content */}
            <div className="p-2.5 flex-1 flex flex-col justify-between">
              <div>
                <h5 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                  {item.title}
                </h5>
                <p className="text-[10px] text-neutral-400 mt-0.5 line-clamp-1">
                  {item.platingStyle}
                </p>
              </div>

              <div className="mt-2 pt-1.5 border-t border-neutral-900 flex items-center justify-between text-[10px] text-neutral-400">
                <span className="text-amber-400 font-semibold group-hover:underline">
                  Inspect Plating →
                </span>
                {item.prepTime && (
                  <span className="text-neutral-500">{item.prepTime}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trust Callout */}
      <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-start gap-2.5 text-xs">
        <Sparkles size={16} className="text-purple-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-purple-200">Banquets & Plated Fine Dining Guarantee:</span>
          <p className="text-[11px] text-neutral-300 mt-0.5 leading-snug">
            All signature event dishes are fabricated on-site with live flame control, authentic regional marinades, and five-star luxury presentation standards.
          </p>
        </div>
      </div>

      {/* High-Resolution Dish Lightbox & Plating Details Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-[2300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-700 rounded-3xl overflow-hidden shadow-2xl text-neutral-100 max-h-[92vh] flex flex-col">
            
            {/* Close Button */}
            <button
              onClick={() => setActiveItem(null)}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/70 hover:bg-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>

            {/* High-Resolution Hero Food Photo */}
            <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-neutral-950 shrink-0">
              <img
                src={activeItem.imageUrl}
                alt={activeItem.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-black/40" />

              <div className="absolute bottom-4 left-5 right-5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500 text-neutral-950">
                  {activeItem.category}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-2 drop-shadow-md">
                  {activeItem.title}
                </h3>
                <p className="text-xs text-amber-300 font-semibold mt-0.5">
                  {activeItem.platingStyle}
                </p>
              </div>
            </div>

            {/* Modal Body: Plating Notes, Prep Time & Techniques */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              
              <div>
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Utensils size={13} className="text-amber-400" />
                  <span>Culinary Technique & Fabrication</span>
                </h4>
                <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed bg-neutral-950/60 p-3.5 rounded-2xl border border-neutral-800">
                  {activeItem.description}
                </p>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                {activeItem.prepTime && (
                  <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-2.5">
                    <Clock size={16} className="text-emerald-400" />
                    <div>
                      <div className="text-[10px] text-neutral-500 uppercase">Preparation Method</div>
                      <div className="font-bold text-white">{activeItem.prepTime}</div>
                    </div>
                  </div>
                )}

                {activeItem.pairingNotes && (
                  <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-2.5">
                    <Award size={16} className="text-amber-400" />
                    <div>
                      <div className="text-[10px] text-neutral-500 uppercase">Recommended Accompaniments</div>
                      <div className="font-bold text-white truncate max-w-[180px]">{activeItem.pairingNotes}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-[11px] text-neutral-400">
                  Crafted by <strong className="text-white">{chef.name}</strong> • Available for on-demand & luxury catering
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (onSelectDishForBooking) {
                      onSelectDishForBooking(activeItem.title);
                    }
                    setActiveItem(null);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-black text-xs hover:from-amber-400 hover:to-amber-500 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20"
                >
                  <span>🍛 Request This Dish in Booking</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
