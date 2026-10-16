import React, { useState } from 'react';
import { Chef, AadhaarKycData, ChefDocumentUploads } from '../../types';
import { ShieldCheck, FileCheck, CheckCircle2, AlertTriangle, Upload, Eye, RefreshCw, X, FileText, Lock } from 'lucide-react';
import { playAlertChime } from '../../utils/sound';

interface ChefVerificationPortalProps {
  isOpen: boolean;
  onClose: () => void;
  chef: Chef;
  onUpdateChefDocuments: (docs: ChefDocumentUploads) => void;
}

export const ChefVerificationPortal: React.FC<ChefVerificationPortalProps> = ({
  isOpen,
  onClose,
  chef,
  onUpdateChefDocuments,
}) => {
  // Aadhaar flow state
  const [aadhaarNumber, setAadhaarNumber] = useState('584291824819');
  const [aadhaarOtp, setAadhaarOtp] = useState('');
  const [isAadhaarOtpSent, setIsAadhaarOtpSent] = useState(false);
  const [isVerifyingAadhaar, setIsVerifyingAadhaar] = useState(false);
  const [aadhaarVerified, setAadhaarVerified] = useState(true);

  // Document states
  const [fssaiNumber, setFssaiNumber] = useState('11223344556677');
  const [fssaiVerified, setFssaiVerified] = useState(true);
  const [policePccNumber, setPolicePccNumber] = useState('PCC-KA-881920');
  const [policePccVerified, setPolicePccVerified] = useState(true);
  const [healthDocVerified, setHealthDocVerified] = useState(true);

  if (!isOpen) return null;

  const handleSendAadhaarOtp = () => {
    if (aadhaarNumber.length < 12) return;
    setIsVerifyingAadhaar(true);
    setTimeout(() => {
      setIsVerifyingAadhaar(false);
      setIsAadhaarOtpSent(true);
      setAadhaarOtp('842190'); // pre-fill demo OTP
    }, 600);
  };

  const handleVerifyAadhaarOtp = () => {
    setIsVerifyingAadhaar(true);
    setTimeout(() => {
      setIsVerifyingAadhaar(false);
      setAadhaarVerified(true);
      playAlertChime('accepted');
    }, 800);
  };

  const handleSaveDocuments = () => {
    const masked = `XXXX XXXX ${aadhaarNumber.slice(-4)}`;
    const updatedDocs: ChefDocumentUploads = {
      aadhaar: {
        aadhaarNumber,
        maskedAadhaar: masked,
        verified: aadhaarVerified,
        nameOnAadhaar: chef.name,
        dob: '1989-06-14',
        gender: 'Male',
        verifiedAt: new Date().toISOString(),
        txnId: `UIDAI-TXN-${Date.now()}`,
      },
      fssaiLicense: {
        licenseNumber: fssaiNumber,
        validThrough: '2028-12-31',
        verified: fssaiVerified,
      },
      policeBackgroundCheck: {
        pccNumber: policePccNumber,
        statePolice: 'Karnataka Police Commissionerate (CCTNS)',
        clearanceStatus: 'cleared',
        verified: policePccVerified,
      },
      healthFitnessCertificate: {
        doctorRegistration: 'KMC-DOC-49219',
        testedNegativeDate: '2026-09-01',
        verified: healthDocVerified,
      },
    };

    onUpdateChefDocuments(updatedDocs);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2250] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-700 rounded-3xl p-6 sm:p-7 shadow-2xl text-neutral-100 max-h-[92vh] overflow-y-auto space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold uppercase tracking-wider">
                GOVERNMENT & POLICE VERIFICATION
              </span>
              <h3 className="text-base font-black text-white mt-0.5">
                Chef Identity & Document Pipeline
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

        {/* 1. Aadhaar Card Upload & Real-Time UIDAI OTP Validation */}
        <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🆔</span>
              <div>
                <h4 className="text-xs font-black text-white">
                  1. Aadhaar Identity Card & UIDAI OTP Validation
                </h4>
                <p className="text-[10px] text-neutral-400">
                  Government of India Digital Identity Framework
                </p>
              </div>
            </div>
            {aadhaarVerified && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                ✓ UIDAI Verified
              </span>
            )}
          </div>

          {!aadhaarVerified ? (
            <div className="space-y-2.5 pt-1 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                  12-Digit Aadhaar Number
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={12}
                    value={aadhaarNumber}
                    onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 12-digit Aadhaar"
                    className="flex-1 px-3 py-2 text-xs font-mono font-bold tracking-widest bg-neutral-900 border border-neutral-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleSendAadhaarOtp}
                    disabled={isVerifyingAadhaar || aadhaarNumber.length < 12}
                    className="px-3 py-2 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs hover:bg-amber-400 disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    {isVerifyingAadhaar ? 'Connecting...' : 'Request OTP'}
                  </button>
                </div>
              </div>

              {isAadhaarOtpSent && (
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2 animate-in zoom-in-95">
                  <div className="text-[11px] text-emerald-400 font-semibold">
                    Simulated OTP sent to linked mobile (+91 98*** **345)
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={aadhaarOtp}
                      onChange={(e) => setAadhaarOtp(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      className="w-36 px-3 py-1.5 text-xs font-mono font-bold text-center tracking-widest bg-neutral-950 border border-neutral-700 rounded-xl text-white"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyAadhaarOtp}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 text-neutral-950 font-bold text-xs hover:bg-emerald-400 cursor-pointer"
                    >
                      Verify OTP ➔
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
              <div className="flex justify-between text-emerald-300">
                <span>Masked Aadhaar:</span>
                <span className="font-mono font-bold">XXXX XXXX {aadhaarNumber.slice(-4)}</span>
              </div>
              <div className="flex justify-between text-neutral-300">
                <span>Name on Aadhaar:</span>
                <span className="font-semibold">{chef.name} (100% Match)</span>
              </div>
              <div className="text-[10px] text-neutral-400">
                Biometric KYC verified through UIDAI authentication gateway.
              </div>
            </div>
          )}
        </div>

        {/* 2. FSSAI Food Hygiene Certificate Upload */}
        <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">📜</span>
              <div>
                <h4 className="text-xs font-black text-white">
                  2. FSSAI Food Safety & Hygiene License
                </h4>
                <p className="text-[10px] text-neutral-400">
                  Food Safety Compliance System (FoSCoS)
                </p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
              ✓ Active License
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <input
              type="text"
              value={fssaiNumber}
              onChange={(e) => setFssaiNumber(e.target.value)}
              placeholder="14-digit FSSAI license"
              className="flex-1 px-3 py-1.5 text-xs font-mono bg-neutral-900 border border-neutral-700 rounded-xl text-white"
            />
            <span className="text-[11px] text-neutral-400">Valid: 2028-12-31</span>
          </div>
        </div>

        {/* 3. Third-Party Police Background Check (PCC) */}
        <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">👮</span>
              <div>
                <h4 className="text-xs font-black text-white">
                  3. Police Clearance Certificate (PCC)
                </h4>
                <p className="text-[10px] text-neutral-400">
                  Karnataka State Police Crime Records Bureau (CCTNS)
                </p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
              ✓ Crime Record Clear
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <input
              type="text"
              value={policePccNumber}
              onChange={(e) => setPolicePccNumber(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs font-mono bg-neutral-900 border border-neutral-700 rounded-xl text-white"
            />
            <span className="text-[11px] text-neutral-400 font-semibold">Jurisdiction: Bengaluru</span>
          </div>
        </div>

        {/* 4. Medical Health & Fitness Certificate */}
        <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🩺</span>
              <div>
                <h4 className="text-xs font-black text-white">
                  4. Food Handler Medical Fitness Certificate
                </h4>
                <p className="text-[10px] text-neutral-400">
                  Registered Medical Practitioner (Typhoid & Swab Negative)
                </p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
              ✓ Fit to Cook
            </span>
          </div>
          <p className="text-[11px] text-neutral-400">
            Certified free from communicable skin/airborne pathogens. Annual checkup up-to-date.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveDocuments}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
        >
          Save & Update Verification Dossier
        </button>

      </div>
    </div>
  );
};
