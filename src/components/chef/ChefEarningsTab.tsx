import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Chef, Booking } from '../../types';
import confetti from 'canvas-confetti';
import { ChefBankWithdrawalModal, WithdrawalTransaction } from './ChefBankWithdrawalModal';
import { ChefDigitalInvoiceModal } from './ChefDigitalInvoiceModal';
import { ViralReferralModal } from '../common/ViralReferralModal';
import { Building2, ArrowDownToLine, Zap, CheckCircle2, ShieldCheck, FileText, Gift, Sparkles } from 'lucide-react';

interface ChefEarningsTabProps {
  chef: Chef;
  activeBooking?: Booking | null;
}

interface DailyEarningsData {
  day: string;
  fullDate: string;
  completedJobs: number;
  totalPayout: number; // In INR ₹
  pendingBalance: number; // In INR ₹
}

export const ChefEarningsTab: React.FC<ChefEarningsTabProps> = ({ chef, activeBooking }) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const [chartView, setChartView] = useState<'combined' | 'trend'>('combined');
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState<boolean>(false);
  const [lastWithdrawalTx, setLastWithdrawalTx] = useState<WithdrawalTransaction | null>(null);
  const [withdrawnAmountTotal, setWithdrawnAmountTotal] = useState<number>(0);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState<boolean>(false);
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState<Booking | null>(null);

  // Weekly data (Bangalore market)
  const weeklyData: DailyEarningsData[] = [
    { day: 'Mon', fullDate: 'Oct 06', completedJobs: 2, totalPayout: 1850, pendingBalance: 400 },
    { day: 'Tue', fullDate: 'Oct 07', completedJobs: 3, totalPayout: 2700, pendingBalance: 0 },
    { day: 'Wed', fullDate: 'Oct 08', completedJobs: 2, totalPayout: 1950, pendingBalance: 650 },
    { day: 'Thu', fullDate: 'Oct 09', completedJobs: 4, totalPayout: 3800, pendingBalance: 0 },
    { day: 'Fri', fullDate: 'Oct 10', completedJobs: 5, totalPayout: 5400, pendingBalance: 1200 },
    { day: 'Sat', fullDate: 'Oct 11', completedJobs: 6, totalPayout: 6900, pendingBalance: 1500 },
    { day: 'Sun (Today)', fullDate: 'Oct 12', completedJobs: 4, totalPayout: 4650, pendingBalance: activeBooking ? (activeBooking.totalAmount - activeBooking.platformFee) : 850 },
  ];

  // Monthly breakdown
  const monthlyData: DailyEarningsData[] = [
    { day: 'Week 1', fullDate: 'Sep 15 - Sep 21', completedJobs: 18, totalPayout: 21500, pendingBalance: 0 },
    { day: 'Week 2', fullDate: 'Sep 22 - Sep 28', completedJobs: 22, totalPayout: 26800, pendingBalance: 0 },
    { day: 'Week 3', fullDate: 'Sep 29 - Oct 05', completedJobs: 25, totalPayout: 31200, pendingBalance: 1400 },
    { day: 'Week 4 (Current)', fullDate: 'Oct 06 - Oct 12', completedJobs: 26, totalPayout: 27250, pendingBalance: 4600 },
  ];

  const currentData = timeRange === 'week' ? weeklyData : monthlyData;

  // Totals calculation
  const totalCompletedJobs = currentData.reduce((acc, curr) => acc + curr.completedJobs, 0);
  const totalPayout = currentData.reduce((acc, curr) => acc + curr.totalPayout, 0);
  const basePendingBalance = currentData.reduce((acc, curr) => acc + curr.pendingBalance, 0);
  const totalPendingBalance = Math.max(0, basePendingBalance - withdrawnAmountTotal);
  const avgPayoutPerJob = Math.round(totalPayout / (totalCompletedJobs || 1));

  // Category breakdown
  const serviceTypeData = [
    { name: 'SOS Quick-Fix (Instant)', value: 14200, color: '#f59e0b' },
    { name: 'B2B Restaurant Shifts', value: 8900, color: '#3b82f6' },
    { name: 'Daily Meal Preps', value: 4150, color: '#10b981' },
  ];

  // Recent Completed Jobs & Transfers Log
  const [recentGigs, setRecentGigs] = useState([
    {
      id: 'gig-881',
      customer: 'Pooja Hegde',
      type: 'SOS Quick-Fix',
      location: 'Indiranagar 100ft Rd',
      time: 'Today, 1:45 PM',
      dishes: 'Dal Makhani & Butter Chicken',
      amount: 850,
      status: 'Paid Out',
      isBankTransfer: false,
    },
    {
      id: 'gig-880',
      customer: 'Toit Brewpub (GM Vikram)',
      type: 'B2B Shift (Friday Dinner)',
      location: 'Indiranagar',
      time: 'Yesterday, 11:15 PM',
      dishes: 'Tandoor clay oven station (5 hrs)',
      amount: 2750,
      status: 'Paid Out',
      isBankTransfer: false,
    },
    {
      id: 'gig-879',
      customer: 'Aarav Malhotra',
      type: 'SOS Quick-Fix',
      location: 'Koramangala 4th Block',
      time: 'Oct 10, 8:20 PM',
      dishes: 'Awadhi Kebab Platter & Parathas',
      amount: 950,
      status: 'Paid Out',
      isBankTransfer: false,
    },
    {
      id: 'gig-878',
      customer: 'Nandini & Rohit',
      type: 'Daily Meal Prep',
      location: 'HSR Layout Sector 3',
      time: 'Oct 09, 12:30 PM',
      dishes: '3-meal batch low carb weekly preps',
      amount: 1400,
      status: 'Paid Out',
      isBankTransfer: false,
    },
  ]);

  const handleWithdrawalSuccess = (tx: WithdrawalTransaction) => {
    setWithdrawnAmountTotal((prev) => prev + tx.amountWithdrawn);
    setLastWithdrawalTx(tx);

    // Prepend to transaction ledger
    setRecentGigs((prev) => [
      {
        id: tx.id,
        customer: `${tx.bankAccount.bankName} (${tx.bankAccount.accountNumberMasked})`,
        type: tx.transferMode === 'instant_imps' ? 'Instant IMPS Bank Transfer' : 'Standard NEFT Bank Transfer',
        location: `UTR: ${tx.utrNumber}`,
        time: tx.timestamp,
        dishes: `Net: ₹${tx.netCreditedAmount.toLocaleString('en-IN')} (Fee: ₹${tx.transferFee + tx.gstOnFee})`,
        amount: tx.amountWithdrawn,
        status: 'Credited to Bank',
        isBankTransfer: true,
      },
      ...prev,
    ]);
  };

  // Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-neutral-900/95 backdrop-blur-md border border-neutral-700 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 min-w-[180px]">
          <div className="font-bold text-white border-b border-neutral-800 pb-1 flex items-center justify-between">
            <span>{label}</span>
            <span className="text-[10px] text-neutral-400">Bangalore Hub</span>
          </div>
          {payload.map((entry: any, index: number) => {
            const isCount = entry.dataKey === 'completedJobs';
            return (
              <div key={`item-${index}`} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span>{entry.name}:</span>
                </span>
                <span className="font-black text-white">
                  {isCount ? `${entry.value} jobs` : `₹${entry.value.toLocaleString('en-IN')}`}
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner & Range Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Chef Earnings & Performance</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-xs font-bold border border-amber-500/30">
                Recharts Analytics
              </span>
            </h3>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Real-time tracking of completed jobs, total culinary payouts, and pending escrow balance for {chef.name}.
          </p>
        </div>

        {/* View Switchers */}
        <div className="flex items-center gap-2">
          {/* Time Range */}
          <div className="flex items-center bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-xs">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                timeRange === 'week'
                  ? 'bg-amber-500 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                timeRange === 'month'
                  ? 'bg-amber-500 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              This Month
            </button>
          </div>

          {/* Chart Type Toggle */}
          <div className="flex items-center bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-xs">
            <button
              onClick={() => setChartView('combined')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                chartView === 'combined'
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Bar + Line
            </button>
            <button
              onClick={() => setChartView('trend')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                chartView === 'trend'
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Area Trend
            </button>
          </div>
        </div>
      </div>

      {/* Earnings Transparency Breakdown: Base Cooking Fare, Surge Multipliers, Customer Tips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
              1. Base Cooking Fares (72%)
            </span>
            <div className="text-lg font-black text-white font-mono mt-0.5">
              ₹{Math.round(totalPayout * 0.72).toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-neutral-500">Standard culinary hourly rates</span>
          </div>
          <span className="text-xl">🍳</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-neutral-900 border border-amber-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
              2. Surge Multipliers (20%)
            </span>
            <div className="text-lg font-black text-amber-300 font-mono mt-0.5">
              ₹{Math.round(totalPayout * 0.20).toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-neutral-500">Weather & peak hour bonuses</span>
          </div>
          <span className="text-xl">⚡</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-neutral-900 border border-emerald-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
              3. Customer Tips (8%)
            </span>
            <div className="text-lg font-black text-emerald-300 font-mono mt-0.5">
              ₹{Math.round(totalPayout * 0.08).toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-neutral-500">100% direct pass-through</span>
          </div>
          <span className="text-xl">💝</span>
        </div>
      </div>

      {/* KPI Cards: Completed Jobs, Total Payout, Pending Balance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Total Payout */}
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs text-neutral-400 font-semibold mb-2">
            <span>Total Payout Received</span>
            <span className="text-amber-400 text-lg">💰</span>
          </div>
          <div className="text-3xl font-black text-amber-400">
            ₹{totalPayout.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold mt-2 flex items-center gap-1">
            <span>↑ 18.4%</span>
            <span className="text-neutral-400 font-normal">vs previous period</span>
          </div>
        </div>

        {/* KPI 2: Completed Jobs */}
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs text-neutral-400 font-semibold mb-2">
            <span>Completed Jobs</span>
            <span className="text-emerald-400 text-lg">🍳</span>
          </div>
          <div className="text-3xl font-black text-white">
            {totalCompletedJobs} <span className="text-sm font-normal text-neutral-400">gigs</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold mt-2 flex items-center gap-1">
            <span>100%</span>
            <span className="text-neutral-400 font-normal">completion & clean handover</span>
          </div>
        </div>

        {/* KPI 3: Pending Balance */}
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 relative overflow-hidden group hover:border-blue-500/50 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs text-neutral-400 font-semibold mb-2">
            <span>Pending Balance (Escrow)</span>
            <span className="text-blue-400 text-lg">⏳</span>
          </div>
          <div className="text-3xl font-black text-blue-400">
            ₹{totalPendingBalance.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-neutral-300 mt-2 flex items-center justify-between">
            <span className="text-neutral-400">Held in Razorpay Escrow</span>
            <span className="text-[10px] text-emerald-400 font-bold">24x7 IMPS Ready</span>
          </div>
        </div>

        {/* KPI 4: Avg Payout per Gig + Bank Withdrawal Trigger */}
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-neutral-400 font-semibold mb-2">
              <span>Avg Payout / Job</span>
              <span className="text-neutral-400 text-lg">⚡</span>
            </div>
            <div className="text-2xl font-black text-white">
              ₹{avgPayoutPerJob.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-neutral-800">
            <button
              type="button"
              disabled={totalPendingBalance === 0}
              onClick={() => setIsWithdrawModalOpen(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-black text-xs hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-40 flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Withdraw to Bank (₹{totalPendingBalance})</span>
            </button>
          </div>
        </div>

      </div>

      {/* Instant Bank Account Hub & Live Transfer Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900/95 to-neutral-900 border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black text-white">Registered Primary Bank Account</h4>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Penny-Drop Verified</span>
              </span>
            </div>
            <p className="text-xs text-neutral-300 mt-0.5">
              <strong>HDFC Bank</strong> • A/C No: <span className="font-mono text-white">•••• 4912</span> • IFSC: <span className="font-mono text-amber-300">HDFC0001234</span> (Indiranagar 100ft Rd)
            </p>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Available Escrow Balance: <strong className="text-emerald-400">₹{totalPendingBalance.toLocaleString('en-IN')}</strong> • Transfer options: Instant IMPS (60s) or Free NEFT
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={totalPendingBalance === 0}
          onClick={() => setIsWithdrawModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-40 cursor-pointer shrink-0"
        >
          <ArrowDownToLine className="w-4 h-4" />
          <span>Transfer to Registered Bank</span>
        </button>
      </div>

      {/* Success Notification if Withdrawal was just completed */}
      {lastWithdrawalTx && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-200">
                ₹{lastWithdrawalTx.netCreditedAmount.toLocaleString('en-IN')} Sent to {lastWithdrawalTx.bankAccount.bankName}!
              </div>
              <div className="text-[11px] text-emerald-300/80 font-mono">
                UTR: {lastWithdrawalTx.utrNumber} • {lastWithdrawalTx.timestamp}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setLastWithdrawalTx(null)}
            className="text-xs text-emerald-400 hover:text-white font-semibold cursor-pointer px-2 py-1 rounded bg-emerald-900/40"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Recharts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Primary Chart (Payout, Pending Balance, Completed Jobs) */}
        <div className="lg:col-span-8 rounded-3xl bg-neutral-900 border border-neutral-800 p-5 sm:p-6 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <span>Completed Jobs, Total Payout & Pending Balance</span>
              </h4>
              <p className="text-[11px] text-neutral-400">
                Multi-metric comparison: Bars represent Total Payout & Pending Balance (₹), Line indicates Completed Jobs count.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Total Payout
              </span>
              <span className="flex items-center gap-1.5 text-blue-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Pending Balance
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-2.5 h-0.5 bg-emerald-400"></span> Jobs
              </span>
            </div>
          </div>

          <div className="h-[340px] w-full pt-4">
            {chartView === 'combined' ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={currentData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                  <XAxis
                    dataKey="day"
                    stroke="#737373"
                    tick={{ fill: '#a3a3a3', fontSize: 11 }}
                    tickLine={false}
                  />
                  {/* Left Axis: INR Currency */}
                  <YAxis
                    yAxisId="left"
                    stroke="#737373"
                    tick={{ fill: '#a3a3a3', fontSize: 10 }}
                    tickFormatter={(val) => `₹${val}`}
                    tickLine={false}
                    axisLine={false}
                  />
                  {/* Right Axis: Jobs Count */}
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#10b981"
                    tick={{ fill: '#10b981', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 'dataMax + 2']}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ display: 'none' }} />

                  {/* Total Payout Bar */}
                  <Bar
                    yAxisId="left"
                    dataKey="totalPayout"
                    name="Total Payout"
                    fill="#f59e0b"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={36}
                  />

                  {/* Pending Balance Bar */}
                  <Bar
                    yAxisId="left"
                    dataKey="pendingBalance"
                    name="Pending Balance"
                    fill="#3b82f6"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={36}
                  />

                  {/* Completed Jobs Line */}
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="completedJobs"
                    name="Completed Jobs"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', r: 4, strokeWidth: 2, stroke: '#121417' }}
                    activeDot={{ r: 6 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="payoutGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="pendingGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                  <XAxis
                    dataKey="day"
                    stroke="#737373"
                    tick={{ fill: '#a3a3a3', fontSize: 11 }}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#737373"
                    tick={{ fill: '#a3a3a3', fontSize: 10 }}
                    tickFormatter={(val) => `₹${val}`}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="totalPayout"
                    name="Total Payout"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#payoutGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="pendingBalance"
                    name="Pending Balance"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#pendingGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right: Service Type Distribution & Quick Stats */}
        <div className="lg:col-span-4 rounded-3xl bg-neutral-900 border border-neutral-800 p-5 sm:p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
            <div>
              <h4 className="text-sm font-black text-white">Revenue by Service</h4>
              <p className="text-[11px] text-neutral-400">SOS Quick-Fix vs Shifts</p>
            </div>
            <span className="text-xs font-bold text-amber-400">100% Payout</span>
          </div>

          {/* Pie Chart */}
          <div className="h-[180px] w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {serviceTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#404040', borderRadius: '12px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-[10px] text-neutral-400 uppercase font-semibold">Net</span>
              <span className="text-xs font-black text-white">₹{(totalPayout / 1000).toFixed(1)}k</span>
            </div>
          </div>

          {/* Legend Details */}
          <div className="space-y-2 pt-1 text-xs">
            {serviceTypeData.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-2 rounded-xl bg-neutral-950/60 border border-neutral-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-neutral-300 text-[11px]">{item.name}</span>
                </div>
                <span className="font-bold text-white text-[11px]">₹{item.value.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Completed Jobs Ledger / Transaction History */}
      <div className="rounded-3xl bg-neutral-900 border border-neutral-800 p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-800">
          <div>
            <h4 className="text-sm font-black text-white">Recent Completed Gigs & Escrow Releases</h4>
            <p className="text-[11px] text-neutral-400">
              Transparent itemized record of finished shifts in Bangalore with UPI timestamps.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsReferralModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-xs hover:bg-amber-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Gift size={13} />
              <span>Refer a Chef (Earn ₹1,500)</span>
            </button>
            <span className="text-xs text-emerald-400 font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              ● 0 Dispute Rate
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="text-[11px] text-neutral-400 uppercase tracking-wider bg-neutral-950/60 border-y border-neutral-800">
              <tr>
                <th className="py-3 px-3">Job ID & Type</th>
                <th className="py-3 px-3">Customer / Venue</th>
                <th className="py-3 px-3">Dishes & Details</th>
                <th className="py-3 px-3">Date & Time</th>
                <th className="py-3 px-3 text-right">Net Payout</th>
                <th className="py-3 px-3 text-center">Escrow Status</th>
                <th className="py-3 px-3 text-center">Tax Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {recentGigs.map((gig) => (
                <tr key={gig.id} className={`transition-colors ${
                  gig.isBankTransfer ? 'bg-amber-500/5 hover:bg-amber-500/10' : 'hover:bg-neutral-800/40'
                }`}>
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      {gig.isBankTransfer && <span className="text-amber-400">🏦</span>}
                      <span>{gig.type}</span>
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono">#{gig.id}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-neutral-200">{gig.customer}</div>
                    <div className="text-[10px] text-neutral-400 font-mono">
                      {gig.isBankTransfer ? gig.location : `📍 ${gig.location}`}
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="text-neutral-300 truncate max-w-[200px]">{gig.dishes}</div>
                  </td>
                  <td className="py-3.5 px-3 text-[11px] text-neutral-400">
                    {gig.time}
                  </td>
                  <td className="py-3.5 px-3 text-right font-black">
                    <span className={gig.isBankTransfer ? 'text-emerald-400' : 'text-amber-400'}>
                      {gig.isBankTransfer ? `- ₹${gig.amount}` : `₹${gig.amount}`}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      gig.isBankTransfer
                        ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                        : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      ✓ {gig.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    {!gig.isBankTransfer && (
                      <button
                        type="button"
                        onClick={() => {
                          const mockBooking: Booking = {
                            id: gig.id,
                            type: gig.type.includes('B2B') ? 'b2b_gig_shift' : gig.type.includes('Prep') ? 'scheduled_prep' : 'sos_quick_fix',
                            customerId: 'cust-mock',
                            customerName: gig.customer,
                            customerPhone: '+91 98450 12345',
                            chefId: chef.id,
                            chefName: chef.name,
                            chefAvatar: chef.avatar,
                            serviceAddress: gig.location,
                            area: gig.location,
                            lat: 12.9716,
                            lng: 77.5946,
                            scheduledTime: gig.time,
                            cuisines: ['Regional Specialist'],
                            dishesRequested: gig.dishes,
                            totalAmount: gig.amount + 49 + Math.round((gig.amount + 49) * 0.18),
                            platformFee: 49,
                            gstAmount: Math.round(49 * 0.18),
                            status: 'completed',
                            otp: '8819',
                            paymentStatus: 'paid',
                            createdAt: new Date().toISOString(),
                          };
                          setSelectedInvoiceBooking(mockBooking);
                        }}
                        className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-[10px] border border-neutral-700 flex items-center gap-1 mx-auto cursor-pointer"
                      >
                        <FileText size={11} className="text-amber-400" />
                        <span>Tax Invoice</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chef Bank Account Withdrawal Modal */}
      <ChefBankWithdrawalModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        chefName={chef.name}
        availableBalance={totalPendingBalance}
        onWithdrawSuccess={handleWithdrawalSuccess}
      />

      {/* Digital Tax Invoice Modal */}
      {selectedInvoiceBooking && (
        <ChefDigitalInvoiceModal
          isOpen={!!selectedInvoiceBooking}
          onClose={() => setSelectedInvoiceBooking(null)}
          booking={selectedInvoiceBooking}
          chef={chef}
        />
      )}

      {/* Refer a Chef Bounty Modal */}
      <ViralReferralModal
        isOpen={isReferralModalOpen}
        onClose={() => setIsReferralModalOpen(false)}
        currentUser={null}
        activeRole="chef"
      />

    </div>
  );
};
