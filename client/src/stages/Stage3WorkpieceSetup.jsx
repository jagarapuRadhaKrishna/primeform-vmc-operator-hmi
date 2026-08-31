import React, { useState, useEffect } from 'react';
import { Check, ArrowRight, Crosshair, AlertCircle } from 'lucide-react';

export function Stage3WorkpieceSetup({ workpiece = [], onConfirmStep, onNextStage, loading }) {
  const isConfirmed = (w) => w && (w.confirmed === 1 || w.confirmed === true);
  
  const firstUnconfirmedIndex = workpiece.findIndex(w => !isConfirmed(w));
  const [activeIndex, setActiveIndex] = useState(
    firstUnconfirmedIndex !== -1 ? firstUnconfirmedIndex : 0
  );

  // Keep active index on the first unconfirmed step when workpiece data updates
  useEffect(() => {
    const nextUnconfirmed = workpiece.findIndex(w => !isConfirmed(w));
    if (nextUnconfirmed !== -1) {
      setActiveIndex(nextUnconfirmed);
    }
  }, [workpiece]);

  const activeStep = workpiece[activeIndex] || workpiece[0];
  const confirmedCount = workpiece.filter(isConfirmed).length;
  const totalCount = workpiece.length || 5;
  const remainingCount = totalCount - confirmedCount;
  const allComplete = confirmedCount === totalCount;
  const isCurrentConfirmed = isConfirmed(activeStep);

  const handleConfirm = async () => {
    if (!activeStep || isCurrentConfirmed || loading) return;
    await onConfirmStep(activeStep.id);
  };

  const handleNextClick = () => {
    if (!allComplete) {
      // Find which step is still pending
      const nextUnconfirmed = workpiece.findIndex(w => !isConfirmed(w));
      if (nextUnconfirmed !== -1) {
        setActiveIndex(nextUnconfirmed);
      }
      return;
    }
    onNextStage();
  };

  return (
    <div className="stage-screen animate-fade-in">
      {/* 1. Stage Title Area */}
      <div className="stage-heading">
        <div className="inline-flex items-center gap-2 bg-[#121c2e] border border-cyan-500/30 text-cyan-400 font-mono text-[11px] px-3 py-1 rounded-full font-bold tracking-widest uppercase mb-1.5">
          3 / 5 — WORKPIECE SETUP
        </div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight font-mono leading-tight">
          FIXTURE & STOCK REGISTRATION
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl mx-auto leading-normal">
          Position raw stock, lock 3-jaw fixture, and align the G54 datum coordinate.
        </p>
      </div>

      {/* 2. Main Workpiece Card */}
      <div className="stage-card-wrap">
        <div className="hmi-card instruction-card p-5 sm:p-6 relative transition-all duration-200">
          {/* Top colored accent line */}
          <div className={`absolute top-0 left-0 right-0 h-1 ${
            isCurrentConfirmed ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-amber-500 shadow-[0_0_10px_#f59e0b]'
          }`} />

          {/* Card Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3.5 border-b border-[#1b2b48]">
            <div className="flex items-center gap-2">
              <span className="bg-[#162238] text-cyan-300 font-mono text-xs font-bold px-2.5 py-1 rounded-md border border-[#233555]">
                STEP {activeStep?.step_number || activeStep?.sequence || activeIndex + 1} OF {totalCount}
              </span>
              <span className="text-slate-400 font-mono text-xs font-semibold">
                {activeStep?.highlight_datum || 'DATUM ALIGNMENT'}
              </span>
            </div>

            <div className={`flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full border ${
              isCurrentConfirmed
                ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-400'
                : 'bg-amber-950/80 border-amber-500/60 text-amber-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isCurrentConfirmed ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]' : 'bg-amber-400 animate-pulse'}`} />
              <span className="font-bold">{isCurrentConfirmed ? '✓ CONFIRMED' : 'ACTION REQUIRED'}</span>
            </div>
          </div>

          {/* Scenario Reference Specs Bar */}
          <div className="bg-[#090f1c] border border-[#1b2a47] rounded-lg p-2.5 my-3.5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[9px] uppercase font-semibold">FIXTURE</span>
              <span className="text-white font-bold">3-Jaw Fixture</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px] uppercase font-semibold">MATERIAL</span>
              <span className="text-amber-300 font-bold">Aluminium 6061</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px] uppercase font-semibold">DRAWING</span>
              <span className="text-cyan-300 font-bold">DWG-VM-1024 Rev B</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px] uppercase font-semibold">WORK OFFSET</span>
              <span className="text-emerald-400 font-bold">G54</span>
            </div>
          </div>

          {/* Active Instruction Details */}
          <div className="pb-3.5">
            <div className="flex items-center gap-2 text-cyan-400">
              <Crosshair className="w-4 h-4 shrink-0" />
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide font-mono uppercase leading-snug">
                {activeStep?.title}
              </h2>
            </div>

            <p className="text-slate-200 text-xs sm:text-sm font-medium leading-relaxed mt-1.5 max-w-[700px]">
              {activeStep?.instruction || activeStep?.description}
            </p>

            {activeStep?.details && (
              <div className="mt-2.5 bg-[#090f1c] border border-[#1b2a47] rounded-lg p-2.5 text-xs font-mono">
                <span className="text-slate-400 font-bold mr-1.5 uppercase">SETUP SPECIFICATION:</span>
                <span className="text-slate-300 leading-normal">{activeStep.details}</span>
              </div>
            )}
          </div>

          {/* Action Button: CONFIRM STEP */}
          <div className="pt-3.5 border-t border-[#1b2b48]">
            <button
              onClick={handleConfirm}
              disabled={isCurrentConfirmed || loading}
              className={`w-full hmi-btn text-sm font-mono font-bold tracking-wider rounded-lg transition-all ${
                isCurrentConfirmed
                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-600/50 cursor-default opacity-90'
                  : 'hmi-btn-primary shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  SAVING CONFIRMATION TO DATABASE...
                </span>
              ) : isCurrentConfirmed ? (
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  STEP {activeStep?.step_number || activeStep?.sequence || activeIndex + 1} CONFIRMED
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  CONFIRM STEP {activeStep?.step_number || activeStep?.sequence || activeIndex + 1} ({activeStep?.title})
                </span>
              )}
            </button>
          </div>

          {/* Step dots */}
          <div className="grid grid-cols-5 gap-2 mt-3.5 pt-3 border-t border-[#162238]">
            {workpiece.map((w, idx) => {
              const isDone = isConfirmed(w);
              const isSelected = idx === activeIndex;
              return (
                <button
                  key={w.id || idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`py-2 px-2 rounded-lg font-mono text-xs font-bold transition-all flex flex-col items-center justify-center border gap-0.5 cursor-pointer ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950 text-cyan-300 ring-1 ring-cyan-500 shadow-sm'
                      : isDone
                        ? 'border-emerald-700/60 bg-emerald-950/60 text-emerald-400 hover:bg-emerald-900/60'
                        : 'border-[#1e2d4a] bg-[#101726] text-slate-400 hover:bg-[#162136]'
                  }`}
                >
                  <span className="text-xs font-bold">{w.step_number || w.sequence || idx + 1}</span>
                  <span className="text-[9px] text-slate-400">{isDone ? '✓ DONE' : 'PENDING'}</span>
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
              {confirmedCount} / {totalCount} SETUP STEPS COMPLETE {remainingCount > 0 ? `(${remainingCount} REMAINING)` : ''}
            </span>
          </div>

          <button
            onClick={handleNextClick}
            disabled={!allComplete || loading}
            className={`hmi-btn min-w-[120px] font-mono font-bold tracking-wider rounded-lg flex items-center justify-center gap-2 ${
              allComplete
                ? 'hmi-btn-next'
                : 'bg-[#151f33] text-slate-500 border border-[#223554] cursor-not-allowed opacity-50'
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
