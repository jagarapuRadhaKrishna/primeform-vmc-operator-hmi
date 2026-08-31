import React from 'react';
import { CheckCircle2, ShieldAlert, Wrench, Layers, Eye, PlayCircle } from 'lucide-react';

const STAGES = [
  { id: 'MACHINE_CHECKS', step: '01', title: 'MACHINE CHECKS', shortTitle: 'CHECKS', icon: ShieldAlert },
  { id: 'TOOLS', step: '02', title: 'REQUIRED TOOLS', shortTitle: 'TOOLS', icon: Wrench },
  { id: 'WORKPIECE', step: '03', title: 'WORKPIECE SETUP', shortTitle: 'WORKPIECE', icon: Layers },
  { id: 'READY', step: '04', title: 'READY REVIEW', shortTitle: 'READY', icon: Eye },
  { id: 'OPERATION', step: '05', title: 'OPERATION', shortTitle: 'OPERATION', icon: PlayCircle },
];

export function StageProgress({ currentStage, progress, onSelectStage }) {
  const getStageStatus = (stageId) => {
    if (stageId === currentStage) return 'ACTIVE';
    if (stageId === 'MACHINE_CHECKS' && progress?.checks?.complete) return 'COMPLETED';
    if (stageId === 'TOOLS' && progress?.tools?.complete) return 'COMPLETED';
    if (stageId === 'WORKPIECE' && progress?.workpiece?.complete) return 'COMPLETED';
    if (stageId === 'READY' && progress?.isReady) return 'COMPLETED';
    if (stageId === 'OPERATION' && progress?.isReady) return 'READY_TO_RUN';
    return 'LOCKED';
  };

  const isStageClickable = (stageId) => {
    if (stageId === currentStage) return false;
    // Stage 1 is always accessible
    if (stageId === 'MACHINE_CHECKS') return true;
    // Stage 2 is accessible if checks complete
    if (stageId === 'TOOLS' && (progress?.checks?.complete || currentStage !== 'MACHINE_CHECKS')) return true;
    // Stage 3 is accessible if checks and tools complete
    if (stageId === 'WORKPIECE' && (progress?.tools?.complete || currentStage === 'READY' || currentStage === 'OPERATION')) return true;
    // Stage 4 is accessible if all setup is complete
    if (stageId === 'READY' && progress?.isReady) return true;
    // Stage 5 is accessible if ready
    if (stageId === 'OPERATION' && progress?.isReady) return true;
    return false;
  };

  return (
    <nav aria-label="Progress" className="hmi-workflow">
      <div className="hmi-container">
        <div className="hmi-workflow__steps">
          {STAGES.map((s) => {
            const status = getStageStatus(s.id);
            const isActive = s.id === currentStage;
            const isCompleted = status === 'COMPLETED';
            const clickable = isStageClickable(s.id);

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => clickable && onSelectStage && onSelectStage(s.id)}
                disabled={!clickable && !isActive}
                title={clickable ? `Go to ${s.title}` : isActive ? `Current: ${s.title}` : `Complete previous steps to unlock`}
                className={`hmi-workflow__step flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-lg border text-left transition-all duration-150 relative min-w-0 ${
                  isActive
                    ? 'bg-[#15233c] border-cyan-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400 cursor-default'
                    : clickable
                      ? 'bg-[#0f1d2b] border-emerald-600/50 text-emerald-300 hover:bg-[#15273b] hover:border-cyan-400/70 hover:shadow-[0_0_8px_rgba(56,189,248,0.2)] cursor-pointer'
                      : isCompleted
                        ? 'bg-[#0f1d2b] border-emerald-600/50 text-emerald-300 cursor-pointer'
                        : 'bg-[#090f1c] border-[#162035] text-slate-600 opacity-60 cursor-not-allowed'
                }`}
              >
                {/* Step badge / checkmark */}
                <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-[#162035] text-slate-400'
                }`}>
                  {isCompleted && !isActive ? (
                    <CheckCircle2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-emerald-400" />
                  ) : (
                    <span>{s.step}</span>
                  )}
                </div>

                {/* Stage Title */}
                <div className="min-w-0 flex-1 truncate">
                  <div className="text-[9px] font-mono tracking-wider text-slate-400 uppercase hidden md:block leading-none mb-0.5">
                    STAGE {s.step}
                  </div>
                  <div className={`font-mono font-bold tracking-tight truncate text-xs sm:text-xs md:text-sm ${
                    isActive ? 'text-cyan-300' : isCompleted ? 'text-emerald-300' : 'text-slate-300'
                  }`}>
                    <span className="hidden sm:inline">{s.title}</span>
                    <span className="inline sm:hidden">{s.shortTitle}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
