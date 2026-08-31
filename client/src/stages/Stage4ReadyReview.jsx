import React from 'react';
import { CheckCircle2, ShieldCheck, Wrench, Layers, ArrowRight } from 'lucide-react';

export function Stage4ReadyReview({ checks, tools, workpiece, onProceed, loading }) {
  const allChecksDone = checks.every(c => c.confirmed === 1);
  const allToolsDone = tools.every(t => t.confirmed === 1);
  const allWorkpieceDone = workpiece.every(w => w.confirmed === 1);
  const isSystemReady = allChecksDone && allToolsDone && allWorkpieceDone;

  return (
    <div className="stage-screen animate-fade-in">
      {/* 1. Stage Title Area */}
      <div className="stage-heading">
        <div className="inline-flex items-center gap-2 bg-[#121c2e] border border-emerald-500/40 text-emerald-400 font-mono text-[11px] px-3 py-1 rounded-full font-bold tracking-widest uppercase mb-1.5">
          4 / 5 — READY REVIEW
        </div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight font-mono leading-tight">
          PRE-OPERATION READINESS VERIFICATION
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl mx-auto leading-normal">
          Verify all machine conditions, loaded tools, and workpiece datums before operation.
        </p>
      </div>

      {/* 2. 3 Clean Summary Columns Grid - Content Driven & Properly Padded */}
      <div className="w-full max-w-4xl px-2 grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-3.5">
        {/* Box 1: MACHINE CHECKS */}
        <div className="hmi-card p-4 sm:p-5 flex flex-col justify-start">
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#1b2b48]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <h3 className="font-mono font-bold text-white text-xs sm:text-sm">MACHINE</h3>
            </div>
            <span className="font-mono text-[11px] font-bold text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-500/30">
              {checks.filter(c => c.confirmed === 1).length} / {checks.length}
            </span>
          </div>

          <ul className="space-y-2">
            {checks.map(c => (
              <li key={c.id} className="flex items-center gap-2 text-xs font-mono">
                {c.confirmed === 1 ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-600 shrink-0" />
                )}
                <span className={`truncate ${c.confirmed === 1 ? 'text-slate-200 font-medium' : 'text-slate-500'}`}>
                  {c.title}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Box 2: TOOLS */}
        <div className="hmi-card p-4 sm:p-5 flex flex-col justify-start">
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#1b2b48]">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-cyan-400 shrink-0" />
              <h3 className="font-mono font-bold text-white text-xs sm:text-sm">TOOLS</h3>
            </div>
            <span className="font-mono text-[11px] font-bold text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-500/30">
              {tools.filter(t => t.confirmed === 1).length} / {tools.length}
            </span>
          </div>

          <ul className="space-y-2">
            {tools.map(t => (
              <li key={t.id} className="flex items-start gap-2 text-xs font-mono">
                {t.confirmed === 1 ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-600 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0 leading-tight">
                  <div className="text-slate-200 font-bold flex items-center gap-1.5">
                    <span className="text-cyan-400">{t.tool_number}</span>
                    <span className="truncate">{t.tool_name}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {t.holder} • {t.spindle_speed}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Box 3: WORKPIECE */}
        <div className="hmi-card p-4 sm:p-5 flex flex-col justify-start">
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#1b2b48]">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400 shrink-0" />
              <h3 className="font-mono font-bold text-white text-xs sm:text-sm">WORKPIECE</h3>
            </div>
            <span className="font-mono text-[11px] font-bold text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-500/30">
              {workpiece.filter(w => w.confirmed === 1).length} / {workpiece.length}
            </span>
          </div>

          <ul className="space-y-2">
            {workpiece.map(w => (
              <li key={w.id} className="flex items-center gap-2 text-xs font-mono">
                {w.confirmed === 1 ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-600 shrink-0" />
                )}
                <span className={`truncate ${w.confirmed === 1 ? 'text-slate-200 font-medium' : 'text-slate-500'}`}>
                  {w.title}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 3. Sleek Prominent READY Banner */}
      <div className="w-full max-w-4xl px-2">
        <div className="bg-gradient-to-b from-[#0a2318] to-[#0c1822] border-2 border-emerald-500 rounded-xl p-4 sm:p-5 text-center shadow-[0_0_20px_rgba(16,185,129,0.2)] relative">
          <div className="inline-flex items-center justify-center gap-2.5 mb-1.5">
            <span className="led-indicator led-green led-pulse w-3.5 h-3.5" />
            <h2 className="text-2xl sm:text-3xl font-black text-emerald-400 font-display tracking-widest uppercase">
              READY
            </h2>
          </div>
          <p className="text-emerald-200/90 text-xs font-mono font-medium max-w-lg mx-auto leading-normal">
            ALL 6 CHECKS, 4 TOOLS & WORKPIECE FIXTURE DATUMS CONFIRMED. READY FOR AUTOMATIC CYCLE START.
          </p>

          <div className="mt-3.5">
            <button
              onClick={onProceed}
              disabled={!isSystemReady || loading}
              className="w-full hmi-btn hmi-btn-primary h-11 sm:h-12 text-sm font-mono font-bold tracking-wider rounded-lg shadow-md flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <span>PROCEED TO OPERATION</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
