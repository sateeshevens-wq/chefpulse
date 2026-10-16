import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Building2,
  FileText,
  BadgeCheck,
  Fingerprint,
  Sparkles,
  Clock,
} from 'lucide-react';
import { Chef, VerificationStatus } from '../../types';
import {
  verifyChefGovernmentBackground,
  GOVERNMENT_REGISTRIES,
  VerificationSimResult,
} from '../../utils/verificationEngine';
import { VerifiedBadge } from '../common/VerifiedBadge';

interface VerificationSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  chefs: Chef[];
  onUpdateChefVerification: (chefId: string, result: VerificationSimResult) => void;
  initialSelectedChefId?: string;
}

export const VerificationSimulatorModal: React.FC<VerificationSimulatorModalProps> = ({
  isOpen,
  onClose,
  chefs,
  onUpdateChefVerification,
  initialSelectedChefId,
}) => {
  const [selectedChefId, setSelectedChefId] = useState<string>(
    initialSelectedChefId || chefs[0]?.id || ''
  );
  const [targetOutcome, setTargetOutcome] = useState<'pass' | 'fail_criminal_flag' | 'require_manual_review'>('pass');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [currentStepLabel, setCurrentStepLabel] = useState<string>('');
  const [currentStepDetail, setCurrentStepDetail] = useState<string>('');
  const [simResult, setSimResult] = useState<VerificationSimResult | null>(null);
  const [activeTab, setActiveTab] = useState<'simulation' | 'registry_info' | 'dossier'>('simulation');

  if (!isOpen) return null;

  const currentChef = chefs.find((c) => c.id === selectedChefId) || chefs[0];
  const currentStatus: VerificationStatus = currentChef?.verificationReport?.status || (currentChef?.policeVerified ? 'verified' : 'unverified');

  const handleStartSimulation = async () => {
    if (!currentChef || isSimulating) return;

    setIsSimulating(true);
    setSimResult(null);
    setCurrentStepIndex(0);

    try {
      const result = await verifyChefGovernmentBackground(
        currentChef,
        targetOutcome,
        (stepIdx, label, detail) => {
          setCurrentStepIndex(stepIdx);
          setCurrentStepLabel(label);
          setCurrentStepDetail(detail);
        }
      );

      setSimResult(result);
      onUpdateChefVerification(currentChef.id, result);
    } catch (err) {
      console.error('Verification simulation failed:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleQuickResetAll = (status: VerificationStatus) => {
    if (!currentChef) return;
    const isPass = status === 'verified';
    const mockReport = currentChef.verificationReport
      ? { ...currentChef.verificationReport, status, overallScore: isPass ? 98 : status === 'pending' ? 65 : 42 }
      : undefined;

    const dummyResult: VerificationSimResult = {
      chefId: currentChef.id,
      chefName: currentChef.name,
      status,
      passed: isPass,
      score: isPass ? 98 : 45,
      report: mockReport || {
        status,
        overallScore: isPass ? 98 : 45,
        verifiedDate: isPass ? '2026-09-15' : 'Pending',
        dossierNumber: `KSP-BLR-${currentChef.id.toUpperCase()}-MANUAL`,
        karnatakaPolicePCC: {
          reference: 'PCC-MANUAL-RESET',
          status: isPass ? 'passed' : 'flagged',
          crimeRecordClear: isPass,
          jurisdiction: 'Bengaluru Police',
          verifiedAt: new Date().toISOString(),
        },
        aadhaarPANVerification: {
          maskedAadhaar: 'XXXX-XXXX-4819',
          maskedPAN: 'ABCDE****K',
          status: isPass ? 'passed' : 'pending',
          nameMatchPercentage: isPass ? 99.4 : 60,
          dobVerified: true,
        },
        fssaiCertification: {
          licenseNumber: '112263300099',
          category: 'Commercial Caterer',
          validThrough: '2028-12-31',
          status: isPass ? 'passed' : 'expired',
        },
        kitchenHygieneAudit: {
          score: isPass ? 98 : 60,
          auditor: 'Dr. Ramesh Rao',
          swabCultureTest: 'negative',
          status: isPass ? 'passed' : 'review_required',
        },
        checks: [],
        lastAuditedTimestamp: new Date().toISOString(),
      },
      auditTrail: [
        {
          step: 'Manual Operator Override',
          authority: 'ChefPulse Safety Compliance Desk',
          timestamp: new Date().toLocaleTimeString(),
          status: isPass ? 'ok' : 'flagged',
          message: `Administrative verification state set to ${status.toUpperCase()}.`,
        },
      ],
    };

    onUpdateChefVerification(currentChef.id, dummyResult);
    setSimResult(dummyResult);
  };

  return (
    <div className="fixed inset-0 z-[2200] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl text-neutral-100 max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white tracking-tight">
                  Government Background Verification Simulator
                </h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Gov API Gateway
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Simulates real-time multi-bureau lookups against Karnataka Police (CCTNS), UIDAI Aadhaar, and FSSAI FoSCoS registries.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-white text-xl p-1.5 rounded-xl hover:bg-neutral-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 pt-3 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('simulation')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'simulation'
                ? 'bg-amber-500 text-neutral-950 font-black shadow-md'
                : 'text-neutral-400 hover:text-white bg-neutral-950/60'
            }`}
          >
            <Play size={13} />
            <span>Interactive Verification Test</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('registry_info')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'registry_info'
                ? 'bg-amber-500 text-neutral-950 font-black shadow-md'
                : 'text-neutral-400 hover:text-white bg-neutral-950/60'
            }`}
          >
            <Building2 size={13} />
            <span>Connected Registries (4)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dossier')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'dossier'
                ? 'bg-amber-500 text-neutral-950 font-black shadow-md'
                : 'text-neutral-400 hover:text-white bg-neutral-950/60'
            }`}
          >
            <FileText size={13} />
            <span>Official Gov Dossier</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">

          {activeTab === 'simulation' && (
            <div className="space-y-4">
              {/* Chef Selection & Current Live Status Card */}
              <div className="p-4 rounded-2xl bg-neutral-950/90 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={currentChef?.avatar}
                    alt={currentChef?.name}
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-neutral-700"
                  />
                  <div>
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                      Target Chef in System:
                    </label>
                    <select
                      value={selectedChefId}
                      onChange={(e) => {
                        setSelectedChefId(e.target.value);
                        setSimResult(null);
                      }}
                      disabled={isSimulating}
                      className="bg-neutral-900 border border-neutral-700 text-white font-bold text-xs rounded-lg px-2.5 py-1 mt-1 focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      {chefs.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.specialties[0]})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Dynamic Live Badge Preview in Real Time */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-800">
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold">
                    Current UI Badge State:
                  </span>
                  <div className="mt-1 flex items-center gap-2">
                    <VerifiedBadge
                      size="md"
                      status={currentStatus}
                      report={currentChef?.verificationReport}
                    />
                    <span className="text-[11px] text-neutral-400 font-mono">
                      ({currentStatus.toUpperCase()})
                    </span>
                  </div>
                </div>
              </div>

              {/* Scenario Control Form */}
              <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-200">
                    Select Government Bureau Verification Scenario:
                  </span>
                  <span className="text-[11px] text-amber-400 font-medium">
                    Simulates actual API responses
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setTargetOutcome('pass')}
                    disabled={isSimulating}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      targetOutcome === 'pass'
                        ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                      <CheckCircle2 size={14} />
                      <span>100% Cleared (Pass)</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      No crime record, biometric UIDAI matched, valid FSSAI & NABL hygiene swab.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetOutcome('fail_criminal_flag')}
                    disabled={isSimulating}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      targetOutcome === 'fail_criminal_flag'
                        ? 'bg-rose-500/15 border-rose-500 text-white shadow-md shadow-rose-500/10'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                      <AlertTriangle size={14} />
                      <span>CCTNS Police Flag</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      Simulates jurisdictional FIR flag / mismatch. Badge dynamically changes to 'Audit Flagged'.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetOutcome('require_manual_review')}
                    disabled={isSimulating}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      targetOutcome === 'require_manual_review'
                        ? 'bg-amber-500/15 border-amber-500 text-white shadow-md shadow-amber-500/10'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                      <Clock size={14} />
                      <span>FSSAI Renewal Pending</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      FSSAI license renewal due. Sets status to 'In Review' with audit notice.
                    </p>
                  </button>
                </div>

                {/* Action Trigger Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleStartSimulation}
                    disabled={isSimulating}
                    className={`w-full sm:flex-1 py-3 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all ${
                      isSimulating
                        ? 'bg-neutral-800 text-neutral-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 text-neutral-950 hover:brightness-110 shadow-lg shadow-emerald-500/20'
                    }`}
                  >
                    {isSimulating ? (
                      <>
                        <Loader2 size={16} className="animate-spin text-amber-400" />
                        <span>Querying Government Central Gateways...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        <span>Run Full Automated Gov Verification Engine</span>
                      </>
                    )}
                  </button>

                  {/* Fast Quick-State Overrides for Testing */}
                  <div className="flex items-center gap-1.5 w-full sm:w-auto">
                    <button
                      type="button"
                      title="Instantly set Verified"
                      onClick={() => handleQuickResetAll('verified')}
                      disabled={isSimulating}
                      className="px-2.5 py-2 text-[11px] font-bold rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition-all flex items-center gap-1"
                    >
                      <CheckCircle2 size={12} />
                      <span>Set Cleared</span>
                    </button>
                    <button
                      type="button"
                      title="Instantly set Audit Flagged"
                      onClick={() => handleQuickResetAll('flagged')}
                      disabled={isSimulating}
                      className="px-2.5 py-2 text-[11px] font-bold rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 transition-all flex items-center gap-1"
                    >
                      <AlertTriangle size={12} />
                      <span>Set Flagged</span>
                    </button>
                    <button
                      type="button"
                      title="Instantly set In Review"
                      onClick={() => handleQuickResetAll('pending')}
                      disabled={isSimulating}
                      className="px-2.5 py-2 text-[11px] font-bold rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 transition-all flex items-center gap-1"
                    >
                      <Clock size={12} />
                      <span>Set In Review</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Execution Pipeline Feedback */}
              {isSimulating && (
                <div className="p-4 rounded-2xl bg-neutral-950 border border-amber-500/40 space-y-3 animate-pulse">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-400 flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin text-amber-400" />
                      Step {currentStepIndex + 1} of 5: {currentStepLabel}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      SSL Handshake Active
                    </span>
                  </div>
                  <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-300"
                      style={{ width: `${((currentStepIndex + 1) / 5) * 100}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-neutral-300 font-mono">
                    {currentStepDetail}
                  </p>
                </div>
              )}

              {/* Simulation Result Audit Log */}
              {simResult && !isSimulating && (
                <div
                  className={`p-4 rounded-2xl border space-y-3 animate-in fade-in ${
                    simResult.status === 'verified'
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-neutral-200'
                      : simResult.status === 'flagged'
                      ? 'bg-rose-950/20 border-rose-500/40 text-neutral-200'
                      : 'bg-amber-950/20 border-amber-500/40 text-neutral-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      {simResult.status === 'verified' ? (
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <CheckCircle2 size={20} />
                        </div>
                      ) : simResult.status === 'flagged' ? (
                        <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                          <AlertTriangle size={20} />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                          <Clock size={20} />
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-black text-white">
                          Verification Complete: {simResult.chefName}
                        </h4>
                        <p className="text-xs text-neutral-400">
                          UI Badge updated dynamically across Customer Marketplace, Chef App, and B2B Portal.
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-neutral-400 uppercase font-bold">Government Score</div>
                      <div className={`text-xl font-black ${
                        simResult.score >= 90 ? 'text-emerald-400' : simResult.score >= 70 ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {simResult.score}/100
                      </div>
                    </div>
                  </div>

                  {/* Step by Step Execution Feed */}
                  <div className="space-y-1.5 pt-2 border-t border-neutral-800">
                    <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                      Audit Trail Generated:
                    </div>
                    {simResult.auditTrail.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs flex items-start justify-between gap-2"
                      >
                        <div>
                          <div className="font-semibold text-white flex items-center gap-1.5">
                            {item.status === 'ok' ? (
                              <span className="text-emerald-400">✓</span>
                            ) : (
                              <span className="text-rose-400">⚠️</span>
                            )}
                            <span>{item.step}</span>
                            <span className="text-[10px] text-neutral-400 font-normal">
                              ({item.authority})
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-400 mt-0.5">{item.message}</p>
                        </div>
                        <span className="text-[10px] text-neutral-500 font-mono shrink-0">
                          {item.timestamp}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'registry_info' && (
            <div className="space-y-3">
              <p className="text-xs text-neutral-300 leading-relaxed">
                ChefPulse integrates with four statutory government verification pillars in the Karnataka and Central digital public infrastructure. Every cook dispatched to homes or restaurants must clear these endpoints:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {GOVERNMENT_REGISTRIES.map((reg) => (
                  <div
                    key={reg.code}
                    className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400 font-mono text-xs font-bold">
                        {reg.code}
                      </span>
                      <h4 className="text-xs font-bold text-white">{reg.name}</h4>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      <strong>Authority:</strong> {reg.jurisdiction}
                    </p>
                    <div className="p-2 rounded-lg bg-neutral-900 font-mono text-[10px] text-emerald-400 truncate">
                      {reg.endpoint}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'dossier' && (
            <div className="space-y-4">
              {currentChef?.verificationReport ? (
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
                  <div className="flex items-start justify-between border-b border-neutral-800 pb-3">
                    <div>
                      <div className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider">
                        Official Safety Clearance Dossier
                      </div>
                      <h4 className="text-base font-black text-white">{currentChef.name}</h4>
                      <p className="text-xs text-neutral-400">Dossier #{currentChef.verificationReport.dossierNumber}</p>
                    </div>
                    <div className="text-right">
                      <VerifiedBadge
                        size="md"
                        status={currentChef.verificationReport.status}
                        report={currentChef.verificationReport}
                      />
                      <div className="text-[10px] text-neutral-500 mt-1 font-mono">
                        Audited: {currentChef.verificationReport.verifiedDate}
                      </div>
                    </div>
                  </div>

                  {/* 4 Pillars Summary Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                      <div className="text-neutral-400 font-bold text-[11px] flex items-center gap-1.5">
                        <ShieldCheck size={13} className="text-emerald-400" />
                        <span>Karnataka Police Clearance (PCC)</span>
                      </div>
                      <div className="text-white font-medium">Ref: {currentChef.verificationReport.karnatakaPolicePCC.reference}</div>
                      <div className="text-[11px] text-neutral-400">Station: {currentChef.verificationReport.karnatakaPolicePCC.jurisdiction}</div>
                      <div className="text-[10px] text-emerald-400 font-semibold">
                        {currentChef.verificationReport.karnatakaPolicePCC.crimeRecordClear ? '✓ Zero Criminal Record Found' : '⚠️ Record Under Review'}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                      <div className="text-neutral-400 font-bold text-[11px] flex items-center gap-1.5">
                        <Fingerprint size={13} className="text-blue-400" />
                        <span>UIDAI & PAN Identification</span>
                      </div>
                      <div className="text-white font-medium">Aadhaar: {currentChef.verificationReport.aadhaarPANVerification.maskedAadhaar}</div>
                      <div className="text-[11px] text-neutral-400">PAN: {currentChef.verificationReport.aadhaarPANVerification.maskedPAN}</div>
                      <div className="text-[10px] text-emerald-400 font-semibold">
                        ✓ {currentChef.verificationReport.aadhaarPANVerification.nameMatchPercentage}% Identity Match
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                      <div className="text-neutral-400 font-bold text-[11px] flex items-center gap-1.5">
                        <BadgeCheck size={13} className="text-amber-400" />
                        <span>FSSAI FoSCoS License</span>
                      </div>
                      <div className="text-white font-medium">Lic: {currentChef.verificationReport.fssaiCertification.licenseNumber}</div>
                      <div className="text-[11px] text-neutral-400">{currentChef.verificationReport.fssaiCertification.category}</div>
                      <div className="text-[10px] text-amber-400 font-semibold">
                        Status: {currentChef.verificationReport.fssaiCertification.status.toUpperCase()}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                      <div className="text-neutral-400 font-bold text-[11px] flex items-center gap-1.5">
                        <Sparkles size={13} className="text-purple-400" />
                        <span>NABL Kitchen Microbial Swab</span>
                      </div>
                      <div className="text-white font-medium">Hygiene Score: {currentChef.verificationReport.kitchenHygieneAudit.score}/100</div>
                      <div className="text-[11px] text-neutral-400">{currentChef.verificationReport.kitchenHygieneAudit.auditor}</div>
                      <div className="text-[10px] text-emerald-400 font-semibold">
                        Culture Swab: {currentChef.verificationReport.kitchenHygieneAudit.swabCultureTest.toUpperCase()} (Clear)
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-neutral-400 bg-neutral-950 rounded-2xl border border-neutral-800">
                  <p className="text-xs">No active dossier found for this chef. Run a simulation to generate records.</p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400 shrink-0">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Real-time dynamic UI state binding active</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold transition-all text-xs"
          >
            Close Simulator
          </button>
        </div>

      </div>
    </div>
  );
};
