import React, { useState, useRef } from 'react';
import { Camera, Upload, Link as LinkIcon, RefreshCw, X, Check, AlertCircle } from 'lucide-react';
import {
  PRESET_FOUNDER_PHOTOS,
  saveFounderPhoto,
  resetFounderPhoto,
  DEFAULT_FOUNDER_PHOTOS,
} from '../../utils/founderPhotos';

interface FounderPhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  founder: 'ram' | 'sateesh';
  currentPhoto: string;
  onPhotoUpdated: (newPhoto: string) => void;
}

export const FounderPhotoUploadModal: React.FC<FounderPhotoUploadModalProps> = ({
  isOpen,
  onClose,
  founder,
  currentPhoto,
  onPhotoUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets'>('upload');
  const [previewUrl, setPreviewUrl] = useState<string>(currentPhoto);
  const [inputUrl, setInputUrl] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const founderName = founder === 'ram' ? 'Ram Jagadish (Founder & CEO)' : 'Sateesh Chitturi (Co-Founder & Director)';
  const presets = PRESET_FOUNDER_PHOTOS[founder] || [];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 5MB. Please upload a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setPreviewUrl(dataUrl);
        setSuccessMsg('Photo loaded successfully! Click "Save & Apply Photo" below.');
      }
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read image file. Please try another photo.');
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!inputUrl.trim()) {
      setErrorMsg('Please enter a valid image URL.');
      return;
    }
    setPreviewUrl(inputUrl.trim());
    setSuccessMsg('URL preview updated. Click "Save & Apply Photo" to confirm.');
  };

  const handleSave = () => {
    if (!previewUrl) return;
    saveFounderPhoto(founder, previewUrl);
    onPhotoUpdated(previewUrl);
    onClose();
  };

  const handleReset = () => {
    resetFounderPhoto(founder);
    const defaultPhoto = DEFAULT_FOUNDER_PHOTOS[founder];
    setPreviewUrl(defaultPhoto);
    onPhotoUpdated(defaultPhoto);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2500] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl p-6 sm:p-7 text-neutral-100 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-neutral-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-wider mb-1">
              <Camera size={12} />
              <span>Change Profile Picture</span>
            </div>
            <h2 className="text-xl font-black text-white">{founderName}</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Upload your photo, paste a web link, or select a professional preset.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Live Preview Box */}
        <div className="mt-5 p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 flex items-center gap-4">
          <div className="relative">
            <img
              src={previewUrl}
              alt={founderName}
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-500/40 shadow-lg"
              onError={(e) => {
                // fallback if url fails
                (e.target as HTMLImageElement).src = DEFAULT_FOUNDER_PHOTOS[founder];
              }}
            />
            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded bg-amber-500 text-neutral-950 font-black text-[9px]">
              LIVE
            </span>
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-neutral-200">Active Profile Image Preview</div>
            <div className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
              Updates immediately across the About page, Founders briefing, and leadership deck.
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-5 grid grid-cols-3 gap-1 p-1 bg-neutral-950 rounded-xl border border-neutral-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'upload' ? 'bg-amber-500 text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Upload size={13} />
            <span>Upload File</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'url' ? 'bg-amber-500 text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <LinkIcon size={13} />
            <span>Image URL</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'presets' ? 'bg-amber-500 text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <RefreshCw size={13} />
            <span>Presets</span>
          </button>
        </div>

        {/* Tab 1: Direct File Upload */}
        {activeTab === 'upload' && (
          <div className="mt-4 space-y-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-neutral-700 hover:border-amber-500/60 rounded-2xl p-6 text-center cursor-pointer transition-all bg-neutral-950/40 hover:bg-neutral-950/70 group"
            >
              <div className="w-12 h-12 mx-auto rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Upload size={20} />
              </div>
              <div className="text-xs font-bold text-neutral-200">
                Click to browse photo from your device
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">
                Supports PNG, JPG, JPEG, WEBP up to 5MB
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Image URL */}
        {activeTab === 'url' && (
          <div className="mt-4 space-y-3">
            <div className="text-xs text-neutral-300">Paste direct image web address:</div>
            <div className="flex gap-2">
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs transition-colors cursor-pointer"
              >
                Preview
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Presets */}
        {activeTab === 'presets' && (
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            {presets.map((preset) => (
              <div
                key={preset.id}
                onClick={() => {
                  setPreviewUrl(preset.url);
                  setSuccessMsg(`Selected preset: ${preset.label}`);
                }}
                className={`p-2 rounded-xl border text-center cursor-pointer transition-all ${
                  previewUrl === preset.url
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'
                }`}
              >
                <img
                  src={preset.url}
                  alt={preset.label}
                  referrerPolicy="no-referrer"
                  className="w-full h-16 rounded-lg object-cover mb-1.5"
                />
                <div className="text-[10px] font-bold text-neutral-300 truncate">{preset.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Status Messages */}
        {errorMsg && (
          <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <Check size={14} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-neutral-400 hover:text-rose-400 font-bold transition-colors cursor-pointer"
          >
            Reset to Default
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            >
              Save & Apply Photo
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
