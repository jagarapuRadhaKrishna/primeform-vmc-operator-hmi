import React, { useState, useEffect } from 'react';
import { Check, ArrowRight, Wrench } from 'lucide-react';

export function Stage2RequiredTools({ tools, onConfirmTool, onNextStage, loading }) {
  const firstUnconfirmedIndex = tools.findIndex(t => t.confirmed === 0);
  const [activeIndex, setActiveIndex] = useState(
    firstUnconfirmedIndex !== -1 ? firstUnconfirmedIndex : 0
  );

  useEffect(() => {
    const nextUnconfirmed = tools.findIndex(t => t.confirmed === 0);
    if (nextUnconfirmed !== -1 && tools[activeIndex]?.confirmed === 1) {
      setActiveIndex(nextUnconfirmed);
    }
  }, [tools]);

  const activeTool = tools[activeIndex] || tools[0];
  const confirmedCount = tools.filter(t => t.confirmed === 1).length;
  const totalCount = tools.length || 4;
  const allComplete = confirmedCount === totalCount;
  const isCurrentConfirmed = activeTool?.confirmed === 1;

  const handleConfirm = async () => {
    if (!activeTool || isCurrentConfirmed || loading) return;
    await onConfirmTool(activeTool.id);

    const nextIdx = tools.findIndex((t, idx) => idx > activeIndex && t.confirmed === 0);
    if (nextIdx !== -1) {
      setActiveIndex(nextIdx);
    }
  };

  return (
    <div className="stage-screen animate-fade-in">
      {/* 1. Stage Title Area */}
      <div className="stage-heading">
        <div className="inline-flex items-center gap-2 bg-[#121c2e] border border-cyan-500/30 text-cyan-400 font-mono text-[11px] px-3 py-1 rounded-full font-bold tracking-widest uppercase mb-1.5">
          2 / 5 — REQUIRED TOOLS
        </div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight font-mono leading-tight">
          TOOL MAGAZINE & OFFSET VERIFICATION
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl mx-auto leading-normal">
          Ensure correct tool assembly, holder geometry, and tool number alignment.
        </p>
      </div>

      {/* 2. Main Tool Card */}
      <div className="stage-card-wrap">
        <div className="hmi-card instruction-card p-5 sm:p-6 relative transition-all duration-200">
          {/* Top colored accent line */}
          <div className={`absolute top-0 left-0 right-0 h-1 ${
            isCurrentConfirmed ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-cyan-500 shadow-[0_0_10px_#06b6d4]'
          }`} />

          {/* Card Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-4 border-b border-[#1b2b48]">
            <div className="flex items-center gap-2">
              <span className="bg-[#162238] text-cyan-300 font-mono text-xs font-bold px-2.5 py-1 rounded-md border border-[#233555]">
                TOOL {activeTool?.sequence || 1} OF {totalCount}
              </span>
              <span className="text-slate-400 font-mono text-xs font-semibold">
                STATION #{activeTool?.tool_number}
              </span>
            </div>

            <div className={`flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full border ${
              isCurrentConfirmed
                ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-400'
                : 'bg-cyan-950/80 border-cyan-500/60 text-cyan-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isCurrentConfirmed ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]' : 'bg-cyan-400'}`} />
              <span className="font-bold">{isCurrentConfirmed ? '✓ LOADED & CONFIRMED' : 'AWAITING VERIFICATION'}</span>
            </div>
          </div>

          {/* Tool Details Body */}
          <div className="py-4 flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
            {/* Tool Station Badge */}
            <div className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center border font-mono shrink-0 ${
              isCurrentConfirmed 
                ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]' 
                : 'bg-[#152136] border-cyan-500/40 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
            }`}>
              <Wrench className="w-5 h-5 mb-0.5" />
              <span className="text-lg font-bold tracking-wider">{activeTool?.tool_number}</span>
            </div>

            {/* Specs */}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide font-mono leading-snug">
                {activeTool?.tool_name}
              </h2>
              <p className="text-cyan-400 text-xs font-mono mt-0.5 font-semibold">
                {activeTool?.tool_type}
              </p>

              {/* Program Details Table */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                <div className="bg-[#090f1c] border border-[#1b2a47] rounded-lg p-2 font-mono text-xs">
                  <span className="text-slate-400 block text-[9px] uppercase font-semibold">PROGRAM</span>
                  <span className="text-white font-bold">{activeTool?.program || 'O1024'}</span>
                </div>

                <div className="bg-[#090f1c] border border-[#1b2a47] rounded-lg p-2 font-mono text-xs">
                  <span className="text-slate-400 block text-[9px] uppercase font-semibold">REVISION</span>
                  <span className="text-cyan-300 font-bold">{activeTool?.program_revision || 'Rev 03'}</span>
                </div>

                <div className="bg-[#090f1c] border border-[#1b2a47] rounded-lg p-2 font-mono text-xs col-span-2 sm:col-span-1">
                  <span className="text-slate-400 block text-[9px] uppercase font-semibold">TOOL HOLDER</span>
                  <span className="text-slate-200 font-bold">{activeTool?.holder || 'BT40-ER32'}</span>
                </div>

                <div className="bg-[#090f1c] border border-[#1b2a47] rounded-lg p-2 font-mono text-xs">
                  <span className="text-slate-400 block text-[9px] uppercase font-semibold">SPINDLE SPEED</span>
                  <span className="text-amber-300 font-bold">{activeTool?.spindle_speed || '8000 RPM'}</span>
                </div>

                <div className="bg-[#090f1c] border border-[#1b2a47] rounded-lg p-2 font-mono text-xs">
                  <span className="text-slate-400 block text-[9px] uppercase font-semibold">FEED RATE</span>
                  <span className="text-amber-300 font-bold">{activeTool?.feed_rate || '1200 mm/min'}</span>
                </div>

                <div className="bg-[#090f1c] border border-[#1b2a47] rounded-lg p-2 font-mono text-xs col-span-2 sm:col-span-1">
                  <span className="text-slate-400 block text-[9px] uppercase font-semibold">DIAMETER</span>
                  <span className="text-emerald-400 font-bold">{activeTool?.diameter}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button: CONFIRM TOOL */}
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
                  VERIFYING TOOL...
                </span>
              ) : isCurrentConfirmed ? (
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  {activeTool?.tool_number} CONFIRMED
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  CONFIRM TOOL ({activeTool?.tool_number})
                </span>
              )}
            </button>
          </div>

          {/* Tool Carousel Selectors */}
          <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-[#162238]">
            {tools.map((t, idx) => {
              const isDone = t.confirmed === 1;
              const isSelected = idx === activeIndex;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`py-1.5 px-2 rounded-lg font-mono text-xs font-bold transition-all flex flex-col items-center justify-center border gap-0.5 cursor-pointer ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950 text-cyan-300 ring-1 ring-cyan-500 shadow-sm'
                      : isDone
                        ? 'border-emerald-700/60 bg-emerald-950/60 text-emerald-400 hover:bg-emerald-900/60'
                        : 'border-[#1e2d4a] bg-[#101726] text-slate-400 hover:bg-[#162136]'
                  }`}
                >
                  <span className="text-xs font-bold">{t.tool_number}</span>
                  <span className="text-[9px] text-slate-400">{isDone ? '✓ DONE' : t.diameter}</span>
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
            <span className={`w-2.5 h-2.5 rounded-full ${allComplete ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-cyan-400'}`} />
            <span className="font-mono text-xs sm:text-sm font-bold tracking-wider text-slate-200">
              {confirmedCount} / {totalCount} TOOLS CONFIRMED
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
