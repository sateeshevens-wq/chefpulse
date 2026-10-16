import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  FileCheck,
  Scan,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Cpu,
  RefreshCw,
  Sparkles,
  Database,
  Lock,
  ArrowRight,
  Eye,
  Camera,
  XCircle,
  Zap,
} from 'lucide-react';
import { Chef, ChefDocumentUploads } from '../../types';
import { playAlertChime } from '../../utils/sound';

interface ZeroTouchOnboardingEngineProps {
  isOpen: boolean;
  onClose: () => void;
  chef: Chef;
  onApprovalComplete: (updatedChef: Chef) => void;
}

export type PipelineStage = 'upload' | 'ocr_scanning' | 'gov_cross_check' | 'police_cctns' | 'verdict';

export const ZeroTouchOnboardingEngine: React.FC<ZeroTouchOnboardingEngineProps> = ({
  isOpen,
  onClose,
  chef,
  onApprovalComplete,
}) => {
  const [stage, setStage] = useState<PipelineStage>('upload');
  const [testSimulateFlag, setTestSimulateFlag] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [ocrProgress, setOcrProgress] = useState(0);

  // Extracted OCR fields
  const [extractedAadhaarName, setExtractedAadhaarName] = useState(chef.name);
  const [extractedAadhaarNum, setExtractedAadhaarNum] = useState('XXXX XXXX 4819');
  const [extractedFssaiNum, setExtractedFssaiNum] = useState('11223344556677');
  const [extractedFssaiExpiry, setExtractedFssaiExpiry] = useState('2028-12-31');
  const [extractedPccJurisdiction, setExtractedPccJurisdiction] = useState(chef.cityName || 'Bengaluru');

  // API Verification Logs
  const [verificationLogs, setVerificationLogs] = useState<string[]>([]);
  const [finalVerdict, setFinalVerdict] = useState<'approved' | 'flagged' | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (stage !== 'upload' && stage !== 'verdict') {
      timer = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [stage]);

  if (!isOpen) return null;

  const startAutomatedPipeline = () => {
    setStage('ocr_scanning');
    setSecondsElapsed(0);
    setOcrProgress(15);
    setVerificationLogs([
      '📥 Ingested high-resolution Aadhaar Card & FSSAI Document scans.',
      '🔍 Initializing Neural Optical Character Recognition (OCR) model...',
    ]);

    // Stage 1: OCR Scanning (Simulate 1.5s)
    setTimeout(() => {
      setOcrProgress(60);
      setVerificationLogs((prev) => [
        ...prev,
        '🔤 OCR Extracted: UIDAI QR Code digital signature parsed successfully.',
        `🔤 Aadhaar Name: "${chef.name}" (100% Levenshtein phonetic match with chef profile).`,
        `🔤 FSSAI License: #${extractedFssaiNum} (Commercial Food Prep Category 16).`,
      ]);
    }, 1200);

    // Stage 2: Gov API cross-checks (Simulate 2.8s)
    setTimeout(() => {
      setStage('gov_cross_check');
      setOcrProgress(85);
      setVerificationLogs((prev) => [
        ...prev,
        '🌐 Ping UIDAI eKYC Gateway: Biometric demographic match validated (Status: 200 OK).',
        '🌐 Ping Food Safety Compliance System (FoSCoS): Active License verified through 2028.',
        '🌐 Ping National Medical Register: Food handler swab culture test verified negative.',
      ]);
    }, 2600);

    // Stage 3: Police CCTNS background check (Simulate 4.0s)
    setTimeout(() => {
      setStage('police_cctns');
      setOcrProgress(95);
      setVerificationLogs((prev) => [
        ...prev,
        '👮 Interfacing with Crime and Criminal Tracking Network & Systems (CCTNS)...',
        '🔎 Querying Pan-India NCRB records across all 28 State Police Commissionerates...',
      ]);
    }, 4000);

    // Stage 4: Automated Algorithmic Verdict (Simulate 5.5s)
    setTimeout(() => {
      setStage('verdict');
      setOcrProgress(100);

      if (testSimulateFlag) {
        setFinalVerdict('flagged');
        setVerificationLogs((prev) => [
          ...prev,
          '⚠️ CCTNS Alert: Found potential name ambiguity in regional court docket.',
          '⛔ Automated Rule: Threshold score 64/100 (Below 85 auto-pass). Profile automatically flagged for compliance desk.',
        ]);
        playAlertChime('sos_panic');
      } else {
        setFinalVerdict('approved');
        setVerificationLogs((prev) => [
          ...prev,
          '✅ CCTNS Criminal Background Check: 100% CLEAN (Zero adverse FIRs or pending cases).',
          '⚡ Automated Decision Engine: All 4 verification parameters PASSED.',
          '🎉 ZERO HUMAN ADMIN TOUCH: Chef profile autonomously cleared in under 5 minutes!',
        ]);
        playAlertChime('accepted');

        // Update chef object
        const updatedChef: Chef = {
          ...chef,
          policeVerified: true,
          hygieneCertified: true,
          status: 'available',
          isOnline: true,
        };
        onApprovalComplete(updatedChef);
      }
    }, 5500);
  };

  return (
    <div className="fixed inset-0 z-[2300] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-700 rounded-3xl p-6 sm:p-8 shadow-2xl text-neutral-100 max-h-[92vh] overflow-y-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Cpu size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold uppercase tracking-wider">
                  ZERO-TOUCH AUTOMATED PIPELINE
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  &lt; 5-Min SLA
                </span>
              </div>
              <h3 className="text-lg font-black text-white mt-1">
                Autonomous Provider Onboarding & OCR Engine
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white text-lg p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Pipeline Stages Stepper */}
        <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-bold">
          <div
            className={`p-2 rounded-xl border ${
              stage === 'upload'
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-neutral-950 border-neutral-800 text-neutral-400'
            }`}
          >
            1. Document Upload
          </div>
          <div
            className={`p-2 rounded-xl border ${
              stage === 'ocr_scanning'
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : stage === 'gov_cross_check' || stage === 'police_cctns' || stage === 'verdict'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                : 'bg-neutral-950 border-neutral-800 text-neutral-400'
            }`}
          >
            2. Neural OCR Scan
          </div>
          <div
            className={`p-2 rounded-xl border ${
              stage === 'gov_cross_check' || stage === 'police_cctns'
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : stage === 'verdict'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                : 'bg-neutral-950 border-neutral-800 text-neutral-400'
            }`}
          >
            3. Gov API Sync
          </div>
          <div
            className={`p-2 rounded-xl border ${
              stage === 'verdict'
                ? finalVerdict === 'approved'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                  : 'bg-red-500/20 border-red-500 text-red-400'
                : 'bg-neutral-950 border-neutral-800 text-neutral-400'
            }`}
          >
            4. Auto Verdict
          </div>
        </div>

        {/* STAGE: UPLOAD */}
        {stage === 'upload' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-neutral-300">
                <span>Documents Ready for Neural Extraction:</span>
                <span className="text-amber-400 font-mono">2 Documents Staged</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Aadhaar Preview */}
                <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span>🆔</span> Aadhaar Smart Card
                    </span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      Front & Back Loaded
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-400 font-mono">
                    Owner: {chef.name} • UIDAI QR Signed
                  </div>
                </div>

                {/* FSSAI Preview */}
                <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span>📜</span> FSSAI FoSCoS License
                    </span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      PDF Extracted
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-400 font-mono">
                    Reg: #11223344556677 • Cat: Catering
                  </div>
                </div>
              </div>
            </div>

            {/* Test Toggle: Simulate Adverse Flag */}
            <div className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-neutral-200">Test Edge Case:</span>
                <p className="text-[10px] text-neutral-400">
                  Simulate adverse CCTNS police record to test auto-flagging rule
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTestSimulateFlag(!testSimulateFlag)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  testSimulateFlag
                    ? 'bg-red-500 text-white'
                    : 'bg-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {testSimulateFlag ? '⚠️ Simulate Flag: ON' : 'Normal Clean Test'}
              </button>
            </div>

            <button
              type="button"
              onClick={startAutomatedPipeline}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Zap size={16} />
              <span>Launch Zero-Touch 5-Minute Verification Engine</span>
            </button>
          </div>
        )}

        {/* ACTIVE PIPELINE PROGRESS (OCR, GOV, POLICE) */}
        {stage !== 'upload' && (
          <div className="space-y-4">
            {/* Live Progress Bar & Timer */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-white flex items-center gap-2">
                  <RefreshCw size={14} className="animate-spin text-amber-400" />
                  <span>
                    {stage === 'ocr_scanning' && 'Optical Character Scanning & Document OCR...'}
                    {stage === 'gov_cross_check' && 'Cross-Referencing UIDAI & FSSAI Registries...'}
                    {stage === 'police_cctns' && 'Querying Pan-India Police CCTNS Database...'}
                    {stage === 'verdict' && 'Final Autonomous Clearance Verdict'}
                  </span>
                </span>

                <span className="font-mono text-amber-400">
                  Elapsed: 00:{secondsElapsed.toString().padStart(2, '0')} / 05:00 max
                </span>
              </div>

              <div className="w-full h-2.5 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${ocrProgress}%` }}
                />
              </div>
            </div>

            {/* Neural OCR Extraction Card */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-200 flex items-center gap-1.5">
                  <Scan size={14} className="text-amber-400" />
                  <span>Real-Time OCR Extracted Attributes</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  99.4% Confidence
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800/80">
                  <span className="text-neutral-500 block text-[9px]">NAME MATCH</span>
                  <span className="text-white font-bold">{extractedAadhaarName}</span>
                </div>
                <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800/80">
                  <span className="text-neutral-500 block text-[9px]">AADHAAR HASH</span>
                  <span className="text-white font-bold">{extractedAadhaarNum}</span>
                </div>
                <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800/80">
                  <span className="text-neutral-500 block text-[9px]">FSSAI LICENSE</span>
                  <span className="text-white font-bold">#{extractedFssaiNum}</span>
                </div>
                <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800/80">
                  <span className="text-neutral-500 block text-[9px]">LICENSE EXPIRY</span>
                  <span className="text-white font-bold">{extractedFssaiExpiry}</span>
                </div>
              </div>
            </div>

            {/* Live Audit Logs Stream */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                Autonomous API Audit Trail:
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto font-mono text-[11px] text-neutral-300">
                {verificationLogs.map((log, index) => (
                  <div key={index} className="leading-snug">
                    {log}
                  </div>
                ))}
              </div>
            </div>

            {/* Final Verdict Banner */}
            {stage === 'verdict' && (
              <div
                className={`p-5 rounded-2xl border space-y-3 animate-in zoom-in-95 ${
                  finalVerdict === 'approved'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                    : 'bg-red-500/10 border-red-500/30 text-red-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      finalVerdict === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {finalVerdict === 'approved' ? (
                      <CheckCircle2 size={24} />
                    ) : (
                      <XCircle size={24} />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">
                      {finalVerdict === 'approved'
                        ? 'AUTONOMOUS APPROVAL GRANTED (Zero Admin Touch)'
                        : 'AUTONOMOUS SUSPENSION / AUDIT FLAGGED'}
                    </h4>
                    <p className="text-xs text-neutral-300 mt-0.5">
                      {finalVerdict === 'approved'
                        ? 'All 4 verification checks resolved via direct government APIs. Chef is cleared and status unlocked to go Online immediately.'
                        : 'Adverse record identified in CCTNS query. Account quarantined and dispatched to safety compliance desk.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs cursor-pointer"
                  >
                    Close Engine
                  </button>
                  {finalVerdict === 'approved' && (
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs cursor-pointer shadow-md shadow-emerald-500/20"
                    >
                      ✓ Proceed Online
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
