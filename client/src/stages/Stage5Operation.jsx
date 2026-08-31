import React, { useState, useEffect } from 'react';
import { Play, Square, RotateCcw, CheckCircle, Clock } from 'lucide-react';

export function Stage5Operation({ machineState, onStart, onStop, onPartComplete, onResetScenario, loading }) {
  const isRunning = machineState?.operation_status === 'RUNNING';
  const isStopped = machineState?.operation_status === 'STOPPED';
  const isCompleted = machineState?.operation_status === 'COMPLETED';
  const isReady = !isRunning && !isStopped && !isCompleted;

  const [partProgress, setPartProgress] = useState(15);
  const [cycleTime, setCycleTime] = useState(0);

  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        setCycleTime(prev => prev + 1);
        setPartProgress(prev => {
          if (prev >= 100) {
            onPartComplete();
            return 0;
          }
          return prev + 2.5;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, onPartComplete]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="stage-screen animate-fade-in">
      {/* 1. Stage Title Area */}
      <div className="stage-heading">
        <div className="inline-flex items-center gap-2 bg-[#121c2e] border border-cyan-500/30 text-cyan-400 font-mono text-[11px] px-3 py-1 rounded-full font-bold tracking-widest uppercase mb-1.5">
          5 / 5 — OPERATION
        </div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight font-display leading-tight">
          {machineState?.operation_title || 'Pocket Machining'}
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl mx-auto font-mono leading-normal">
          CNC Machining Program Execution & Cycle Monitor
        </p>
      </div>

      {/* 2. Main Operation Console */}
      <div className="stage-card-wrap">
        <div className="hmi-card instruction-card p-5 sm:p-6 relative transition-all duration-200">
          {/* Top Status Accent Line */}
          <div className={`absolute top-0 left-0 right-0 h-1 ${
            isRunning 
              ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' 
              : isStopped 
                ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' 
                : isCompleted
                  ? 'bg-cyan-500 shadow-[0_0_10px_#06b6d4]'
                  : 'bg-emerald-400'
          }`} />

          {/* Spec Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#090f1c] border border-[#1b2a47] rounded-lg p-2.5 mb-4 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[9px] uppercase font-semibold">PROGRAM</span>
              <span className="text-cyan-400 font-bold">{machineState?.program_code || 'O1024'} {machineState?.program_revision || 'Rev 03'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px] uppercase font-semibold">QUANTITY</span>
              <span className="text-white font-bold">{machineState?.total_parts || 10} PCS</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px] uppercase font-semibold">MATERIAL</span>
              <span className="text-amber-300 font-bold">{machineState?.material || 'Aluminium 6061'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px] uppercase font-semibold">WORK OFFSET</span>
              <span className="text-emerald-400 font-bold">{machineState?.work_offset || 'G54'}</span>
            </div>
          </div>

          {/* Status Display Area */}
          <div className="text-center my-4 py-3.5 px-3 rounded-lg bg-[#090f1c] border border-[#1b2a47]">
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1 font-semibold">
              CNC MACHINE STATUS
            </div>

            {isRunning && (
              <div className="flex flex-col items-center justify-center gap-1">
                <div className="flex items-center gap-2.5">
                  <span className="led-indicator led-green led-pulse w-3.5 h-3.5" />
                  <h2 className="text-2xl sm:text-3xl font-black text-emerald-400 font-display tracking-widest">
                    RUNNING
                  </h2>
                </div>
                <p className="text-emerald-300 text-xs font-mono font-semibold">
                  ACTIVE CYCLE IN PROGRESS (SPINDLE ACTIVE: S8000 RPM)
                </p>
              </div>
            )}

            {isStopped && (
              <div className="flex flex-col items-center justify-center gap-1">
                <div className="flex items-center gap-2.5">
                  <span className="led-indicator led-red w-3.5 h-3.5" />
                  <h2 className="text-2xl sm:text-3xl font-black text-red-500 font-display tracking-widest">
                    STOPPED
                  </h2>
                </div>
                <p className="text-red-300 text-xs font-mono font-semibold">
                  CYCLE PAUSED BY OPERATOR (FEED HOLD ACTIVE)
                </p>
              </div>
            )}

            {isCompleted && (
              <div className="flex flex-col items-center justify-center gap-1">
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="w-6 h-6 text-cyan-400" />
                  <h2 className="text-2xl sm:text-3xl font-black text-cyan-400 font-display tracking-widest">
                    BATCH COMPLETED
                  </h2>
                </div>
                <p className="text-cyan-200 text-xs font-mono font-semibold">
                  ALL {machineState?.total_parts} PIECES SUCCESSFULLY MACHINED
                </p>
              </div>
            )}

            {isReady && (
              <div className="flex flex-col items-center justify-center gap-1">
                <div className="flex items-center gap-2.5">
                  <span className="led-indicator led-green w-3.5 h-3.5" />
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-100 font-display tracking-widest">
                    READY
                  </h2>
                </div>
                <p className="text-slate-300 text-xs font-mono">
                  PRESS "START OPERATION" TO INITIATE CYCLE
                </p>
              </div>
            )}
          </div>

          {/* Part Progress & Cycle Time Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
            <div className="bg-[#121c2e] border border-[#1e2f4d] rounded-lg p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block uppercase font-semibold">PART PROGRESS</span>
                <span className="text-lg sm:text-xl font-bold text-white font-mono">
                  Part {machineState?.active_part || 1} / {machineState?.total_parts || 10}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-mono text-cyan-400 block font-semibold">TOTAL BATCH</span>
                <span className="text-sm font-bold text-cyan-300 font-mono">
                  {Math.round(((machineState?.active_part - 1) / (machineState?.total_parts || 10)) * 100)}%
                </span>
              </div>
            </div>

            <div className="bg-[#121c2e] border border-[#1e2f4d] rounded-lg p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block uppercase font-semibold">CYCLE TIME</span>
                <span className="text-lg sm:text-xl font-bold text-amber-300 font-mono tracking-wider">
                  {formatTime(cycleTime)}
                </span>
              </div>
              <Clock className="w-5 h-5 text-amber-400/80" />
            </div>
          </div>

          {/* Part Progress Bar */}
          <div className="bg-[#090f1c] border border-[#1b2a47] rounded-lg p-3 mb-4">
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-400 font-semibold text-[11px]">CURRENT PART CYCLE</span>
              <span className="text-emerald-400 font-bold text-[11px]">{Math.round(partProgress)}%</span>
            </div>
            <div className="w-full bg-[#070b13] h-2.5 rounded-full overflow-hidden border border-[#162238]">
              <div 
                className={`h-full transition-all duration-300 ${
                  isRunning 
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-400 shadow-[0_0_8px_#10b981]' 
                    : 'bg-slate-600'
                }`}
                style={{ width: `${partProgress}%` }}
              />
            </div>
          </div>

          {/* Main Action Button */}
          <div className="pt-1">
            {isRunning ? (
              <button
                onClick={onStop}
                disabled={loading}
                className="w-full hmi-btn hmi-btn-danger h-12 text-sm font-mono font-bold tracking-wider rounded-lg shadow-md flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>STOP OPERATION</span>
              </button>
            ) : isCompleted ? (
              <button
                onClick={onResetScenario}
                className="w-full hmi-btn hmi-btn-primary h-12 text-sm font-mono font-bold tracking-wider rounded-lg shadow-md flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>START NEW BATCH (RESET)</span>
              </button>
            ) : (
              <button
                onClick={onStart}
                disabled={loading}
                className="w-full hmi-btn hmi-btn-primary h-12 text-sm font-mono font-bold tracking-wider rounded-lg shadow-md flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>START OPERATION</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
