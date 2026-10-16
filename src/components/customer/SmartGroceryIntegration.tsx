import React, { useState } from 'react';
import {
  QUICK_COMMERCE_PLATFORMS,
  QuickCommercePlatformId,
  getGroceryKitForDish,
  GroceryItem,
} from '../../data/groceryCatalog';
import { ShoppingBag, Zap, Clock, ExternalLink, Check, RefreshCw } from 'lucide-react';

interface SmartGroceryIntegrationProps {
  dishesText: string;
  chefEtaMinutes?: number;
  customerArea?: string;
  onCartDispatched?: (platform: string, totalAmount: number) => void;
  variant?: 'embedded' | 'modal' | 'compact';
}

export const SmartGroceryIntegration: React.FC<SmartGroceryIntegrationProps> = ({
  dishesText,
  chefEtaMinutes = 28,
  customerArea = 'Indiranagar, Bengaluru',
  onCartDispatched,
  variant = 'embedded',
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<QuickCommercePlatformId>('zepto');
  const [groceryKit, setGroceryKit] = useState(() => getGroceryKitForDish(dishesText));
  const [checkedItemIds, setCheckedItemIds] = useState<Set<string>>(() => {
    const kit = getGroceryKitForDish(dishesText);
    return new Set(kit.items.map((i) => i.id));
  });
  const [isOrdered, setIsOrdered] = useState(false);
  const [orderCountdown, setOrderCountdown] = useState(10);

  // Sync kit if dishesText changes
  React.useEffect(() => {
    const newKit = getGroceryKitForDish(dishesText);
    setGroceryKit(newKit);
    setCheckedItemIds(new Set(newKit.items.map((i) => i.id)));
  }, [dishesText]);

  const toggleItem = (id: string) => {
    setCheckedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectedPlatformData =
    QUICK_COMMERCE_PLATFORMS.find((p) => p.id === selectedPlatform) || QUICK_COMMERCE_PLATFORMS[0];

  const totalGroceryAmount = groceryKit.items
    .filter((item) => checkedItemIds.has(item.id))
    .reduce((sum, item) => sum + item.estimatedPrice, 0);

  const selectedCount = checkedItemIds.size;

  const handleLaunchGroceryOrder = () => {
    setIsOrdered(true);
    setOrderCountdown(selectedPlatformData.etaMinutes);
    if (onCartDispatched) {
      onCartDispatched(selectedPlatformData.name, totalGroceryAmount);
    }

    // Generate query string for external deep link
    const query = encodeURIComponent(
      groceryKit.items
        .filter((i) => checkedItemIds.has(i.id))
        .map((i) => i.name)
        .slice(0, 3)
        .join(' ')
    );

    // If running in browser, open web deep link in new tab or handle gracefully
    try {
      const url = `${selectedPlatformData.webBaseUrl}${query}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      // ignore popup blocking in sandboxed preview
    }
  };

  return (
    <div className={`rounded-3xl border bg-neutral-900/90 text-neutral-100 overflow-hidden shadow-2xl transition-all ${
      variant === 'compact' ? 'p-4 border-amber-500/30' : 'p-5 sm:p-6 border-neutral-800'
    }`}>
      {/* Top Banner: The Bangalore Hack */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-amber-500/20 border border-purple-500/40 text-purple-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 font-mono">
              <Zap size={11} className="text-amber-400" />
              <span>THE BANGALORE HACK</span>
            </span>
            <span className="text-xs font-bold text-neutral-400">
              Auto Pre-Filled Grocery Cart
            </span>
          </div>
          <h3 className="text-base font-black text-white mt-1">
            Ingredients Arrive Exactly When Chef Does
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Auto-generated ingredient kit for <span className="text-amber-400 font-semibold">{groceryKit.dishName}</span> in {customerArea}.
          </p>
        </div>

        {/* Live Synchronization Timer Widget */}
        <div className="flex items-center gap-3 bg-neutral-950 p-3 rounded-2xl border border-neutral-800 shrink-0">
          <div className="text-center pr-3 border-r border-neutral-800">
            <div className="text-[10px] uppercase font-bold text-neutral-400">Grocery ETA</div>
            <div className="text-lg font-black text-emerald-400 font-mono">
              {isOrdered ? `${orderCountdown}m` : `${selectedPlatformData.etaMinutes} mins`}
            </div>
          </div>
          <div className="text-center pl-1">
            <div className="text-[10px] uppercase font-bold text-neutral-400">Chef ETA</div>
            <div className="text-lg font-black text-amber-400 font-mono">{chefEtaMinutes} mins</div>
          </div>
        </div>
      </div>

      {/* Sync Timeline Progress Bar */}
      <div className="my-4 p-3 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-neutral-950 to-amber-950/30 border border-emerald-500/20 text-xs">
        <div className="flex items-center justify-between text-[11px] font-bold text-neutral-300 mb-1.5">
          <span className="text-emerald-400 flex items-center gap-1">
            <Check size={12} />
            <span>{selectedPlatformData.name} ({selectedPlatformData.etaMinutes}m Blitz Arrival)</span>
          </span>
          <span className="text-neutral-500 font-mono">Gap: ~{Math.max(0, chefEtaMinutes - selectedPlatformData.etaMinutes)} mins ready ahead</span>
          <span className="text-amber-400">Chef Knives Out ({chefEtaMinutes}m)</span>
        </div>
        <div className="relative w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
          <div
            className="absolute left-0 top-0 bottom-0 bg-emerald-500 rounded-full"
            style={{ width: `${(selectedPlatformData.etaMinutes / chefEtaMinutes) * 100}%` }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-3 h-3 -mt-0.5 rounded-full bg-amber-400 shadow-md ring-2 ring-amber-300"
          />
        </div>
        <p className="text-[10px] text-neutral-400 mt-1.5 italic">
          💡 Groceries reach your doorstep in {selectedPlatformData.etaMinutes} mins. Fresh ingredients will be washed & waiting on your kitchen slab when your chef rings the doorbell!
        </p>
      </div>

      {/* Platform Selector Tabs: Zepto, Blinkit, BigBasket */}
      <div className="my-3">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
          Select Delivery Network:
        </label>
        <div className="grid grid-cols-3 gap-2">
          {QUICK_COMMERCE_PLATFORMS.map((platform) => {
            const isSelected = selectedPlatform === platform.id;
            return (
              <button
                key={platform.id}
                type="button"
                onClick={() => setSelectedPlatform(platform.id)}
                className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-neutral-800 border-amber-500 shadow-lg ring-1 ring-amber-500/50'
                    : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 text-neutral-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base">{platform.logo}</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-neutral-900 border border-neutral-700 text-emerald-400">
                    {platform.etaMinutes}m
                  </span>
                </div>
                <div className="text-xs font-black text-white mt-1.5">{platform.name}</div>
                <div className="text-[10px] text-neutral-400 truncate hidden sm:block">
                  {platform.badge}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pre-Filled Ingredient Checklist */}
      <div className="my-4 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-neutral-300">
          <span>Pre-Filled Cart ({selectedCount} items selected)</span>
          <span className="text-amber-400 font-mono font-bold">Subtotal: ₹{totalGroceryAmount}</span>
        </div>

        <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
          {groceryKit.items.map((item) => {
            const isChecked = checkedItemIds.has(item.id);
            return (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs cursor-pointer transition-all ${
                  isChecked
                    ? 'bg-neutral-950 border-neutral-800 text-neutral-200'
                    : 'bg-neutral-950/40 border-neutral-900 text-neutral-500 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                      isChecked
                        ? 'bg-amber-500 border-amber-400 text-neutral-950 font-bold'
                        : 'border-neutral-700 bg-neutral-900'
                    }`}
                  >
                    {isChecked && <Check size={12} strokeWidth={3} />}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-white truncate">{item.name}</div>
                    <div className="text-[10px] text-neutral-400">
                      {item.brand} • {item.packSize}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-bold text-amber-400">₹{item.estimatedPrice}</div>
                  <div className="text-[9px] text-neutral-500 uppercase">{item.category}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation State or Action Button */}
      {isOrdered ? (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 animate-in zoom-in-95">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-bounce">🛵</span>
            <div>
              <div className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                <span>{selectedPlatformData.name} Cart Dispatched!</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                  ETA {selectedPlatformData.etaMinutes}m
                </span>
              </div>
              <p className="text-[11px] text-neutral-300 mt-0.5">
                Delivery rider is picking up your {selectedCount} ingredients from nearest dark store.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOrdered(false)}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs shrink-0 cursor-pointer"
            title="Re-open cart"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
          <button
            type="button"
            onClick={handleLaunchGroceryOrder}
            className={`flex-1 w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl cursor-pointer ${
              selectedPlatform === 'zepto'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-950/50'
                : selectedPlatform === 'blinkit'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-neutral-950 shadow-amber-950/50'
                : 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-neutral-950 shadow-orange-950/50'
            }`}
          >
            <ShoppingBag size={15} />
            <span>
              1-Click Auto-Order Cart on {selectedPlatformData.name} (₹{totalGroceryAmount})
            </span>
            <ExternalLink size={13} />
          </button>
        </div>
      )}
    </div>
  );
};
