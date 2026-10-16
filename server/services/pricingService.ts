import { config } from '../config.js';

export interface CalculatedPricing {
  subtotal: number;
  surgeAmount: number;
  platformFee: number;
  gstAmount: number;
  totalAmount: number;
  chefEscrowPayout: number;
  adminEscrowRetention: number;
}

export type SurgeType = 'normal' | 'rain' | 'peak_dinner' | 'weekend_rush' | 'late_night';

export const SURGE_ADDITIONS: Record<SurgeType, number> = {
  normal: 0,
  rain: 250,
  peak_dinner: 150,
  weekend_rush: 200,
  late_night: 300,
};

import { MoneyService } from './moneyService.js';

export class PricingService {
  /**
   * Authoritatively calculates booking pricing on the server.
   * Completely ignores any client-supplied prices.
   * Uses MoneyService for integer paise arithmetic.
   */
  static calculateBookingPrice(
    chef: {
      sos_rate: number;
      day_prep_rate: number;
      shift_rate: number;
    },
    bookingType: 'sos_quick_fix' | 'scheduled_prep' | 'b2b_gig_shift',
    surgeCondition: SurgeType = 'normal'
  ): CalculatedPricing {
    let baseRate = 0;
    if (bookingType === 'sos_quick_fix') {
      baseRate = chef.sos_rate;
    } else if (bookingType === 'scheduled_prep') {
      baseRate = chef.day_prep_rate;
    } else if (bookingType === 'b2b_gig_shift') {
      baseRate = chef.shift_rate;
    } else {
      baseRate = chef.sos_rate;
    }

    const surgeAmount = SURGE_ADDITIONS[surgeCondition] ?? 0;
    const calc = MoneyService.calculatePricing(baseRate, surgeAmount, config.platformFee, config.gstRate);

    return {
      subtotal: calc.subtotalRupees,
      surgeAmount: calc.surgeRupees,
      platformFee: calc.platformFeeRupees,
      gstAmount: calc.gstRupees,
      totalAmount: calc.totalRupees,
      chefEscrowPayout: calc.chefEscrowPayoutRupees,
      adminEscrowRetention: calc.adminEscrowRetentionRupees,
    };
  }
}
