import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { AndroidTestingModal } from './AndroidTestingModal';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'header' | 'floating' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, isAndroid, install } = usePWAInstall();
  const [showAndroidModal, setShowAndroidModal] = useState(false);

  // If already running inside standalone app, show small badge or hide
  if (isInstalled && variant === 'floating') {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (!success) {
        // If dismissed or on desktop trying to test for Android, show modal with QR code
        setShowAndroidModal(true);
      }
    } else {
      setShowAndroidModal(true);
    }
  };

  if (variant === 'header') {
    return (
      <>
        <button
          onClick={handleClick}
          className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
            isInstalled
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
              : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 shadow-amber-500/20 active:scale-95'
          } ${className}`}
          title="Install and test ChefPulse on Android Phone"
        >
          <span className="text-sm">🤖</span>
          <span className="hidden sm:inline">
            {isInstalled ? 'Android App Active' : 'Download APK'}
          </span>
          <span className="sm:hidden">
            {isInstalled ? 'App' : 'APK'}
          </span>
          {!isInstalled && (
            <span className="px-1.5 py-0.2 rounded-md bg-neutral-950/20 text-[10px] font-extrabold uppercase tracking-wider">
              APK
            </span>
          )}
        </button>

        <AndroidTestingModal
          isOpen={showAndroidModal}
          onClose={() => setShowAndroidModal(false)}
        />
      </>
    );
  }

  if (variant === 'floating') {
    return (
      <>
        <div className="fixed bottom-20 right-4 z-40 sm:bottom-6 sm:right-6 animate-in slide-in-from-bottom duration-300">
          <button
            onClick={handleClick}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950 border border-amber-500/40 text-white font-bold text-xs shadow-2xl hover:border-amber-400 hover:shadow-amber-500/20 active:scale-95 transition"
            title="Download Android APK directly"
          >
            <div className="w-7 h-7 rounded-xl bg-amber-500 flex items-center justify-center text-neutral-950 text-base font-black shadow-md">
              📦
            </div>
            <div className="text-left">
              <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Direct Download</div>
              <div className="text-xs font-bold text-white">Android APK (506 KB)</div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-1" />
          </button>
        </div>

        <AndroidTestingModal
          isOpen={showAndroidModal}
          onClose={() => setShowAndroidModal(false)}
        />
      </>
    );
  }

  // Banner variant
  return (
    <>
      <div className="p-3 bg-gradient-to-r from-amber-500/15 via-amber-600/10 to-transparent border-y border-amber-500/20 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-neutral-200">
          <span className="text-xl">📦</span>
          <span>
            <strong className="text-amber-400 font-semibold">Testing on Android?</strong> Download the standalone <code className="text-amber-300 font-mono bg-neutral-900 px-1 py-0.5 rounded border border-neutral-800">chefpulse.apk</code> (506 KB) or scan the QR code to install.
          </span>
        </div>
        <button
          onClick={handleClick}
          className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shrink-0 transition flex items-center gap-1.5 shadow-md shadow-amber-500/20"
        >
          <span>⬇️</span> Download APK
        </button>
      </div>

      <AndroidTestingModal
        isOpen={showAndroidModal}
        onClose={() => setShowAndroidModal(false)}
      />
    </>
  );
};
