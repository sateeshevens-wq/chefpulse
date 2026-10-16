/**
 * Tiered Regional Pricing Engine for ChefPulse Pan-India Operations
 * 
 * Configures distinct baseline costs, platform fees, minimum guaranteed payouts,
 * and hyper-local surge parameters per city (e.g. Mumbai vs Lucknow vs Bengaluru).
 */

import { SurgeTriggerType, SURGE_PRESETS, SurgeCondition } from './surgePricing';

export interface CityPricingConfig {
  cityId: string;
  cityName: string;
  state: string;
  tier: 'Metro' | 'Tier-1' | 'Tier-2';
  baseFareSos: number;        // Base fare for emergency SOS Quick-Fix in INR ₹
  baseFareMealPrep: number;   // Base fare for daily meal prep package in INR ₹
  baseFareB2BShift: number;   // Base fare for 6-hr commercial shift in INR ₹
  platformFee: number;        // Platform & Safety fee in INR ₹ (e.g. ₹69 in Mumbai, ₹35 in Lucknow)
  minChefPayout: number;      // Minimum guaranteed payout to chef per job in INR ₹
  surgeMultiplier: number;    // Regional baseline surge multiplier (1.0x to 2.5x)
  activeSurgeCondition: SurgeTriggerType;
  trafficRadiusCapKm: number; // e.g. 3.0km during extreme traffic
  weatherAlert?: string | null;
}

export const INITIAL_CITY_PRICING: Record<string, CityPricingConfig> = {
  mumbai: {
    cityId: 'mumbai',
    cityName: 'Mumbai',
    state: 'Maharashtra',
    tier: 'Metro',
    baseFareSos: 899,
    baseFareMealPrep: 1650,
    baseFareB2BShift: 3400,
    platformFee: 69,
    minChefPayout: 750,
    surgeMultiplier: 1.35,
    activeSurgeCondition: 'rain_monsoon',
    trafficRadiusCapKm: 3.5,
    weatherAlert: 'Monsoon High Tide in Colaba / Bandra Sea Face',
  },
  bengaluru: {
    cityId: 'bengaluru',
    cityName: 'Bengaluru',
    state: 'Karnataka',
    tier: 'Metro',
    baseFareSos: 799,
    baseFareMealPrep: 1450,
    baseFareB2BShift: 3000,
    platformFee: 49,
    minChefPayout: 650,
    surgeMultiplier: 1.25,
    activeSurgeCondition: 'normal',
    trafficRadiusCapKm: 4.0,
    weatherAlert: 'Peak Tech Corridor Traffic on ORR & Silk Board',
  },
  delhi_ncr: {
    cityId: 'delhi_ncr',
    cityName: 'Delhi NCR',
    state: 'National Capital Region',
    tier: 'Metro',
    baseFareSos: 849,
    baseFareMealPrep: 1550,
    baseFareB2BShift: 3200,
    platformFee: 59,
    minChefPayout: 700,
    surgeMultiplier: 1.30,
    activeSurgeCondition: 'normal',
    trafficRadiusCapKm: 5.0,
    weatherAlert: 'Winter Smog Advisory & Peak Dinner Rush',
  },
  hyderabad: {
    cityId: 'hyderabad',
    cityName: 'Hyderabad',
    state: 'Telangana',
    tier: 'Metro',
    baseFareSos: 749,
    baseFareMealPrep: 1350,
    baseFareB2BShift: 2800,
    platformFee: 45,
    minChefPayout: 600,
    surgeMultiplier: 1.20,
    activeSurgeCondition: 'normal',
    trafficRadiusCapKm: 4.5,
  },
  chennai: {
    cityId: 'chennai',
    cityName: 'Chennai',
    state: 'Tamil Nadu',
    tier: 'Metro',
    baseFareSos: 729,
    baseFareMealPrep: 1300,
    baseFareB2BShift: 2750,
    platformFee: 45,
    minChefPayout: 580,
    surgeMultiplier: 1.15,
    activeSurgeCondition: 'normal',
    trafficRadiusCapKm: 4.5,
  },
  kolkata: {
    cityId: 'kolkata',
    cityName: 'Kolkata',
    state: 'West Bengal',
    tier: 'Metro',
    baseFareSos: 699,
    baseFareMealPrep: 1250,
    baseFareB2BShift: 2600,
    platformFee: 39,
    minChefPayout: 550,
    surgeMultiplier: 1.15,
    activeSurgeCondition: 'normal',
    trafficRadiusCapKm: 4.5,
  },
  pune: {
    cityId: 'pune',
    cityName: 'Pune',
    state: 'Maharashtra',
    tier: 'Tier-1',
    baseFareSos: 679,
    baseFareMealPrep: 1200,
    baseFareB2BShift: 2500,
    platformFee: 39,
    minChefPayout: 520,
    surgeMultiplier: 1.10,
    activeSurgeCondition: 'normal',
    trafficRadiusCapKm: 4.5,
  },
  ahmedabad: {
    cityId: 'ahmedabad',
    cityName: 'Ahmedabad',
    state: 'Gujarat',
    tier: 'Tier-1',
    baseFareSos: 649,
    baseFareMealPrep: 1150,
    baseFareB2BShift: 2400,
    platformFee: 39,
    minChefPayout: 500,
    surgeMultiplier: 1.10,
    activeSurgeCondition: 'normal',
    trafficRadiusCapKm: 4.5,
  },
  jaipur: {
    cityId: 'jaipur',
    cityName: 'Jaipur',
    state: 'Rajasthan',
    tier: 'Tier-1',
    baseFareSos: 629,
    baseFareMealPrep: 1100,
    baseFareB2BShift: 2350,
    platformFee: 35,
    minChefPayout: 480,
    surgeMultiplier: 1.15,
    activeSurgeCondition: 'normal',
    trafficRadiusCapKm: 5.0,
  },
  chandigarh: {
    cityId: 'chandigarh',
    cityName: 'Chandigarh / Tricity',
    state: 'Punjab / Haryana',
    tier: 'Tier-1',
    baseFareSos: 659,
    baseFareMealPrep: 1200,
    baseFareB2BShift: 2500,
    platformFee: 39,
    minChefPayout: 520,
    surgeMultiplier: 1.15,
    activeSurgeCondition: 'normal',
    trafficRadiusCapKm: 5.0,
  },
  lucknow: {
    cityId: 'lucknow',
    cityName: 'Lucknow',
    state: 'Uttar Pradesh',
    tier: 'Tier-1',
    baseFareSos: 549,
    baseFareMealPrep: 999,
    baseFareB2BShift: 2200,
    platformFee: 35,
    minChefPayout: 450,
    surgeMultiplier: 1.05,
    activeSurgeCondition: 'normal',
    trafficRadiusCapKm: 5.0,
    weatherAlert: 'Heritage Dastarkhwan Special Peak',
  },
  goa: {
    cityId: 'goa',
    cityName: 'Goa',
    state: 'Goa',
    tier: 'Tier-2',
    baseFareSos: 849,
    baseFareMealPrep: 1600,
    baseFareB2BShift: 3200,
    platformFee: 59,
    minChefPayout: 680,
    surgeMultiplier: 1.30,
    activeSurgeCondition: 'normal',
    trafficRadiusCapKm: 6.0,
    weatherAlert: 'Beachfront Villa High Season Surcharge',
  },
  kochi: {
    cityId: 'kochi',
    cityName: 'Kochi',
    state: 'Kerala',
    tier: 'Tier-2',
    baseFareSos: 529,
    baseFareMealPrep: 950,
    baseFareB2BShift: 2100,
    platformFee: 29,
    minChefPayout: 420,
    surgeMultiplier: 1.0,
    activeSurgeCondition: 'normal',
    trafficRadiusCapKm: 5.0,
  },
  indore: {
    cityId: 'indore',
    cityName: 'Indore',
    state: 'Madhya Pradesh',
    tier: 'Tier-2',
    baseFareSos: 499,
    baseFareMealPrep: 899,
    baseFareB2BShift: 2000,
    platformFee: 29,
    minChefPayout: 400,
    surgeMultiplier: 1.0,
    activeSurgeCondition: 'normal',
    trafficRadiusCapKm: 5.0,
  },
  bhubaneswar: {
    cityId: 'bhubaneswar',
    cityName: 'Bhubaneswar',
    state: 'Odisha',
    tier: 'Tier-2',
    baseFareSos: 499,
    baseFareMealPrep: 899,
    baseFareB2BShift: 2000,
    platformFee: 29,
    minChefPayout: 400,
    surgeMultiplier: 1.0,
    activeSurgeCondition: 'normal',
    trafficRadiusCapKm: 5.0,
  },
  patna: {
    cityId: 'patna',
    cityName: 'Patna',
    state: 'Bihar',
    tier: 'Tier-2',
    baseFareSos: 489,
    baseFareMealPrep: 879,
    baseFareB2BShift: 1950,
    platformFee: 29,
    minChefPayout: 390,
    surgeMultiplier: 1.0,
    activeSurgeCondition: 'normal',
    trafficRadiusCapKm: 5.0,
  },
};

export function getCityPricing(cityId: string, customConfigs?: Record<string, CityPricingConfig>): CityPricingConfig {
  const configs = customConfigs || INITIAL_CITY_PRICING;
  const normalizedId = cityId.toLowerCase();
  
  if (configs[normalizedId]) {
    return configs[normalizedId];
  }

  // Fallback default based on Tier-2 pricing
  return {
    cityId: normalizedId,
    cityName: cityId.charAt(0).toUpperCase() + cityId.slice(1),
    state: 'India',
    tier: 'Tier-2',
    baseFareSos: 499,
    baseFareMealPrep: 899,
    baseFareB2BShift: 2000,
    platformFee: 29,
    minChefPayout: 400,
    surgeMultiplier: 1.0,
    activeSurgeCondition: 'normal',
    trafficRadiusCapKm: 5.0,
  };
}

export interface CityPricingBreakdown {
  cityId: string;
  cityName: string;
  serviceType: 'sos_quick_fix' | 'scheduled_prep' | 'b2b_gig_shift';
  baseRate: number;
  surgeMultiplier: number;
  surgeAddedAmount: number;
  finalChefPayout: number;
  platformFee: number;
  gstAmount: number;
  totalCustomerPayable: number;
  tier: string;
  minChefPayoutGuaranteed: number;
}

export function calculateRegionalPricing(
  cityId: string,
  serviceType: 'sos_quick_fix' | 'scheduled_prep' | 'b2b_gig_shift',
  customChefRate?: number,
  customConfigs?: Record<string, CityPricingConfig>
): CityPricingBreakdown {
  const cityConfig = getCityPricing(cityId, customConfigs);
  
  let baseRate: number;
  if (customChefRate && customChefRate > 0) {
    baseRate = customChefRate;
  } else {
    if (serviceType === 'sos_quick_fix') baseRate = cityConfig.baseFareSos;
    else if (serviceType === 'scheduled_prep') baseRate = cityConfig.baseFareMealPrep;
    else baseRate = cityConfig.baseFareB2BShift;
  }

  // Check surge condition multiplier or city baseline surge
  const surgeCond = SURGE_PRESETS[cityConfig.activeSurgeCondition] || SURGE_PRESETS.normal;
  const effectiveMultiplier = Math.max(cityConfig.surgeMultiplier, surgeCond.multiplier);
  
  const surgeAddedAmount = Math.round(baseRate * (effectiveMultiplier - 1.0));
  const rawChefPayout = baseRate + surgeAddedAmount;
  // Ensure minimum guaranteed chef payout for this city tier
  const finalChefPayout = Math.max(rawChefPayout, cityConfig.minChefPayout);

  const platformFee = cityConfig.platformFee;
  const subtotal = finalChefPayout + platformFee;
  const gstAmount = Math.round(subtotal * 0.18);
  const totalCustomerPayable = subtotal + gstAmount;

  return {
    cityId: cityConfig.cityId,
    cityName: cityConfig.cityName,
    serviceType,
    baseRate,
    surgeMultiplier: effectiveMultiplier,
    surgeAddedAmount,
    finalChefPayout,
    platformFee,
    gstAmount,
    totalCustomerPayable,
    tier: cityConfig.tier,
    minChefPayoutGuaranteed: cityConfig.minChefPayout,
  };
}
