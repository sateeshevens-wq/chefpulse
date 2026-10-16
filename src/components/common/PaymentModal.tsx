import React, { useState } from 'react';
import { LockKeyhole, ShieldCheck, X } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingTitle: string;
  amount: number;
  surgeCondition?: string;
  onPaymentSuccess: () => Promise<boolean | void> | void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  bookingTitle,
  amount,
  onPaymentSuccess,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePay = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const result = await onPaymentSuccess();
      if (result === false) throw new Error('Payment was not completed. Your booking remains unpaid.');
      onClose();
    } catch (error: any) {
      setErrorMessage(error?.message || 'Payment could not be completed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-700 p-6 shadow-2xl text-neutral-100">
        <button
          type="button"
          onClick={onClose}
          disabled={isProcessing}
          aria-label="Close payment"
          className="absolute right-4 top-4 rounded-lg p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-40"
        >
          <X size={20} />
        </button>

        <div className="pr-8">
          <div className="flex items-center gap-2 text-emerald-400 mb-2">
            <ShieldCheck size={20} />
            <span className="text-xs font-bold uppercase tracking-wide">Secure payment</span>
          </div>
          <h2 className="text-xl font-bold text-white">Confirm your booking</h2>
          <p className="text-sm text-neutral-400 mt-1">{bookingTitle}</p>
        </div>

        <div className="mt-5 rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-400">Total</span>
            <span className="text-2xl font-black text-amber-400">₹{Math.round(amount)}</span>
          </div>
          <p className="mt-2 text-xs text-neutral-500">
            The final amount is calculated and verified by ChefPulse on the server before payment.
          </p>
        </div>

        <div className="mt-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-200 flex gap-2">
          <LockKeyhole size={16} className="shrink-0 mt-0.5" />
          <span>You will be taken to the secure payment gateway. ChefPulse never stores your card details.</span>
        </div>

        {errorMessage && (
          <div role="alert" className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {errorMessage}
          </div>
        )}

        <button
          type="button"
          onClick={handlePay}
          disabled={isProcessing}
          className="mt-5 w-full rounded-xl bg-amber-500 px-4 py-3.5 font-bold text-neutral-950 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Opening secure payment…' : `Pay ₹${Math.round(amount)}`}
        </button>

        <p className="mt-3 text-center text-[11px] text-neutral-500">
          You can close this window and pay later. Your booking will remain unpaid until payment succeeds.
        </p>
      </div>
    </div>
  );
};
