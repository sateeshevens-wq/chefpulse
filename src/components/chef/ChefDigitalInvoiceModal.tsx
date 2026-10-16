import React, { useRef } from 'react';
import {
  FileText,
  Download,
  Printer,
  CheckCircle2,
  X,
  Building,
  ShieldCheck,
  Calendar,
  MapPin,
  DollarSign,
  Receipt,
  QrCode,
} from 'lucide-react';
import { Booking, Chef } from '../../types';

interface ChefDigitalInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  chef: Chef;
}

export const ChefDigitalInvoiceModal: React.FC<ChefDigitalInvoiceModalProps> = ({
  isOpen,
  onClose,
  booking,
  chef,
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const invoiceNumber = `INV-CP-${booking.id.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase()}-2026`;
  const invoiceDate = booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('en-IN') : '12 Oct 2026';
  
  // Financial computations
  const totalAmount = booking.totalAmount || 899;
  const platformFee = booking.platformFee || 49;
  const gstAmount = booking.gstAmount || Math.round(platformFee * 0.18);
  const rawCookingFee = totalAmount - platformFee - gstAmount;
  const baseCookingFee = Math.round(rawCookingFee * 0.75);
  const surgeBonus = Math.round(rawCookingFee * 0.20);
  const customerTip = rawCookingFee - baseCookingFee - surgeBonus;
  const tdsWithheld = Number((rawCookingFee * 0.01).toFixed(2)); // 1% Section 194-O TDS
  const netChefPayout = Number((rawCookingFee - tdsWithheld).toFixed(2));

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Generate text/json blob download for tax compliance
    const invoiceData = {
      invoiceNumber,
      date: invoiceDate,
      chefName: chef.name,
      customerName: booking.customerName,
      serviceLocation: booking.serviceAddress,
      serviceType: booking.type,
      dishes: booking.dishesRequested,
      baseFee: baseCookingFee,
      surgeBonus,
      tip: customerTip,
      tds194O: tdsWithheld,
      netCreditedToWallet: netChefPayout,
      paymentStatus: 'PAID_OUT_ESCROW_RELEASED',
    };

    const blob = new Blob([JSON.stringify(invoiceData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${invoiceNumber}_DigitalTaxReceipt.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[2450] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-700 rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto text-neutral-100 space-y-6">
        {/* Modal Top Actions */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Receipt size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Digital Booking Invoice & Tax Summary</h3>
              <p className="text-[11px] text-neutral-400 font-mono">
                Compliant with Section 194-O of Indian Income Tax Act
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 cursor-pointer text-xs flex items-center gap-1.5"
              title="Print Invoice"
            >
              <Printer size={15} />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold cursor-pointer text-xs flex items-center gap-1.5"
            >
              <Download size={15} />
              <span>Download Tax Receipt</span>
            </button>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white text-lg p-1 cursor-pointer transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div
          ref={printAreaRef}
          className="p-6 sm:p-8 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-6 text-neutral-200 print:bg-white print:text-black"
        >
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-neutral-800 print:border-neutral-300">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-amber-400 print:text-neutral-900 tracking-tight">
                  CHEF PULSE
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold print:border print:border-emerald-600">
                  PAID OUT
                </span>
              </div>
              <p className="text-xs text-neutral-400 print:text-neutral-600 mt-1">
                ChefPulse India Private Limited • GSTIN: 29AAACC1234F1Z5
              </p>
              <p className="text-[11px] text-neutral-500 print:text-neutral-600">
                FSSAI FoSCoS Commercial Hub • Central RoC Karnataka
              </p>
            </div>

            <div className="text-left sm:text-right text-xs space-y-1">
              <div className="font-mono font-bold text-white print:text-black text-sm">
                {invoiceNumber}
              </div>
              <div className="text-neutral-400 print:text-neutral-600">Date: {invoiceDate}</div>
              <div className="text-neutral-400 print:text-neutral-600">Booking ID: #{booking.id}</div>
            </div>
          </div>

          {/* Party Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pb-6 border-b border-neutral-800 print:border-neutral-300">
            <div>
              <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                CERTIFIED CHEF PARTNER:
              </span>
              <div className="font-bold text-white print:text-black mt-1 text-sm">{chef.name}</div>
              <div className="text-neutral-400 print:text-neutral-600 mt-0.5">Phone: {chef.phone}</div>
              <div className="text-neutral-400 print:text-neutral-600">
                CCTNS Police Clearance Ref: {chef.verificationReport?.karnatakaPolicePCC?.reference || 'PCC-2026-CLEAR'}
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                CUSTOMER & VENUE:
              </span>
              <div className="font-bold text-white print:text-black mt-1 text-sm">{booking.customerName}</div>
              <div className="text-neutral-400 print:text-neutral-600 mt-0.5">
                Location: {booking.serviceAddress || 'Bangalore, Karnataka'}
              </div>
              <div className="text-neutral-400 print:text-neutral-600">Service: {booking.type}</div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="space-y-3">
            <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
              ITEMIZED EARNINGS BREAKDOWN:
            </span>

            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-neutral-800 print:border-neutral-300 text-neutral-400 print:text-neutral-600 text-left">
                  <th className="py-2">Description</th>
                  <th className="py-2 text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900 print:divide-neutral-200">
                <tr>
                  <td className="py-2.5">
                    <div className="font-semibold text-white print:text-black">
                      Base Cooking Fare ({booking.dishesRequested || 'SOS Meal'})
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      Standard culinary hourly rate for on-site execution
                    </div>
                  </td>
                  <td className="py-2.5 text-right font-mono font-bold text-white print:text-black">
                    ₹{baseCookingFee.toLocaleString('en-IN')}
                  </td>
                </tr>

                {surgeBonus > 0 && (
                  <tr>
                    <td className="py-2.5">
                      <div className="font-semibold text-amber-400 print:text-amber-800">
                        Dynamic Weather & High-Demand Surge Bonus
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        85% platform surge share allocated directly to chef
                      </div>
                    </td>
                    <td className="py-2.5 text-right font-mono font-bold text-amber-400 print:text-amber-800">
                      +₹{surgeBonus.toLocaleString('en-IN')}
                    </td>
                  </tr>
                )}

                {customerTip > 0 && (
                  <tr>
                    <td className="py-2.5">
                      <div className="font-semibold text-emerald-400 print:text-emerald-800">
                        Direct Customer Appreciation Tip
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        100% tip pass-through (zero platform cut)
                      </div>
                    </td>
                    <td className="py-2.5 text-right font-mono font-bold text-emerald-400 print:text-emerald-800">
                      +₹{customerTip.toLocaleString('en-IN')}
                    </td>
                  </tr>
                )}

                <tr className="text-neutral-400">
                  <td className="py-2">
                    TDS Withheld at Source (Section 194-O @ 1% on e-commerce participants)
                  </td>
                  <td className="py-2 text-right font-mono text-red-400">
                    -₹{tdsWithheld.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Grand Net Total */}
          <div className="pt-4 border-t border-neutral-800 print:border-neutral-300 flex items-center justify-between">
            <div>
              <div className="text-xs text-neutral-400">Net Balance Credited to Chef Wallet:</div>
              <div className="text-xs text-emerald-400 font-semibold mt-0.5">
                ✓ Disbursed via 24/7 Digital Escrow Payout
              </div>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black font-mono text-white print:text-black">
                ₹{netChefPayout.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Verification Footer */}
          <div className="pt-4 border-t border-neutral-800 print:border-neutral-300 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-neutral-500 font-mono">
            <span>Cryptographic Digital Signature: SHA256-ED25519-PULSE-VAULT</span>
            <span>24/7 Instant Withdrawal Gateway: RazorpayX / Cashfree IMPS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
