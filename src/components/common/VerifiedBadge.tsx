import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, Clock, ExternalLink } from 'lucide-react';
import { ChefVerificationReport, VerificationStatus } from '../../types';

interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
  status?: VerificationStatus;
  report?: ChefVerificationReport;
  onOpenReportModal?: () => void;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  size = 'md',
  showLabel = true,
  className = '',
  status = 'unverified',
  report,
  onOpenReportModal,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2 py-0.5 gap-1.5',
    lg: 'text-xs px-2.5 py-1 gap-1.5',
  };

  const iconSizes = {
    sm: 11,
    md: 13,
    lg: 15,
  };

  // Status-dependent configuration for dynamic styling
  const statusConfig = {
    verified: {
      badgeBg: 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400',
      label: 'Verified',
      tooltipTag: 'Passed',
      tagBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
      icon: ShieldCheck,
      iconColor: 'text-emerald-400',
      iconContainerBg: 'bg-emerald-500/20 text-emerald-400',
      title: 'Background Checked & Gov-Verified',
      description: 'Passed official Karnataka Police CCTNS criminal check, UIDAI Aadhaar biometric KYC, FSSAI FoSCoS safety registration & NABL microbial kitchen hygiene inspection.',
      footerA: '🛡️ Police Vetted (CCTNS)',
      footerB: '🧼 FSSAI Hygiene Clear',
    },
    pending: {
      badgeBg: 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/30 hover:border-amber-500/50 text-amber-400',
      label: 'In Review',
      tooltipTag: 'Audit Pending',
      tagBg: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
      icon: Clock,
      iconColor: 'text-amber-400',
      iconContainerBg: 'bg-amber-500/20 text-amber-400',
      title: 'Background Verification in Progress',
      description: 'Government background database checks are currently syncing with Bangalore Police and FoSCoS records.',
      footerA: '⏳ Aadhaar Match Complete',
      footerB: '🔍 Police Record Syncing',
    },
    flagged: {
      badgeBg: 'bg-rose-500/15 hover:bg-rose-500/25 border-rose-500/30 hover:border-rose-500/50 text-rose-400',
      label: 'Audit Flagged',
      tooltipTag: 'Needs Review',
      tagBg: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
      icon: ShieldAlert,
      iconColor: 'text-rose-400',
      iconContainerBg: 'bg-rose-500/20 text-rose-400',
      title: 'Discrepancy Detected',
      description: 'A temporary anomaly was flagged during Karnataka Police CCTNS record verification or FSSAI license compliance review.',
      footerA: '⚠️ Manual Audit Required',
      footerB: '📋 Bureau Investigation',
    },
    rejected: {
      badgeBg: 'bg-red-600/15 hover:bg-red-600/25 border-red-600/30 hover:border-red-600/50 text-red-400',
      label: 'Unverified',
      tooltipTag: 'Failed',
      tagBg: 'bg-red-500/15 text-red-400 border border-red-500/30',
      icon: ShieldX,
      iconColor: 'text-red-400',
      iconContainerBg: 'bg-red-500/20 text-red-400',
      title: 'Verification Failed',
      description: 'Failed mandatory government identity or hygiene check. Not cleared for active home dispatch.',
      footerA: '❌ CCTNS Rejected',
      footerB: '❌ Revoked Privileges',
    },
    unverified: {
      badgeBg: 'bg-neutral-800/80 hover:bg-neutral-700 border-neutral-700 text-neutral-400',
      label: 'Unverified',
      tooltipTag: 'New Chef',
      tagBg: 'bg-neutral-800 text-neutral-300 border border-neutral-700',
      icon: Clock,
      iconColor: 'text-neutral-400',
      iconContainerBg: 'bg-neutral-800 text-neutral-400',
      title: 'Verification Not Initiated',
      description: 'Chef has not yet submitted digital credentials for government-level background screening.',
      footerA: '📄 Documents Awaited',
      footerB: '⏳ Not Yet Dispatched',
    },
  };

  const config = statusConfig[status] || statusConfig.verified;
  const IconComponent = config.icon;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenReportModal) {
      onOpenReportModal();
    } else {
      setIsHovered(!isHovered);
    }
  };

  return (
    <div
      className={`relative inline-flex items-center group/tooltip ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Visible Verified Badge */}
      <span
        tabIndex={0}
        role="button"
        aria-label={`Chef Status: ${config.label} - ${config.title}`}
        className={`inline-flex items-center font-bold rounded-full border transition-all cursor-pointer shadow-xs ${config.badgeBg} ${sizeClasses[size]}`}
      >
        <IconComponent size={iconSizes[size]} className={`${config.iconColor} shrink-0`} strokeWidth={2.5} />
        {showLabel && <span className="tracking-tight">{config.label}</span>}
      </span>

      {/* Styled Interactive Tooltip */}
      <div
        className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-neutral-900/98 backdrop-blur-md border border-neutral-700 rounded-xl shadow-2xl text-neutral-100 z-[1200] transition-all duration-200 ${
          isHovered
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
            : 'opacity-0 translate-y-1 scale-95 pointer-events-none'
        }`}
      >
        {/* Tooltip Arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-neutral-900 border-b-0" />

        <div className="flex items-start gap-2.5">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${config.iconContainerBg}`}>
            <IconComponent size={13} strokeWidth={3} />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-xs font-bold text-white flex items-center justify-between gap-1.5">
              <span className="truncate">{config.title}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${config.tagBg}`}>
                {config.tooltipTag}
              </span>
            </div>
            <p className="text-[11px] text-neutral-300 mt-1 leading-snug">
              {config.description}
            </p>

            {report && (
              <div className="mt-2 py-1 px-2 rounded-lg bg-neutral-950/80 border border-neutral-800 text-[10px] space-y-0.5 font-mono text-neutral-300">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Gov Score:</span>
                  <span className={`font-bold ${report.overallScore >= 90 ? 'text-emerald-400' : report.overallScore >= 70 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {report.overallScore}/100
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Dossier:</span>
                  <span className="text-neutral-200">{report.dossierNumber}</span>
                </div>
              </div>
            )}

            <div className="mt-2 pt-1.5 border-t border-neutral-800 flex items-center justify-between text-[10px] text-neutral-400 font-medium">
              <span>{config.footerA}</span>
              <span>{config.footerB}</span>
            </div>

            {onOpenReportModal && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenReportModal();
                }}
                className="mt-2 w-full py-1 px-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-[10px] text-amber-300 font-bold flex items-center justify-center gap-1 transition-all"
              >
                <span>View Full Government Audit Report</span>
                <ExternalLink size={10} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
