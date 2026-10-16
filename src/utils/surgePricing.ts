/**
 * Dynamic Radius Pricing (Surge) Engine
 * Implements real-time hyper-local demand-supply pricing incentives
 * (e.g. torrential rain in Koramangala, Diwali festival rush, late-night SOS).
 */

export type SurgeTriggerType = 'normal' | 'rain_monsoon' | 'diwali_festival' | 'late_night';

export interface SurgeCondition {
  id: SurgeTriggerType;
  label: string;
  badge: string;
  multiplier: number; // e.g. 1.35x
  description: string;
  affectedRadiusKm: number;
  incentiveBonusChef: number; // in INR ₹ added directly to chef wallet
  icon: string;
  colorClass: string;
}

export const SURGE_PRESETS: Record<SurgeTriggerType, SurgeCondition> = {
  normal: {
    id: 'normal',
    label: 'Standard Market Pricing',
    badge: '1.0x Base',
    multiplier: 1.0,
    description: 'Equilibrium demand across Bengaluru kitchens. Standard base fee applies.',
    affectedRadiusKm: 5,
    incentiveBonusChef: 0,
    icon: '☀️',
    colorClass: 'text-neutral-400 bg-neutral-800 border-neutral-700',
  },
  rain_monsoon: {
    id: 'rain_monsoon',
    label: 'Monsoon Cloudburst Surge',
    badge: '1.35x Weather Surge',
    multiplier: 1.35,
    description: 'Heavy rain in Koramangala & Indiranagar. Higher fee mobilizes chefs with rain gear & water-resistant knife kits.',
    affectedRadiusKm: 3.5,
    incentiveBonusChef: 250,
    icon: '🌧️',
    colorClass: 'text-cyan-300 bg-cyan-950/60 border-cyan-500/40',
  },
  diwali_festival: {
    id: 'diwali_festival',
    label: 'Diwali & Festival Feast Surge',
    badge: '1.50x Festive Rush',
    multiplier: 1.50,
    description: 'Peak festive banquet demand. Surge bonus guarantees chef availability for high-capacity family parties.',
    affectedRadiusKm: 5.0,
    incentiveBonusChef: 400,
    icon: '🪔',
    colorClass: 'text-amber-300 bg-amber-950/60 border-amber-500/40',
  },
  late_night: {
    id: 'late_night',
    label: 'Late Night SOS Cravings (10 PM - 3 AM)',
    badge: '1.25x Night Shift',
    multiplier: 1.25,
    description: 'Post-shift night cravings & party emergency fixes. Extra compensation for late-night chef commutes.',
    affectedRadiusKm: 4.0,
    incentiveBonusChef: 200,
    icon: '🌙',
    colorClass: 'text-purple-300 bg-purple-950/60 border-purple-500/40',
  },
};

export interface CalculatedPricingBreakdown {
  baseAmount: number;
  surgeMultiplier: number;
  surgeAddedAmount: number;
  finalChefPayout: number;
  platformFee: number;
  gstAmount: number;
  totalCustomerPayable: number;
  condition: SurgeCondition;
}

export function calculateSurgePricing(
  baseChefRate: number,
  conditionKey: SurgeTriggerType = 'normal'
): CalculatedPricingBreakdown {
  const condition = SURGE_PRESETS[conditionKey] || SURGE_PRESETS.normal;
  const surgeAddedAmount = Math.round(baseChefRate * (condition.multiplier - 1.0));
  const finalChefPayout = baseChefRate + surgeAddedAmount;
  const platformFee = 49;
  const subtotal = finalChefPayout + platformFee;
  const gstAmount = Math.round(subtotal * 0.18);
  const totalCustomerPayable = subtotal + gstAmount;

  return {
    baseAmount: baseChefRate,
    surgeMultiplier: condition.multiplier,
    surgeAddedAmount,
    finalChefPayout,
    platformFee,
    gstAmount,
    totalCustomerPayable,
    condition,
  };
}
