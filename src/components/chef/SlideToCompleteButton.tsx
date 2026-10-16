import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle2, ChevronRight, Lock, Sparkles } from 'lucide-react';

interface SlideToCompleteButtonProps {
  onComplete: () => void;
  payoutAmount: number;
  label?: string;
  disabled?: boolean;
}

export const SlideToCompleteButton: React.FC<SlideToCompleteButtonProps> = ({
  onComplete,
  payoutAmount,
  label = 'Slide to Complete Shift & Release Escrow',
  disabled = false,
}) => {
  const [sliderPosition, setSliderPosition] = useState(0); // 0 to 100%
  const [isCompleted, setIsCompleted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const handleTouchStart = () => {
    if (disabled || isCompleted) return;
    isDraggingRef.current = true;
  };

  const handleTouchMove = (clientX: number) => {
    if (!isDraggingRef.current || !containerRef.current || disabled || isCompleted) return;
    const rect = containerRef.current.getBoundingClientRect();
    const handleWidth = 56;
    const maxDrag = rect.width - handleWidth;
    const currentX = clientX - rect.left - handleWidth / 2;
    const clampedX = Math.max(0, Math.min(maxDrag, currentX));
    const percent = (clampedX / maxDrag) * 100;
    setSliderPosition(percent);

    if (percent >= 88) {
      // Trigger Completion!
      isDraggingRef.current = false;
      setIsCompleted(true);
      setSliderPosition(100);
      onComplete();
    }
  };

  const handleTouchEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (sliderPosition < 88) {
      // Snap back if not reached threshold
      setSliderPosition(0);
    }
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      handleTouchMove(e.clientX);
    };
    const onMouseUp = () => {
      handleTouchEnd();
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [sliderPosition]);

  return (
    <div className="w-full select-none">
      <div
        ref={containerRef}
        className={`relative h-16 w-full rounded-2xl overflow-hidden border transition-all ${
          isCompleted
            ? 'bg-emerald-600 border-emerald-400 shadow-xl shadow-emerald-950/60'
            : 'bg-neutral-950 border-neutral-800 shadow-inner'
        }`}
      >
        {/* Animated Background Progress Fill */}
        <div
          className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-emerald-600/80 to-emerald-500 transition-all duration-75"
          style={{ width: `${Math.max(sliderPosition, isCompleted ? 100 : 0)}%` }}
        />

        {/* Center Prompt Text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-14 text-center">
          {isCompleted ? (
            <div className="flex items-center gap-2 text-white font-black text-sm uppercase tracking-wider animate-in zoom-in-95">
              <CheckCircle2 size={18} />
              <span>Shift Fulfilled • ₹{payoutAmount} Released to Wallet!</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-neutral-300 font-extrabold text-xs uppercase tracking-wider">
              <span>{label}</span>
              <span className="text-amber-400 font-bold font-mono">₹{payoutAmount}</span>
            </div>
          )}
        </div>

        {/* Shimmer arrow indicators */}
        {!isCompleted && sliderPosition < 40 && (
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-neutral-500 text-xs animate-pulse pointer-events-none">
            <ChevronRight size={14} />
            <ChevronRight size={14} className="-ml-1" />
            <ChevronRight size={14} className="-ml-1" />
          </div>
        )}

        {/* Draggable Slider Handle */}
        {!isCompleted ? (
          <div
            onMouseDown={handleTouchStart}
            onTouchStart={handleTouchStart}
            onTouchMove={(e) => handleTouchMove(e.touches[0].clientX)}
            onTouchEnd={handleTouchEnd}
            style={{
              transform: `translateX(${
                containerRef.current
                  ? (sliderPosition / 100) * (containerRef.current.clientWidth - 56)
                  : 0
              }px)`,
            }}
            className="absolute left-1 top-1 bottom-1 w-14 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-500/30 flex items-center justify-center cursor-grab active:cursor-grabbing z-10 transition-transform duration-75"
          >
            <ChevronRight size={24} className="text-neutral-950 font-black animate-pulse" />
          </div>
        ) : (
          <div className="absolute right-2 top-1 bottom-1 w-14 rounded-xl bg-white/20 flex items-center justify-center text-white">
            <Sparkles size={20} className="animate-spin" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-2 px-1">
        <span className="flex items-center gap-1">
          <Lock size={11} className="text-emerald-400" />
          <span>Chef Pulse Escrow Smart Guarantee</span>
        </span>
        <span className="text-emerald-400 font-mono font-bold">
          Instant UPI Credit
        </span>
      </div>
    </div>
  );
};
