import { config } from '../config.js';

/**
 * MoneyService: Deterministic integer-minor-unit (paise) financial calculations.
 * Avoids JavaScript IEEE 754 floating-point inaccuracies.
 * ₹1.00 = 100 paise.
 * ₹1120 = 112000 paise.
 */
export class MoneyService {
  /**
   * Safely converts INR rupees to integer paise.
   * e.g., 1120 -> 112000, 49.50 -> 4950
   */
  static toPaise(rupees: number): number {
    if (!Number.isFinite(rupees)) {
      throw new Error(`Invalid currency amount: ${rupees}`);
    }
    return Math.round(rupees * 100);
  }

  /**
   * Converts integer paise back to standard rupees formatted to 2 decimals.
   * e.g., 112000 -> 1120.00
   */
  static fromPaise(paise: number): number {
    if (!Number.isInteger(paise)) {
      paise = Math.round(paise);
    }
    return paise / 100;
  }

  /**
   * Deterministically calculates booking pricing entirely in integer paise.
   */
  static calculatePricing(
    baseRateRupees: number,
    surgeAmountRupees: number,
    platformFeeRupees: number = config.platformFee,
    gstRate: number = config.gstRate
  ): {
    subtotalPaise: number;
    subtotalRupees: number;
    surgePaise: number;
    surgeRupees: number;
    platformFeePaise: number;
    platformFeeRupees: number;
    taxableSubtotalPaise: number;
    taxableSubtotalRupees: number;
    gstPaise: number;
    gstRupees: number;
    totalPaise: number;
    totalRupees: number;
    chefEscrowPayoutPaise: number;
    chefEscrowPayoutRupees: number;
    adminEscrowRetentionPaise: number;
    adminEscrowRetentionRupees: number;
  } {
    const subtotalPaise = this.toPaise(baseRateRupees);
    const surgePaise = this.toPaise(surgeAmountRupees);
    const platformFeePaise = this.toPaise(platformFeeRupees);

    const taxableSubtotalPaise = subtotalPaise + surgePaise + platformFeePaise;
    // 18% GST on taxable services
    const gstPaise = Math.round(taxableSubtotalPaise * gstRate);
    const totalPaise = taxableSubtotalPaise + gstPaise;

    // Escrow Split: Chef gets 100% of base rate + 85% of surge
    const chefSurgeSharePaise = Math.round(surgePaise * 0.85);
    const chefEscrowPayoutPaise = subtotalPaise + chefSurgeSharePaise;
    const adminEscrowRetentionPaise = totalPaise - chefEscrowPayoutPaise;

    return {
      subtotalPaise,
      subtotalRupees: this.fromPaise(subtotalPaise),
      surgePaise,
      surgeRupees: this.fromPaise(surgePaise),
      platformFeePaise,
      platformFeeRupees: this.fromPaise(platformFeePaise),
      taxableSubtotalPaise,
      taxableSubtotalRupees: this.fromPaise(taxableSubtotalPaise),
      gstPaise,
      gstRupees: this.fromPaise(gstPaise),
      totalPaise,
      totalRupees: this.fromPaise(totalPaise),
      chefEscrowPayoutPaise,
      chefEscrowPayoutRupees: this.fromPaise(chefEscrowPayoutPaise),
      adminEscrowRetentionPaise,
      adminEscrowRetentionRupees: this.fromPaise(adminEscrowRetentionPaise),
    };
  }
}
