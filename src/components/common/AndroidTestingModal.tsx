import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface AndroidTestingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'download_apk' | 'qr_install' | 'apk_guide' | 'checklist';
}

export const AndroidTestingModal: React.FC<AndroidTestingModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'download_apk',
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [downloadingBundle, setDownloadingBundle] = useState(false);
  const [isDownloadingApk, setIsDownloadingApk] = useState(false);
  const [activeTab, setActiveTab] = useState<'download_apk' | 'qr_install' | 'apk_guide' | 'checklist'>(defaultTab);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://chefpulse.in';

  // Generate QR code on modal open or URL change
  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(currentUrl, {
        width: 280,
        margin: 2,
        color: {
          dark: '#f59e0b', // Amber theme
          light: '#18181b', // Zinc-900 background
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Error generating QR code:', err));
    }
  }, [isOpen, currentUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleDownloadApk = (variant: 'standard' | 'release' = 'standard') => {
    setIsDownloadingApk(true);
    const filename = variant === 'release' ? 'chefpulse-release.apk' : 'chefpulse.apk';
    const link = document.createElement('a');
    link.href = `/${filename}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setIsDownloadingApk(false), 1500);
  };

  const handleDownloadTwaManifest = () => {
    setDownloadingBundle(true);
    const twaManifest = {
      packageId: "in.chefpulse.app",
      name: "ChefPulse India",
      launcherName: "ChefPulse",
      themeColor: "#0a0a0a",
      navigationColor: "#0a0a0a",
      backgroundColor: "#0a0a0a",
      enableNotifications: true,
      startUrl: currentUrl,
      iconUrl: `${currentUrl.replace(/\/$/, '')}/pwa-512x512.png`,
      maskableIconUrl: `${currentUrl.replace(/\/$/, '')}/pwa-maskable-512x512.png`,
      generator: "ChefPulse Native Android Packager v1.0",
      description: "Pan-India on-demand home chefs, luxury catering & hospitality marketplace.",
      apkFileLocation: "chefpulse.apk",
      citiesSupported: ["Bengaluru", "Mumbai", "Delhi NCR", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Goa", "25+ Pan-India"],
      features: [
        "Direct Offline & Online Embedded WebView",
        "Instant On-Demand Chef Booking",
        "High-Priority SOS Panic Safety Dispatch",
        "Web Audio Emergency Alarms",
        "Chef Partner Real-Time Radar",
        "B2B Hospitality Shift Staffing"
      ]
    };

    const blob = new Blob([JSON.stringify(twaManifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chefpulse-android-twa-manifest.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setTimeout(() => setDownloadingBundle(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-[2200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-neutral-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="android-modal-title"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/40 border-b border-neutral-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/20 text-neutral-950 font-black">
              🤖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="android-modal-title" className="text-xl font-bold text-white tracking-tight">
                  Android App & APK Export
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                  APK Generated
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Download the signed standalone Android <span className="text-amber-400 font-mono font-semibold">.apk</span> or scan the QR code to install directly.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/50 px-6 pt-3 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('download_apk')}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-2 shrink-0 ${
              activeTab === 'download_apk'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <span>📦</span> Download APK File (Direct)
          </button>
          <button
            onClick={() => setActiveTab('qr_install')}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-2 shrink-0 ${
              activeTab === 'qr_install'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <span>📱</span> Phone QR Code & WebAPK
          </button>
          <button
            onClick={() => setActiveTab('apk_guide')}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-2 shrink-0 ${
              activeTab === 'apk_guide'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <span>⚙️</span> Build Pipeline & Config
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-2 shrink-0 ${
              activeTab === 'checklist'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <span>✅</span> Android Checklist
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'download_apk' && (
            <div className="space-y-6">
              {/* Featured APK Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-neutral-950 via-neutral-950 to-amber-950/30 border border-amber-500/40 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30 shrink-0">
                      📦
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white tracking-tight">
                          chefpulse.apk
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          v1.0.0
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Signed
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Android Application Package with embedded offline assets & push notification engine.
                      </p>
                    </div>
                  </div>

                  {/* Primary Download Buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <button
                      onClick={() => handleDownloadApk('standard')}
                      disabled={isDownloadingApk}
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 active:scale-95 transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      {isDownloadingApk ? 'Starting Download...' : 'Download chefpulse.apk (506 KB)'}
                    </button>
                  </div>
                </div>

                {/* Technical Metadata Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800">
                    <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Package ID</div>
                    <div className="font-mono text-amber-300 font-bold text-xs truncate">in.chefpulse.app</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800">
                    <div className="text-[10px] text-neutral-500 uppercase tracking-wider">File Size</div>
                    <div className="text-white font-bold text-xs">506 KB (Optimized)</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800">
                    <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Android Target</div>
                    <div className="text-white font-bold text-xs">API 21 - API 33+</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800">
                    <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Signatures</div>
                    <div className="text-emerald-400 font-bold text-xs">v1, v2 & v3 (Verified)</div>
                  </div>
                </div>

                {/* Project File Location Info */}
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-2 text-neutral-300">
                    <span className="text-emerald-400 text-sm">📁</span>
                    <span>Direct File in Project:</span>
                    <code className="text-amber-400 font-mono text-[11px] bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                      ./chefpulse.apk
                    </code>
                  </div>
                  <a
                    href="/chefpulse.apk"
                    download="chefpulse.apk"
                    className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2 flex items-center gap-1 shrink-0"
                  >
                    Direct Link ↗
                  </a>
                </div>
              </div>

              {/* Sideloading Installation Guide */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <span>📱</span> How to Install on your Android Phone:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-1.5">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">
                      1
                    </div>
                    <div className="text-xs font-bold text-white">Download APK</div>
                    <p className="text-[11px] text-neutral-400">
                      Tap the download button above or send <code className="text-amber-400">chefpulse.apk</code> to your phone via USB/WhatsApp/Drive.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-1.5">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">
                      2
                    </div>
                    <div className="text-xs font-bold text-white">Allow Unknown Sources</div>
                    <p className="text-[11px] text-neutral-400">
                      When opening the file in Chrome or Files, toggle <em>"Allow from this source"</em> (standard Android safety prompt).
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-1.5">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">
                      3
                    </div>
                    <div className="text-xs font-bold text-white">Tap "Install"</div>
                    <p className="text-[11px] text-neutral-400">
                      Android installs the app. You can now launch ChefPulse from your home screen with all features active!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'qr_install' && (
            <div className="space-y-6">
              {/* Primary action block if inside mobile browser */}
              {isInstallable && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">⚡</span>
                    <div>
                      <div className="text-sm font-bold text-amber-300">Browser Install Prompt Ready!</div>
                      <div className="text-xs text-neutral-300">
                        Tap below to install ChefPulse directly to your home screen.
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      await install();
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Install Now to Device
                  </button>
                </div>
              )}

              {isInstalled && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-xs font-semibold">
                  <span className="text-xl">✨</span>
                  <span>ChefPulse is already installed and running in Standalone App mode on this device!</span>
                </div>
              )}

              {/* QR Code & Phone Instructions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* QR Code Box */}
                <div className="flex flex-col items-center justify-center p-6 bg-neutral-950 rounded-2xl border border-neutral-800 text-center">
                  <div className="p-3 bg-neutral-900 rounded-2xl border border-amber-500/30 shadow-xl shadow-amber-500/5 mb-3">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="Scan QR code to install ChefPulse on Android"
                        className="w-52 h-52 rounded-xl"
                      />
                    ) : (
                      <div className="w-52 h-52 flex items-center justify-center text-neutral-500 text-xs">
                        Generating QR...
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    Scan with Android Camera or Chrome
                  </span>
                  <p className="text-[11px] text-neutral-500 mt-1 max-w-xs">
                    Point your Android device camera to immediately launch ChefPulse.
                  </p>
                </div>

                {/* 3 Step Install Process */}
                <div className="space-y-3.5">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-950/70 border border-neutral-800">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                      1
                    </span>
                    <div className="text-xs text-neutral-300">
                      <strong className="text-white block font-medium">Scan or Open URL in Chrome</strong>
                      Use your Android phone camera to scan the QR code, or paste the URL below directly into Google Chrome.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-950/70 border border-neutral-800">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                      2
                    </span>
                    <div className="text-xs text-neutral-300">
                      <strong className="text-white block font-medium">Tap "Install App" or Menu (⋮)</strong>
                      Tap the in-app <strong>"Install App"</strong> button, or tap Chrome's three dots menu (<strong>⋮</strong>) and choose <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-950/70 border border-neutral-800">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                      3
                    </span>
                    <div className="text-xs text-neutral-300">
                      <strong className="text-white block font-medium">Native Android WebAPK Launch</strong>
                      Android automatically registers ChefPulse in your launcher with the official app icon, full offline support, and fullscreen experience!
                    </div>
                  </div>

                  {/* URL copy bar */}
                  <div className="pt-2">
                    <div className="text-[11px] text-neutral-400 mb-1.5">Direct URL to test on phone:</div>
                    <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-xl p-1.5 pl-3">
                      <input
                        type="text"
                        readOnly
                        value={currentUrl}
                        className="bg-transparent text-xs text-amber-300 outline-none flex-1 font-mono truncate"
                      />
                      <button
                        onClick={handleCopyLink}
                        className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 transition shrink-0"
                      >
                        {copiedUrl ? 'Copied ✓' : 'Copy Link'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'apk_guide' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">Android Build Pipeline in Project</h3>
                    <p className="text-xs text-neutral-400">
                      Compiled with Android SDK platform tools (aapt, dx, javac, zipalign & apksigner).
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadApk('standard')}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
                    >
                      <span>📥</span>
                      Download APK
                    </button>
                    <button
                      onClick={handleDownloadTwaManifest}
                      disabled={downloadingBundle}
                      className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      <span>📄</span>
                      {downloadingBundle ? '...' : 'TWA JSON'}
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 font-mono text-xs text-emerald-400 space-y-1">
                  <div className="text-neutral-500 text-[11px]"># Rebuild APK anytime in project terminal:</div>
                  <div>npm run build:apk</div>
                </div>
              </div>

              {/* Instructions on building APK */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Build Architecture & Assets:
                </h4>

                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center text-[11px]">1</span>
                    Built APK Location in Workspace:
                  </div>
                  <ul className="text-xs text-neutral-300 space-y-1 pl-7 list-disc">
                    <li><code className="text-amber-400">./chefpulse.apk</code> - Root standalone installable APK</li>
                    <li><code className="text-amber-400">./public/chefpulse.apk</code> - Vite public directory (HTTP downloadable)</li>
                    <li><code className="text-amber-400">./scripts/build-apk.sh</code> - Production compilation pipeline</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center text-[11px]">2</span>
                    Google Play Store (Bubblewrap CLI Option):
                  </div>
                  <div className="bg-neutral-900 p-2.5 rounded-lg font-mono text-[11px] text-emerald-400 overflow-x-auto">
                    npm install -g @bubblewrap/cli<br />
                    bubblewrap init --manifest={currentUrl}/manifest.webmanifest<br />
                    bubblewrap build
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Produces a signed Android App Bundle (<code className="text-neutral-300">.aab</code>) for upload to Google Play Console.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'checklist' && (
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <h3 className="text-sm font-bold text-white">Android Hardware & OS Feature Verification</h3>
                <p className="text-xs text-neutral-400">
                  The ChefPulse app is tuned for real-world Android testing across Indian mobile networks:
                </p>

                <div className="space-y-2.5 pt-2">
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <div>
                      <strong className="text-neutral-200">🚨 SOS Emergency Panic synthesis:</strong>
                      <div className="text-[11px] text-neutral-400">
                        Plays 880Hz alternating warning siren using native Web Audio synthesizer and vibrates device hardware.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <div>
                      <strong className="text-neutral-200">👨‍🍳 Chef Incoming Gig Radar & Audio Chime:</strong>
                      <div className="text-[11px] text-neutral-400">
                        Simulates real-time chef gig assignment with distinct two-tone alert chimes when a customer books.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <div>
                      <strong className="text-neutral-200">📱 Mobile Responsive Viewport & Safe Areas:</strong>
                      <div className="text-[11px] text-neutral-400">
                        Configured with viewport meta tag, theme-color (#0a0a0a) and full support for notch and gesture navigation.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <div>
                      <strong className="text-neutral-200">⚡ Offline Cache with Service Worker:</strong>
                      <div className="text-[11px] text-neutral-400">
                        Pre-caches UI bundles so the app loads instantly even on poor 2G/3G connectivity in transit.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>ChefPulse Android Package Ready • <strong>chefpulse.apk</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownloadApk('standard')}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-amber-500/20"
            >
              <span>⬇️</span> Download APK
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
