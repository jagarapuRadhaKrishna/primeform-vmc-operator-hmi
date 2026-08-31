import React, { useState, useEffect } from 'react';
import { Check, ArrowRight, Zap, AlertOctagon, DoorClosed, BellOff, Droplets, Compass, ShieldCheck } from 'lucide-react';

const CHECK_ICONS = {
  1: Zap,
  2: AlertOctagon,
  3: DoorClosed,
  4: BellOff,
  5: Droplets,
  6: Compass,
};

export function Stage1MachineChecks({ checks, onConfirmCheck, onNextStage, loading }) {
  const firstUnconfirmedIndex = checks.findIndex(c => c.confirmed === 0);
  const [activeIndex, setActiveIndex] = useState(
    firstUnconfirmedIndex !== -1 ? firstUnconfirmedIndex : 0
  );

  useEffect(() => {
    const nextUnconfirmed = checks.findIndex(c => c.confirmed === 0);
    if (nextUnconfirmed !== -1) {
      setActiveIndex(nextUnconfirmed);
    }
  }, [checks]);

  const activeCheck = checks[activeIndex] || checks[0];
  const confirmedCount = checks.filter(c => c.confirmed === 1).length;
  const totalCount = checks.length || 6;
  const allComplete = confirmedCount === totalCount;
  const isCurrentConfirmed = activeCheck?.confirmed === 1;

  const IconComponent = CHECK_ICONS[activeCheck?.sequence] || ShieldCheck;

  const handleConfirm = async () => {
    if (!activeCheck || isCurrentConfirmed || loading) return;
    await onConfirmCheck(activeCheck.id);
    
    const nextIdx = checks.findIndex((c, idx) => idx > activeIndex && c.confirmed === 0);
    if (nextIdx !== -1) {
      setActiveIndex(nextIdx);
    }
  };

  return (
    <div className="stage-screen animate-fade-in">
      {/* 1. Stage Title Area */}
      <div className="stage-heading">
        <div className="inline-flex items-center gap-2 bg-[#121c2e] border border-cyan-500/30 text-cyan-400 font-mono text-[11px] px-3 py-1 rounded-full font-bold tracking-widest uppercase mb-1.5">
          1 / 5 — MACHINE CHECKS
        </div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight font-mono leading-tight">
          SAFETY & SUBSYSTEM VERIFICATION
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl mx-auto leading-normal">
          Verify and confirm each machine hardware condition before loading tooling and workpiece.
        </p>
      </div>

      {/* 2. Main Instruction Card */}
      <div className="stage-card-wrap">
        <div className="hmi-card instruction-card p-5 sm:p-6 relative transition-all duration-200">
          {/* Top colored accent line */}
          <div className={`absolute top-0 left-0 right-0 h-1 ${
            isCurrentConfirmed ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-amber-500 shadow-[0_0_10px_#f59e0b]'
          }`} />

          {/* Card Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-4 border-b border-[#1b2b48]">
            <div className="flex items-center gap-2">
              <span className="bg-[#162238] text-cyan-300 font-mono text-xs font-bold px-2.5 py-1 rounded-md border border-[#233555]">
                CHECK {activeCheck?.sequence || 1} OF {totalCount}
              </span>
              <span className="text-slate-400 font-mono text-xs font-semibold">
                {activeCheck?.code || 'CHK-01'}
              </span>
            </div>

            <div className={`flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full border ${
              isCurrentConfirmed
                ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-400'
                : 'bg-amber-950/80 border-amber-500/60 text-amber-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isCurrentConfirmed ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]' : 'bg-amber-400'}`} />
              <span className="font-bold">{isCurrentConfirmed ? '✓ CONFIRMED' : 'PENDING CONFIRMATION'}</span>
            </div>
          </div>

          {/* Main Instruction Body */}
          <div className="py-4 flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
            {/* Icon Container */}
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center border shrink-0 ${
              isCurrentConfirmed 
                ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]' 
                : 'bg-[#152136] border-cyan-500/40 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
            }`}>
              <IconComponent className="w-7 h-7" />
            </div>

            {/* Content Details */}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide font-mono leading-snug">
                {activeCheck?.title}
              </h2>

              {activeCheck?.subtitle && (
                <p className="text-cyan-400 text-xs font-mono mt-0.5 font-semibold">
                  {activeCheck.subtitle}
                </p>
              )}

              <p className="text-slate-200 text-xs sm:text-sm mt-2 leading-relaxed max-w-[700px]">
                {activeCheck?.description}
              </p>

              {/* Diagnostic Box */}
              {activeCheck?.details && (
                <div className="mt-3 bg-[#090f1c] border border-[#1b2a47] rounded-lg p-2.5 text-xs font-mono">
                  <span className="text-slate-400 font-bold mr-1.5 uppercase">DIAGNOSTIC:</span>
                  <span className="text-slate-300 leading-normal">{activeCheck.details}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Button: CONFIRM CHECK */}
          <div className="pt-4 border-t border-[#1b2b48]">
            <button
              onClick={handleConfirm}
              disabled={isCurrentConfirmed || loading}
              className={`w-full hmi-btn text-sm font-mono font-bold tracking-wider rounded-lg transition-all ${
                isCurrentConfirmed
                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-600/50 cursor-default opacity-90'
                  : 'hmi-btn-primary'
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  RECORDING CONFIRMATION...
                </span>
              ) : isCurrentConfirmed ? (
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  CHECK CONFIRMED
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  ✓ CONFIRM CHECK
                </span>
              )}
            </button>
          </div>

          {/* 6-Step Navigator Dots */}
          <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t border-[#162238]">
            {checks.map((c, idx) => {
              const isDone = c.confirmed === 1;
              const isSelected = idx === activeIndex;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`w-8 h-8 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center border cursor-pointer ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950 text-cyan-300 ring-1 ring-cyan-500 shadow-sm'
                      : isDone
                        ? 'border-emerald-700/60 bg-emerald-950/60 text-emerald-400 hover:bg-emerald-900/60'
                        : 'border-[#1e2d4a] bg-[#101726] text-slate-400 hover:bg-[#162136]'
                  }`}
                  title={`Check ${c.sequence}: ${c.title}`}
                >
                  {isDone ? '✓' : c.sequence}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Bottom Action Bar */}
      <div className="stage-action-wrap">
        <div className="hmi-action-bar">
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full ${allComplete ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-amber-400'}`} />
            <span className="font-mono text-xs sm:text-sm font-bold tracking-wider text-slate-200">
              {confirmedCount} / {totalCount} CHECKS COMPLETE
            </span>
          </div>

          <button
            onClick={onNextStage}
            disabled={!allComplete || loading}
            className={`hmi-btn min-w-[120px] font-mono font-bold tracking-wider rounded-lg flex items-center justify-center gap-2 ${
              allComplete
                ? 'hmi-btn-next'
                : 'bg-[#151f33] text-slate-600 border border-[#223554] cursor-not-allowed opacity-40'
            }`}
          >
            <span>NEXT</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
