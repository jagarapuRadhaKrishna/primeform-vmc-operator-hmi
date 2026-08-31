import React, { useState, useEffect } from 'react';
import { RotateCcw, AlertTriangle, Cpu, HardDrive, FileCode, Crosshair } from 'lucide-react';

export function HmiHeader({ machineState, onReset, isConnected }) {
  const [time, setTime] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const confirmReset = () => {
    setShowResetConfirm(false);
    onReset();
  };

  const isRunning = machineState?.operation_status === 'RUNNING';
  const isStopped = machineState?.operation_status === 'STOPPED';

  return (
    <header className="hmi-header">
      <div className="hmi-header__inner">
        {/* Left Side: Machine Telemetry */}
        <div className="hmi-header__machine">
          {/* Machine ID */}
          <div className="flex items-center gap-2 bg-[#121c2e] px-3 py-1.5 rounded-lg border border-[#1e2f4d]">
            <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 font-mono block leading-none font-semibold">MACHINE</span>
              <span className="text-sm font-bold text-white font-mono tracking-wider">
                {machineState?.machine_name || 'VMC-01'}
              </span>
            </div>
          </div>

          {/* Controller */}
          <div className="hidden sm:flex items-center gap-2 bg-[#121c2e] px-3 py-1.5 rounded-lg border border-[#1e2f4d]">
            <HardDrive className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 font-mono block leading-none font-semibold">CONTROLLER</span>
              <span className="text-xs font-semibold text-slate-200 font-mono">
                {machineState?.controller || 'FANUC 0i-MF Plus'}
              </span>
            </div>
          </div>

          {/* Program Code */}
          <div className="hidden md:flex items-center gap-2 bg-[#121c2e] px-3 py-1.5 rounded-lg border border-[#1e2f4d]">
            <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 font-mono block leading-none font-semibold">PROGRAM</span>
              <span className="text-xs font-bold text-cyan-300 font-mono">
                {machineState?.program_code || 'O1024'} {machineState?.program_revision || 'Rev 03'}
              </span>
            </div>
          </div>

          {/* Work Offset */}
          <div className="hidden lg:flex items-center gap-2 bg-[#121c2e] px-3 py-1.5 rounded-lg border border-[#1e2f4d]">
            <Crosshair className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 font-mono block leading-none font-semibold">W.OFFSET</span>
              <span className="text-xs font-bold text-amber-400 font-mono">
                {machineState?.work_offset || 'G54'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Status, Online, Clock, Reset */}
        <div className="hmi-header__actions">
          {/* Main Status Pill */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono font-bold tracking-wider uppercase ${
            isRunning 
              ? 'bg-emerald-950/80 border-emerald-500/70 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.25)]'
              : isStopped
                ? 'bg-red-950/80 border-red-500/70 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.25)]'
                : 'bg-cyan-950/80 border-cyan-500/70 text-cyan-400'
          }`}>
            <span className={`led-indicator ${
              isRunning ? 'led-green led-pulse' : isStopped ? 'led-red' : 'led-amber'
            }`}></span>
            <span>{isRunning ? 'RUNNING' : isStopped ? 'STOPPED' : 'POWER ON'}</span>
          </div>

          {/* Online Connection Pill */}
          <div className="hidden xs:flex items-center gap-1.5 text-xs font-mono px-2.5 py-1.5 bg-[#121c2e] rounded-lg border border-[#1e2f4d]">
            <span className={`w-2 h-2 rounded-full shrink-0 ${isConnected ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]' : 'bg-red-500'}`}></span>
            <span className={`font-semibold ${isConnected ? 'text-slate-300' : 'text-red-400'}`}>
              {isConnected ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>

          {/* System Clock */}
          <div className="font-mono text-xs font-bold text-slate-300 bg-[#121c2e] px-2.5 py-1.5 rounded-lg border border-[#1e2f4d] tracking-widest hidden sm:block">
            {time}
          </div>

          {/* Reset Scenario Button */}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-slate-300 bg-[#172238] hover:bg-[#20304f] border border-[#273a5e] rounded-lg hover:text-white transition-colors cursor-pointer"
            title="Reset workflow to Stage 1"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="hidden sm:inline">RESET</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#0f1728] border-2 border-amber-500 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400 mb-4">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold uppercase tracking-wider font-mono">Confirm Workflow Reset</h3>
            </div>
            <p className="text-slate-300 text-sm mb-6 leading-relaxed">
              Are you sure you want to reset the HMI back to <strong className="text-white">STAGE 1: MACHINE CHECKS</strong>? All confirmations will be cleared.
            </p>
            <div className="flex justify-end gap-3 font-mono">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
              >
                CANCEL
              </button>
              <button
                onClick={confirmReset}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold tracking-wide transition-colors shadow-lg cursor-pointer"
              >
                RESET TO POWER ON
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
