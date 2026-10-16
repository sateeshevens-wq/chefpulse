import React, { useState, useEffect, useRef } from 'react';
import { Chef, ChefLivenessCheck } from '../../types';
import { Camera, CheckCircle2, ShieldCheck, RefreshCw, AlertTriangle, X, Sparkles, UserCheck } from 'lucide-react';
import { playAlertChime } from '../../utils/sound';

interface LivenessSelfieModalProps {
  isOpen: boolean;
  onClose: () => void;
  chef: Chef;
  onLivenessSuccess: (check: ChefLivenessCheck) => void;
}

export const LivenessSelfieModal: React.FC<LivenessSelfieModalProps> = ({
  isOpen,
  onClose,
  chef,
  onLivenessSuccess,
}) => {
  const [step, setStep] = useState<'instructions' | 'capturing' | 'analyzing' | 'success'>('instructions');
  const [countdown, setCountdown] = useState(3);
  const [livenessStage, setLivenessStage] = useState<'blink' | 'smile' | 'steady'>('steady');
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [confidenceScore, setConfidenceScore] = useState(99.4);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Suggested chef live captures
  const SAMPLE_LIVE_SELFIES = [
    'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1581299894007-aaa50297cf16?auto=format&fit=crop&w=400&q=80',
  ];

  useEffect(() => {
    if (isOpen) {
      setStep('instructions');
      setCountdown(3);
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartCapture = () => {
    setStep('capturing');
    setLivenessStage('steady');

    // Countdown and automatic liveness check sequence
    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count === 2) setLivenessStage('blink');
      if (count === 1) setLivenessStage('smile');

      if (count <= 0) {
        clearInterval(interval);
        // Capture photo
        const chosenPhoto = chef.avatar || SAMPLE_LIVE_SELFIES[0];
        setCapturedPhotoUrl(chosenPhoto);
        setStep('analyzing');

        // Simulate Biometric anti-spoofing analysis
        setTimeout(() => {
          setConfidenceScore(99.4);
          setStep('success');
          playAlertChime('accepted');
        }, 1200);
      }
    }, 1000);
  };

  const handleConfirmAndGoOnline = () => {
    const now = new Date();
    const expires = new Date(now.getTime() + 12 * 60 * 60 * 1000); // 12 hours validity

    const checkResult: ChefLivenessCheck = {
      passed: true,
      timestamp: now.toISOString(),
      selfieUrl: capturedPhotoUrl || chef.avatar,
      expiresAt: expires.toISOString(),
      confidenceScore,
      facialFramingPassed: true,
      chefAttireVerified: true,
    };

    onLivenessSuccess(checkResult);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2300] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-3xl p-6 sm:p-7 shadow-2xl text-neutral-100 overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white text-xl p-1 z-10 cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* STEP 1: INSTRUCTIONS */}
        {step === 'instructions' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Camera size={20} />
              </div>
              <div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold uppercase tracking-wider">
                  MANDATORY SAFETY PROTOCOL
                </span>
                <h3 className="text-base font-black text-white mt-0.5">
                  Real-Time Liveness & Selfie Check
                </h3>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              To keep Bangalore homeowners safe, every chef must pass a biometric selfie verification before switching to <strong className="text-emerald-400">ONLINE (GPS Radar)</strong>.
            </p>

            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2.5 text-xs">
              <div className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                Camera Instructions:
              </div>
              <div className="flex items-start gap-2 text-neutral-300">
                <span className="text-emerald-400 font-bold">1.</span>
                <span>Hold device at eye level with good lighting.</span>
              </div>
              <div className="flex items-start gap-2 text-neutral-300">
                <span className="text-emerald-400 font-bold">2.</span>
                <span>Ensure your clean chef coat / apron is visible.</span>
              </div>
              <div className="flex items-start gap-2 text-neutral-300">
                <span className="text-emerald-400 font-bold">3.</span>
                <span>Follow on-screen prompt: Blink or smile when prompted.</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
              <ShieldCheck size={16} className="shrink-0" />
              <span>Biometric verification valid for 12 hours once completed.</span>
            </div>

            <button
              type="button"
              onClick={handleStartCapture}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Camera size={15} />
              <span>Open Viewfinder & Verify Liveness</span>
            </button>
          </div>
        )}

        {/* STEP 2: CAPTURING & VIEWFINDER */}
        {step === 'capturing' && (
          <div className="space-y-4 text-center">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Facial Biometric Alignment
            </div>

            {/* Simulated Live Viewfinder with Oval Guide */}
            <div className="relative w-64 h-72 mx-auto rounded-3xl overflow-hidden bg-neutral-950 border-2 border-amber-500/80 shadow-2xl flex items-center justify-center">
              <img
                src={chef.avatar}
                alt="Chef Camera Preview"
                className="w-full h-full object-cover filter brightness-105"
              />

              {/* Oval Facial Frame Overlay */}
              <div className="absolute inset-4 rounded-[45%] border-2 border-dashed border-emerald-400/80 animate-pulse pointer-events-none flex items-center justify-center">
                <span className="text-[10px] text-emerald-300 font-bold uppercase px-2 py-0.5 rounded bg-black/60">
                  Align Face Inside Oval
                </span>
              </div>

              {/* Countdown Watermark */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/80 backdrop-blur-sm text-white font-mono font-black text-sm border border-neutral-700 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span>Capturing in {countdown}s</span>
              </div>
            </div>

            {/* Prompt Indicator */}
            <div className="p-3 rounded-2xl bg-neutral-800 border border-neutral-700 text-xs">
              <div className="text-neutral-400">Live Challenge:</div>
              <div className="text-sm font-black text-amber-300 mt-0.5 animate-bounce">
                {livenessStage === 'steady' && '👀 Hold steady and look directly at lens'}
                {livenessStage === 'blink' && '👁️ Blink your eyes now'}
                {livenessStage === 'smile' && '😊 Smile naturally for anti-spoof test'}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: ANALYZING */}
        {step === 'analyzing' && (
          <div className="py-8 space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto animate-spin">
              <RefreshCw size={28} />
            </div>
            <h4 className="text-base font-black text-white">
              Running Biometric Anti-Spoofing AI
            </h4>
            <p className="text-xs text-neutral-400 max-w-xs mx-auto">
              Comparing 3D depth, micro-expressions, and matching against verified Karnataka Police & UIDAI profile...
            </p>
          </div>
        )}

        {/* STEP 4: SUCCESS */}
        {step === 'success' && (
          <div className="space-y-4 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-3xl">
              ✓
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-emerald-400 font-mono tracking-wider">
                BIOMETRIC LIVENESS PASSED ({confidenceScore}% MATCH)
              </div>
              <h3 className="text-lg font-black text-white mt-0.5">
                Selfie Check Cleared for {chef.name}
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Uniform verified: Clean Chef Apron & Grooming Standard. Valid for 12 hours.
              </p>
            </div>

            {/* Verified Photo Card */}
            <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center gap-3 text-left">
              <img
                src={capturedPhotoUrl || chef.avatar}
                alt="Verified Selfie"
                className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500/60"
              />
              <div className="min-w-0 flex-1 text-xs">
                <div className="font-bold text-white flex items-center gap-1">
                  <span>Chef Identity Confirmed</span>
                  <Sparkles size={12} className="text-amber-400" />
                </div>
                <div className="text-[11px] text-neutral-400">
                  Karnataka CCTNS & FSSAI Safety Badge Active
                </div>
                <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                  Timestamp: {new Date().toLocaleTimeString('en-IN')}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirmAndGoOnline}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <UserCheck size={16} />
              <span>Activate GPS Radar & Go Online</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
