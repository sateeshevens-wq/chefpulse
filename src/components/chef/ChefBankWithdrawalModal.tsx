import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Zap,
  Clock,
  AlertCircle,
  Copy,
  Check,
  X,
  CreditCard,
  Lock,
  Plus,
} from 'lucide-react';

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumberMasked: string;
  ifscCode: string;
  branchName: string;
  accountHolderName: string;
  accountType: 'Savings' | 'Current';
  isPrimary: boolean;
  isVerified: boolean;
}

export interface WithdrawalTransaction {
  id: string;
  utrNumber: string;
  amountWithdrawn: number;
  transferMode: 'instant_imps' | 'standard_neft';
  transferFee: number;
  gstOnFee: number;
  netCreditedAmount: number;
  bankAccount: BankAccount;
  timestamp: string;
  status: 'COMPLETED' | 'PROCESSING';
}

interface ChefBankWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  chefName: string;
  availableBalance: number;
  onWithdrawSuccess: (transaction: WithdrawalTransaction) => void;
}

export const ChefBankWithdrawalModal: React.FC<ChefBankWithdrawalModalProps> = ({
  isOpen,
  onClose,
  chefName,
  availableBalance,
  onWithdrawSuccess,
}) => {
  // Registered Bank Accounts
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([
    {
      id: 'bank-1',
      bankName: 'HDFC Bank',
      accountNumberMasked: '•••• •••• •••• 4912',
      ifscCode: 'HDFC0001234',
      branchName: '100ft Road, Indiranagar, Bengaluru',
      accountHolderName: chefName || 'Chef Rajesh Sharma',
      accountType: 'Savings',
      isPrimary: true,
      isVerified: true,
    },
    {
      id: 'bank-2',
      bankName: 'ICICI Bank',
      accountNumberMasked: '•••• •••• •••• 8821',
      ifscCode: 'ICIC0000002',
      branchName: 'Koramangala 4th Block, Bengaluru',
      accountHolderName: chefName || 'Chef Rajesh Sharma',
      accountType: 'Current',
      isPrimary: false,
      isVerified: true,
    },
  ]);

  const [selectedBankId, setSelectedBankId] = useState<string>('bank-1');
  const [transferMode, setTransferMode] = useState<'instant_imps' | 'standard_neft'>('instant_imps');
  const [withdrawAmount, setWithdrawAmount] = useState<number>(availableBalance > 0 ? availableBalance : 1000);
  const [customAmountError, setCustomAmountError] = useState<string | null>(null);

  // Workflow steps: 'amount_and_mode' -> 'security_pin' -> 'processing' -> 'success_receipt'
  const [currentStep, setCurrentStep] = useState<'amount_and_mode' | 'security_pin' | 'processing' | 'success_receipt'>('amount_and_mode');
  
  // Security PIN state
  const [pinDigits, setPinDigits] = useState<string[]>(['', '', '', '']);
  const [pinError, setPinError] = useState<string | null>(null);

  // Completed transaction data
  const [completedTx, setCompletedTx] = useState<WithdrawalTransaction | null>(null);
  const [copiedUtr, setCopiedUtr] = useState<boolean>(false);

  // Add new account drawer state
  const [isAddingNewBank, setIsAddingNewBank] = useState<boolean>(false);
  const [newBankForm, setNewBankForm] = useState({
    bankName: 'State Bank of India',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: 'SBIN0004128',
    accountType: 'Savings' as 'Savings' | 'Current',
  });
  const [newBankVerifying, setNewBankVerifying] = useState<boolean>(false);
  const [newBankSuccess, setNewBankSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const selectedBank = bankAccounts.find((b) => b.id === selectedBankId) || bankAccounts[0];

  // Fee calculation
  // Instant IMPS: 1.5% fee (min ₹15, max ₹50) + 18% GST on fee
  const calculateFees = (amount: number, mode: 'instant_imps' | 'standard_neft') => {
    if (mode === 'standard_neft') {
      return {
        fee: 0,
        gst: 0,
        totalDeduction: 0,
        netCredit: amount,
      };
    }
    const rawFee = Math.max(15, Math.min(50, Math.round(amount * 0.015)));
    const gst = Math.round(rawFee * 0.18 * 100) / 100;
    const totalDeduction = rawFee + gst;
    const netCredit = Math.max(0, Math.round((amount - totalDeduction) * 100) / 100);
    return {
      fee: rawFee,
      gst,
      totalDeduction,
      netCredit,
    };
  };

  const feeBreakdown = calculateFees(withdrawAmount, transferMode);

  const handleAmountChange = (val: number) => {
    setWithdrawAmount(val);
    if (val < 100) {
      setCustomAmountError('Minimum withdrawal is ₹100');
    } else if (val > availableBalance) {
      setCustomAmountError(`Amount exceeds available pending balance of ₹${availableBalance.toLocaleString('en-IN')}`);
    } else {
      setCustomAmountError(null);
    }
  };

  const handlePresetSelect = (percentage: number) => {
    const val = Math.max(100, Math.round((availableBalance * percentage) / 100));
    handleAmountChange(val);
  };

  const handleProceedToPin = () => {
    if (withdrawAmount < 100) {
      setCustomAmountError('Minimum withdrawal is ₹100');
      return;
    }
    if (withdrawAmount > availableBalance) {
      setCustomAmountError(`Cannot withdraw more than available balance (₹${availableBalance})`);
      return;
    }
    setCurrentStep('security_pin');
  };

  const handlePinInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...pinDigits];
    newDigits[index] = value.slice(-1);
    setPinDigits(newDigits);
    setPinError(null);

    // Auto focus next
    if (value && index < 3) {
      const nextInput = document.getElementById(`pin-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleAutoFillDemoPin = () => {
    setPinDigits(['4', '8', '2', '9']);
    setPinError(null);
  };

  const handleConfirmWithdrawal = () => {
    const pin = pinDigits.join('');
    if (pin.length < 4) {
      setPinError('Please enter your 4-digit security PIN');
      return;
    }

    // Trigger processing state
    setCurrentStep('processing');

    setTimeout(() => {
      const now = new Date();
      const utrNumber = `UTR-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      
      const tx: WithdrawalTransaction = {
        id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        utrNumber,
        amountWithdrawn: withdrawAmount,
        transferMode,
        transferFee: feeBreakdown.fee,
        gstOnFee: feeBreakdown.gst,
        netCreditedAmount: feeBreakdown.netCredit,
        bankAccount: selectedBank,
        timestamp: `${now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}, ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`,
        status: 'COMPLETED',
      };

      setCompletedTx(tx);
      setCurrentStep('success_receipt');

      // Trigger Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }

      // Notify parent
      onWithdrawSuccess(tx);
    }, 2200);
  };

  const handleCopyUtr = (utr: string) => {
    navigator.clipboard?.writeText(utr);
    setCopiedUtr(true);
    setTimeout(() => setCopiedUtr(false), 2000);
  };

  const handleAddNewBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBankForm.accountNumber || newBankForm.accountNumber !== newBankForm.confirmAccountNumber) {
      alert('Account numbers do not match or are empty');
      return;
    }

    setNewBankVerifying(true);
    setTimeout(() => {
      const newAcc: BankAccount = {
        id: `bank-${Date.now()}`,
        bankName: newBankForm.bankName,
        accountNumberMasked: `•••• •••• •••• ${newBankForm.accountNumber.slice(-4)}`,
        ifscCode: newBankForm.ifscCode,
        branchName: 'MG Road Central, Bengaluru',
        accountHolderName: chefName || 'Chef Rajesh Sharma',
        accountType: newBankForm.accountType,
        isPrimary: false,
        isVerified: true,
      };

      setBankAccounts((prev) => [...prev, newAcc]);
      setSelectedBankId(newAcc.id);
      setNewBankVerifying(false);
      setNewBankSuccess(true);
      setTimeout(() => {
        setNewBankSuccess(false);
        setIsAddingNewBank(false);
      }, 1200);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[2500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl text-neutral-100 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header Bar */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>Bank Account Withdrawal</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  NPCI IMPS Verified
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                Transfer your pending escrow balance directly to your registered bank account.
              </p>
            </div>
          </div>

          {currentStep !== 'processing' && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* STEP 1: Amount, Bank Selection & Transfer Speed Breakdown */}
          {currentStep === 'amount_and_mode' && (
            <div className="space-y-6">
              
              {/* Available Escrow Balance Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-neutral-900 to-amber-950/30 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90">
                    Available Pending Balance
                  </div>
                  <div className="text-2xl font-black text-white mt-0.5">
                    ₹{availableBalance.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Cleared from completed culinary shifts</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40">
                    24x7 Instant Payout Ready
                  </span>
                </div>
              </div>

              {/* 1. Select Registered Bank Account */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>1. Destination Bank Account</span>
                  </label>
                  {!isAddingNewBank && (
                    <button
                      type="button"
                      onClick={() => setIsAddingNewBank(true)}
                      className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Another Account</span>
                    </button>
                  )}
                </div>

                {isAddingNewBank ? (
                  /* Form to Add New Bank Account with simulated penny drop validation */
                  <form onSubmit={handleAddNewBankSubmit} className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-xs">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                        <span>Link New Bank Account (Penny-Drop Test)</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsAddingNewBank(false)}
                        className="text-neutral-400 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[10px] text-neutral-400 uppercase font-semibold">Bank Name</label>
                        <select
                          value={newBankForm.bankName}
                          onChange={(e) => setNewBankForm({ ...newBankForm, bankName: e.target.value })}
                          className="w-full mt-1 px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs"
                        >
                          <option value="State Bank of India">State Bank of India</option>
                          <option value="Axis Bank">Axis Bank</option>
                          <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                          <option value="Canara Bank">Canara Bank</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-neutral-400 uppercase font-semibold">IFSC Code</label>
                        <input
                          type="text"
                          value={newBankForm.ifscCode}
                          onChange={(e) => setNewBankForm({ ...newBankForm, ifscCode: e.target.value.toUpperCase() })}
                          className="w-full mt-1 px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs font-mono"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[10px] text-neutral-400 uppercase font-semibold">Account Number</label>
                        <input
                          type="password"
                          value={newBankForm.accountNumber}
                          onChange={(e) => setNewBankForm({ ...newBankForm, accountNumber: e.target.value })}
                          placeholder="e.g. 5010049182319"
                          className="w-full mt-1 px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-neutral-400 uppercase font-semibold">Confirm Account Number</label>
                        <input
                          type="text"
                          value={newBankForm.confirmAccountNumber}
                          onChange={(e) => setNewBankForm({ ...newBankForm, confirmAccountNumber: e.target.value })}
                          placeholder="Re-enter account number"
                          className="w-full mt-1 px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs"
                          required
                        />
                      </div>
                    </div>

                    <div className="pt-1 flex items-center justify-between">
                      <div className="text-[10px] text-neutral-400 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Simulated ₹1 Penny-Drop credit will verify name</span>
                      </div>

                      <button
                        type="submit"
                        disabled={newBankVerifying}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {newBankVerifying ? (
                          <>
                            <div className="w-3 h-3 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                            <span>Verifying with NPCI...</span>
                          </>
                        ) : newBankSuccess ? (
                          <span>✓ Verified & Linked!</span>
                        ) : (
                          <span>Verify & Add Account</span>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Bank Accounts List */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {bankAccounts.map((account) => {
                      const isSelected = account.id === selectedBankId;
                      return (
                        <div
                          key={account.id}
                          onClick={() => setSelectedBankId(account.id)}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30'
                              : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">🏦</span>
                              <div>
                                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                  <span>{account.bankName}</span>
                                  {account.isPrimary && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400">
                                      Primary
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                                  {account.accountNumberMasked}
                                </div>
                              </div>
                            </div>

                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-amber-500 bg-amber-500 text-neutral-950' : 'border-neutral-700'
                            }`}>
                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                          </div>

                          <div className="mt-3 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px] text-neutral-400">
                            <span>IFSC: {account.ifscCode}</span>
                            <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                              ✓ Verified
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 2. Amount Input & Quick Percentage Buttons */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                    2. Withdrawal Amount (INR)
                  </label>
                  <span className="text-[11px] text-neutral-400">
                    Min: ₹100 • Max: ₹{availableBalance.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-amber-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    min={100}
                    max={availableBalance}
                    value={withdrawAmount}
                    onChange={(e) => handleAmountChange(Number(e.target.value))}
                    className="w-full pl-9 pr-4 py-3 bg-neutral-950 border border-neutral-700 rounded-2xl text-xl font-black text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {customAmountError && (
                  <div className="text-xs text-red-400 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{customAmountError}</span>
                  </div>
                )}

                {/* Percentage Quick Buttons */}
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {[
                    { label: '25%', pct: 25 },
                    { label: '50%', pct: 50 },
                    { label: '75%', pct: 75 },
                    { label: '100% (Full)', pct: 100 },
                  ].map((preset) => {
                    const presetVal = Math.round((availableBalance * preset.pct) / 100);
                    const isActive = withdrawAmount === presetVal;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handlePresetSelect(preset.pct)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border ${
                          isActive
                            ? 'bg-amber-500 text-neutral-950 border-amber-500 shadow-sm'
                            : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Transfer Speed & Fee Comparison */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center justify-between">
                  <span>3. Transfer Speed & Method</span>
                  <span className="text-[11px] text-amber-400 lowercase font-normal">
                    transparent instant fee breakdown
                  </span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Mode 1: Instant IMPS */}
                  <div
                    onClick={() => setTransferMode('instant_imps')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all relative ${
                      transferMode === 'instant_imps'
                        ? 'bg-gradient-to-b from-amber-500/10 to-neutral-950 border-amber-500 ring-1 ring-amber-500/30'
                        : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-xs font-black text-amber-400">
                        <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span>Instant Transfer (IMPS)</span>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                        RECOMMENDED
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-300">
                      Dispatched instantly via NPCI IMPS. Funds reflect in your bank account in <strong>under 60 seconds</strong>.
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                      <span className="text-neutral-400">Instant Platform Fee:</span>
                      <span className="font-bold text-amber-300">
                        1.5% (₹{feeBreakdown.fee} + ₹{feeBreakdown.gst} GST)
                      </span>
                    </div>
                  </div>

                  {/* Mode 2: Standard NEFT */}
                  <div
                    onClick={() => setTransferMode('standard_neft')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all relative ${
                      transferMode === 'standard_neft'
                        ? 'bg-gradient-to-b from-emerald-500/10 to-neutral-950 border-emerald-500 ring-1 ring-emerald-500/30'
                        : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-xs font-black text-emerald-400">
                        <Clock className="w-4 h-4" />
                        <span>Standard Transfer (NEFT)</span>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                        100% FREE
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-300">
                      Scheduled banking batch transfer. Arrives in <strong>2 to 4 business hours</strong> during RBI windows.
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                      <span className="text-neutral-400">Transfer Fee:</span>
                      <span className="font-bold text-emerald-400">₹0.00 (Zero Fee)</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Instant Transfer Fee Breakdown Box */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-800/80 pb-1.5 flex items-center justify-between">
                  <span>Transfer Fee Breakdown Summary</span>
                  <span className="text-[10px] text-neutral-500">RBI & RazorpayX Guidelines</span>
                </div>

                <div className="flex items-center justify-between text-neutral-300">
                  <span>Requested Withdrawal Amount:</span>
                  <span className="font-bold text-white">₹{withdrawAmount.toLocaleString('en-IN')}</span>
                </div>

                {transferMode === 'instant_imps' ? (
                  <>
                    <div className="flex items-center justify-between text-neutral-400">
                      <span>Instant IMPS Processing Fee (1.5%):</span>
                      <span className="text-amber-400 font-medium">- ₹{feeBreakdown.fee}</span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-400">
                      <span>GST on Instant Fee (18%):</span>
                      <span className="text-amber-400 font-medium">- ₹{feeBreakdown.gst}</span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-400 font-semibold pt-1 border-t border-neutral-900">
                      <span>Total Platform Deduction:</span>
                      <span className="text-red-400 font-bold">- ₹{feeBreakdown.totalDeduction}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between text-emerald-400">
                    <span>Platform NEFT Fee:</span>
                    <span className="font-bold">₹0.00 (Waived)</span>
                  </div>
                )}

                <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-sm">
                  <span className="font-bold text-white">Net Credited to Bank Account:</span>
                  <span className="font-black text-emerald-400 text-base">
                    ₹{feeBreakdown.netCredit.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="text-[10px] text-neutral-500 pt-1">
                  Destination: {selectedBank.bankName} ({selectedBank.accountNumberMasked}) • Holder: {selectedBank.accountHolderName}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                disabled={Boolean(customAmountError) || withdrawAmount < 100 || availableBalance === 0}
                onClick={handleProceedToPin}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-black text-sm hover:from-amber-400 hover:to-amber-500 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 disabled:opacity-40"
              >
                <span>Proceed to Transfer ₹{feeBreakdown.netCredit.toLocaleString('en-IN')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          )}

          {/* STEP 2: 4-digit Transaction Security PIN */}
          {currentStep === 'security_pin' && (
            <div className="space-y-6 text-center py-4">
              <div className="w-14 h-14 rounded-3xl bg-amber-500/15 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
                <Lock className="w-7 h-7" />
              </div>

              <div>
                <h4 className="text-lg font-black text-white">Enter Transaction Security PIN</h4>
                <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                  Authorizing payout of <strong>₹{feeBreakdown.netCredit.toLocaleString('en-IN')}</strong> to {selectedBank.bankName} ({selectedBank.accountNumberMasked}).
                </p>
              </div>

              {/* 4 Pin Inputs */}
              <div className="flex justify-center gap-3">
                {pinDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`pin-input-${idx}`}
                    type="password"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinInput(idx, e.target.value)}
                    className="w-14 h-14 rounded-2xl bg-neutral-950 border border-neutral-700 text-center text-2xl font-black text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  />
                ))}
              </div>

              {pinError && (
                <div className="text-xs text-red-400 font-semibold">{pinError}</div>
              )}

              {/* Demo Helper auto-fill */}
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 max-w-sm mx-auto flex items-center justify-between text-xs">
                <span className="text-neutral-400">Demo Security PIN: <strong>4829</strong></span>
                <button
                  type="button"
                  onClick={handleAutoFillDemoPin}
                  className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-bold text-[11px] cursor-pointer"
                >
                  Auto-Fill
                </button>
              </div>

              <div className="flex items-center gap-3 max-w-sm mx-auto">
                <button
                  type="button"
                  onClick={() => setCurrentStep('amount_and_mode')}
                  className="flex-1 py-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirmWithdrawal}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-black text-xs hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Confirm & Transfer
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Transfer Animation & Core Banking Connectivity */}
          {currentStep === 'processing' && (
            <div className="py-12 text-center space-y-6">
              <div className="relative w-20 h-20 mx-auto">
                <div className="w-20 h-20 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-2xl">
                  ⚡
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-lg font-black text-white">Communicating with Core Banking Switch</h4>
                <div className="text-xs text-neutral-400 space-y-1 font-mono">
                  <p className="text-amber-400 animate-pulse">● Connecting to RazorpayX Escrow Vault...</p>
                  <p className="text-neutral-400">● Validating IFSC {selectedBank.ifscCode} with RBI NEFT/IMPS network...</p>
                  <p className="text-neutral-500">● Depositing funds to {selectedBank.bankName} A/C ending in {selectedBank.accountNumberMasked.slice(-4)}...</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Transfer Success Receipt & UTR Number */}
          {currentStep === 'success_receipt' && completedTx && (
            <div className="space-y-6 animate-in zoom-in-95 duration-200">
              
              {/* Success Badge */}
              <div className="text-center space-y-2 pt-2">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-black text-white">Transfer Initiated Successfully!</h4>
                <p className="text-xs text-neutral-400">
                  Funds have been debited from your Chef Pulse Escrow Wallet and sent to your bank.
                </p>
              </div>

              {/* Official Receipt Card */}
              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
                
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                      Net Amount Dispatched
                    </span>
                    <div className="text-2xl font-black text-emerald-400 mt-0.5">
                      ₹{completedTx.netCreditedAmount.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 font-bold text-xs border border-emerald-500/30">
                    STATUS: {completedTx.status}
                  </span>
                </div>

                {/* UTR Copy Box */}
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-neutral-400 uppercase font-semibold">
                      Bank Reference / UTR Number
                    </div>
                    <div className="text-xs font-mono font-bold text-white mt-0.5">
                      {completedTx.utrNumber}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyUtr(completedTx.utrNumber)}
                    className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                    title="Copy UTR Number"
                  >
                    {copiedUtr ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Itemized Receipt Details */}
                <div className="space-y-2 text-xs divide-y divide-neutral-900">
                  <div className="flex justify-between text-neutral-400 pt-1">
                    <span>Beneficiary Bank:</span>
                    <span className="text-white font-medium">{completedTx.bankAccount.bankName}</span>
                  </div>
                  <div className="flex justify-between text-neutral-400 pt-1">
                    <span>Account Number:</span>
                    <span className="text-white font-mono">{completedTx.bankAccount.accountNumberMasked}</span>
                  </div>
                  <div className="flex justify-between text-neutral-400 pt-1">
                    <span>IFSC Code:</span>
                    <span className="text-white font-mono">{completedTx.bankAccount.ifscCode}</span>
                  </div>
                  <div className="flex justify-between text-neutral-400 pt-1">
                    <span>Transfer Mode:</span>
                    <span className="text-amber-400 font-bold">
                      {completedTx.transferMode === 'instant_imps' ? 'Instant IMPS (Real-time)' : 'Standard NEFT (Batch)'}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-400 pt-1">
                    <span>Total Fee & GST:</span>
                    <span className="text-neutral-300">
                      ₹{completedTx.transferFee + completedTx.gstOnFee}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-400 pt-1">
                    <span>Timestamp:</span>
                    <span className="text-neutral-300">{completedTx.timestamp}</span>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    alert(`Receipt downloaded for ${completedTx.utrNumber}`);
                  }}
                  className="flex-1 py-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>📄 Download PDF Slip</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs cursor-pointer"
                >
                  Done
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
