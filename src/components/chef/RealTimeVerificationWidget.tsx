import React, { useState } from 'react';
import { Chef, VerificationStatus } from '../../types';
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Clock,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Fingerprint,
  Building2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';
import {
  executeRealTimeVerificationCheck,
  RealTimeVerificationStepEvent,
  MockAadhaarResponse,
  MockFssaiResponse,
} from '../../utils/mockGovApi';
import { VerificationSimResult } from '../../utils/verificationEngine';
import { VerifiedBadge } from '../common/VerifiedBadge';
import { playAlertChime } from '../../utils/sound';

interface RealTimeVerificationWidgetProps {
  chef: Chef;
  onUpdateChefVerification: (chefId: string, result: VerificationSimResult) => void;
  className?: string;
  defaultExpanded?: boolean;
}

export const RealTimeVerificationWidget: React.FC<RealTimeVerificationWidgetProps> = ({
  chef,
  onUpdateChefVerification,
  className = '',
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isChecking, setIsChecking] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<'verified' | 'pending' | 'flagged' | 'unverified'>('verified');
  const [currentStep, setCurrentStep] = useState<RealTimeVerificationStepEvent | null>(null);
  const [aadhaarData, setAadhaarData] = useState<MockAadhaarResponse | null>(null);
  const [fssaiData, setFssaiData] = useState<MockFssaiResponse | null>(null);
  const [lastCheckDuration, setLastCheckDuration] = useState<number | null>(null);
  const [lastCheckTime, setLastCheckTime] = useState<string | null>(null);

  const currentStatus: VerificationStatus =
    chef.verificationReport?.status || (chef.policeVerified ? 'verified' : 'unverified');

  const handleRunLiveCheck = async (scenario = selectedScenario) => {
    if (isChecking) return;
    setIsChecking(true);
    setCurrentStep({
      step: 'aadhaar_query',
      title: 'Initiating Handshake...',
      description: 'Connecting to UIDAI & FSSAI FoSCoS Government API Gateway...',
      apiEndpoint: 'api.uidai.gov.in/v3/kyc/verify',
      status: 'loading',
    });

    try {
      const { result, aadhaarResponse, fssaiResponse, totalDurationMs } =
        await executeRealTimeVerificationCheck(chef, scenario, (event) => {
          setCurrentStep(event);
        });

      setAadhaarData(aadhaarResponse);
      setFssaiData(fssaiResponse);
      setLastCheckDuration(totalDurationMs);
      setLastCheckTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

      // Instantly update UI and propagate to parent App state
      onUpdateChefVerification(chef.id, result);

      if (scenario === 'verified') {
        playAlertChime('accepted');
      } else if (scenario === 'flagged') {
        playAlertChime('sos_panic');
      }
    } catch (err) {
      console.error('Real-time verification error:', err);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
        currentStatus === 'verified'
          ? 'bg-neutral-900/95 border-emerald-500/30 shadow-lg shadow-emerald-500/5'
          : currentStatus === 'flagged'
          ? 'bg-neutral-900/95 border-rose-500/40 shadow-lg shadow-rose-500/5'
          : currentStatus === 'pending'
          ? 'bg-neutral-900/95 border-amber-500/30 shadow-lg shadow-amber-500/5'
          : 'bg-neutral-900/90 border-neutral-800'
      } ${className}`}
    >
      {/* Top Banner / Summary Bar */}
      <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Left: Indicator & Status */}
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              currentStatus === 'verified'
                ? 'bg-emerald-500/20 text-emerald-400'
                : currentStatus === 'flagged'
                ? 'bg-rose-500/20 text-rose-400'
                : currentStatus === 'pending'
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-neutral-800 text-neutral-400'
            }`}
          >
            {isChecking ? (
              <RefreshCw size={17} className="animate-spin text-amber-400" />
            ) : currentStatus === 'verified' ? (
              <ShieldCheck size={19} />
            ) : currentStatus === 'flagged' ? (
              <ShieldAlert size={19} />
            ) : (
              <Clock size={19} />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-white tracking-tight">
                Real-Time Gov Verification Check
              </span>
              <VerifiedBadge
                size="sm"
                status={currentStatus}
                report={chef.verificationReport}
              />
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-[10px] font-mono font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                UIDAI / FSSAI API
              </span>
            </div>

            <div className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-2 flex-wrap">
              <span>
                {currentStatus === 'verified'
                  ? 'Aadhaar Biometric & FSSAI FoSCoS cleared 100%'
                  : currentStatus === 'flagged'
                  ? 'Discrepancy detected during FSSAI / CCTNS sync'
                  : currentStatus === 'pending'
                  ? 'Identity KYC sync pending background batch'
                  : 'Chef credentials awaiting first government check'}
              </span>
              {lastCheckTime && (
                <span className="text-neutral-500 font-mono">
                  • Checked at {lastCheckTime} ({lastCheckDuration}ms)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Action Trigger & Expand */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={() => handleRunLiveCheck(selectedScenario)}
            disabled={isChecking}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
              isChecking
                ? 'bg-neutral-800 text-neutral-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 shadow-amber-500/20 active:scale-95'
            }`}
          >
            <Zap size={13} className={isChecking ? 'animate-bounce' : 'text-neutral-950 fill-neutral-950'} />
            <span>{isChecking ? 'Querying APIs...' : 'Run Live Check'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors border border-neutral-700/60 cursor-pointer"
            title={isExpanded ? 'Collapse API Explorer' : 'Expand Live API Explorer'}
          >
            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>

      </div>

      {/* Expanded API Simulation & Live Audit Stream */}
      {isExpanded && (
        <div className="border-t border-neutral-800 bg-neutral-950/70 p-4 sm:p-5 space-y-4 animate-in fade-in duration-200">
          
          {/* Scenario Selector Chips */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                1. Select Mock API Response Scenario:
              </span>
              <span className="text-[10px] text-amber-400 font-mono">
                Updates 'Verified' badge instantly in UI
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setSelectedScenario('verified');
                  handleRunLiveCheck('verified');
                }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                  selectedScenario === 'verified' && currentStatus === 'verified'
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold">100% Cleared</div>
                  <div className="text-[10px] text-neutral-400">Verified Badge Active</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedScenario('pending');
                  handleRunLiveCheck('pending');
                }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                  selectedScenario === 'pending' || currentStatus === 'pending'
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                <Clock size={15} className="text-amber-400 shrink-0" />
                <div>
                  <div className="font-bold">Audit In Progress</div>
                  <div className="text-[10px] text-neutral-400">In Review Badge</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedScenario('flagged');
                  handleRunLiveCheck('flagged');
                }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                  selectedScenario === 'flagged' || currentStatus === 'flagged'
                    ? 'bg-rose-500/15 border-rose-500/50 text-rose-300'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                <AlertTriangle size={15} className="text-rose-400 shrink-0" />
                <div>
                  <div className="font-bold">Anomaly Flagged</div>
                  <div className="text-[10px] text-neutral-400">Audit Notice Badge</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedScenario('unverified');
                  handleRunLiveCheck('unverified');
                }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                  currentStatus === 'unverified'
                    ? 'bg-neutral-800 border-neutral-600 text-neutral-200'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <ShieldX size={15} className="text-neutral-400 shrink-0" />
                <div>
                  <div className="font-bold">Reset / Unverified</div>
                  <div className="text-[10px] text-neutral-400">Awaiting Submission</div>
                </div>
              </button>
            </div>
          </div>

          {/* Active Live Progress Event Stream */}
          {currentStep && (
            <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-200 flex items-center gap-2">
                  {currentStep.status === 'loading' ? (
                    <RefreshCw size={13} className="animate-spin text-amber-400" />
                  ) : currentStep.status === 'success' ? (
                    <CheckCircle2 size={13} className="text-emerald-400" />
                  ) : (
                    <AlertTriangle size={13} className="text-rose-400" />
                  )}
                  <span>{currentStep.title}</span>
                </span>
                <span className="font-mono text-[10px] text-neutral-400 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                  {currentStep.apiEndpoint}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed font-mono">
                {currentStep.description}
              </p>
            </div>
          )}

          {/* Real-Time Live API Response Payloads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            
            {/* Aadhaar Live Box */}
            <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-200">
                  <Fingerprint size={14} className="text-amber-400" />
                  <span>UIDAI Aadhaar KYC Gateway</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-800 font-mono text-emerald-400">
                  HTTP 200
                </span>
              </div>

              <div className="text-[11px] font-mono space-y-1 text-neutral-300 bg-neutral-950 p-2.5 rounded-lg border border-neutral-800/60">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Masked UID:</span>
                  <span>{aadhaarData?.aadhaarNumberMasked || 'XXXX-XXXX-4819'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Biometric Match:</span>
                  <span className={aadhaarData?.biometricMatched !== false ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {aadhaarData ? (aadhaarData.biometricMatched ? '99.4% Match' : 'Mismatch') : '99.4% Match'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Txn Ref:</span>
                  <span className="truncate max-w-[150px]">{aadhaarData?.txnId || 'UIDAI-TXN-2026-AUTH'}</span>
                </div>
              </div>
            </div>

            {/* FSSAI Live Box */}
            <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-200">
                  <Building2 size={14} className="text-emerald-400" />
                  <span>FSSAI FoSCoS License Registry</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-800 font-mono text-emerald-400">
                  FSSAI FoSCoS
                </span>
              </div>

              <div className="text-[11px] font-mono space-y-1 text-neutral-300 bg-neutral-950 p-2.5 rounded-lg border border-neutral-800/60">
                <div className="flex justify-between">
                  <span className="text-neutral-500">License No:</span>
                  <span>{fssaiData?.licenseNumber || '11226330018492'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">FoSCoS Category:</span>
                  <span className="truncate max-w-[150px]">{fssaiData?.category || 'Category 16 - Home Chef'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Hygiene Score:</span>
                  <span className="text-emerald-400 font-bold">
                    {fssaiData?.hygieneScore || 98}/100 (5-Star NABL)
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Quick Real-Time Feedback Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-neutral-800/60 text-[11px] text-neutral-400">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">✓ Real-Time UI Sync:</span>
              <span>Changes reflect instantly on your Chef profile, customer radar pins & dispatch cards.</span>
            </div>
            <button
              type="button"
              onClick={() => handleRunLiveCheck('verified')}
              className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
            >
              Re-Verify 100% Cleared
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
