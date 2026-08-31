import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
import { HmiHeader } from './components/HmiHeader';
import { StageProgress } from './components/StageProgress';
import { Stage1MachineChecks } from './stages/Stage1MachineChecks';
import { Stage2RequiredTools } from './stages/Stage2RequiredTools';
import { Stage3WorkpieceSetup } from './stages/Stage3WorkpieceSetup';
import { Stage4ReadyReview } from './stages/Stage4ReadyReview';
import { Stage5Operation } from './stages/Stage5Operation';
import { AlertCircle, WifiOff } from 'lucide-react';

export function App() {
  const [machineState, setMachineState] = useState(null);
  const [checks, setChecks] = useState([]);
  const [tools, setTools] = useState([]);
  const [workpiece, setWorkpiece] = useState([]);
  const [progress, setProgress] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const applyFullState = (data) => {
    if (data.machineState) setMachineState(data.machineState);
    if (data.checks) setChecks(data.checks);
    if (data.tools) setTools(data.tools);
    if (data.workpiece) setWorkpiece(data.workpiece);
    if (data.progress) setProgress(data.progress);
  };

  const loadState = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const machineRes = await api.getMachine();
      const workflowRes = await api.getWorkflow();
      
      if (machineRes.success && machineRes.data) {
        applyFullState(machineRes.data);
      }
      setIsConnected(true);
    } catch (err) {
      console.error('Failed to load state from API:', err);
      setIsConnected(false);
      if (isInitial) {
        showToast('Cannot connect to backend HMI service. Running in offline mode.', 'error');
      }
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadState(true);
    const interval = setInterval(() => {
      loadState(false);
    }, 3000);
    return () => clearInterval(interval);
  }, [loadState]);

  const handleConfirmCheck = async (id) => {
    try {
      setLoading(true);
      const res = await api.confirmMachineCheck(id);
      if (res.success && res.data?.fullState) {
        applyFullState(res.data.fullState);
      } else {
        await loadState();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to confirm check', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmTool = async (id) => {
    try {
      setLoading(true);
      const res = await api.confirmTool(id);
      if (res.success && res.data?.fullState) {
        applyFullState(res.data.fullState);
      } else {
        await loadState();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to confirm tool', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmWorkpiece = async (id) => {
    try {
      setLoading(true);
      const res = await api.confirmWorkpiece(id);
      if (res.success && res.data?.fullState) {
        applyFullState(res.data.fullState);
      } else {
        await loadState();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to confirm workpiece step', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleNextStage = async () => {
    try {
      setLoading(true);
      const res = await api.advanceStage();
      if (res.success && res.data?.fullState) {
        applyFullState(res.data.fullState);
      } else {
        await loadState();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Cannot advance: Complete all required steps first.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStartOperation = async () => {
    try {
      setLoading(true);
      const res = await api.startOperation();
      if (res.success && res.data?.fullState) {
        applyFullState(res.data.fullState);
      } else {
        await loadState();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to start operation', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStopOperation = async () => {
    try {
      setLoading(true);
      const res = await api.stopOperation();
      if (res.success && res.data?.fullState) {
        applyFullState(res.data.fullState);
      } else {
        await loadState();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to stop operation', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      setLoading(true);
      const res = await api.resetSystem();
      if (res.success && res.data?.fullState) {
        applyFullState(res.data.fullState);
        showToast('System reset to initial POWER ON state', 'info');
      } else {
        await loadState();
      }
    } catch (err) {
      showToast('Failed to reset system scenario', 'error');
    } finally {
      setLoading(false);
    }
  };

  const currentStage = machineState?.current_stage || 'MACHINE_CHECKS';

  return (
    <div className="hmi-shell selection:bg-cyan-500 selection:text-black">
      {/* 1. Header Area */}
      <HmiHeader 
        machineState={machineState} 
        onReset={handleReset} 
        isConnected={isConnected} 
      />

      {/* Offline Alert Banner */}
      {!isConnected && (
        <div className="bg-red-950 border-b border-red-700 text-red-200 px-3 py-1.5 text-xs font-mono flex items-center justify-center gap-2 shrink-0">
          <WifiOff className="w-4 h-4 text-red-400 shrink-0" />
          <span>● CONNECTION LOST: Backend HMI server unreachable at http://localhost:5000</span>
        </div>
      )}

      {/* 2. Stage Progress Stepper */}
      <StageProgress 
        currentStage={currentStage} 
        progress={progress} 
      />

      {/* 3. Centered Main Stage Content - Fits Viewport Seamlessly */}
      <main className="hmi-main">
        {currentStage === 'MACHINE_CHECKS' && (
          <Stage1MachineChecks 
            checks={checks}
            onConfirmCheck={handleConfirmCheck}
            onNextStage={handleNextStage}
            loading={loading}
          />
        )}

        {currentStage === 'TOOLS' && (
          <Stage2RequiredTools 
            tools={tools}
            onConfirmTool={handleConfirmTool}
            onNextStage={handleNextStage}
            loading={loading}
          />
        )}

        {currentStage === 'WORKPIECE' && (
          <Stage3WorkpieceSetup 
            workpiece={workpiece}
            onConfirmStep={handleConfirmWorkpiece}
            onNextStage={handleNextStage}
            loading={loading}
          />
        )}

        {currentStage === 'READY' && (
          <Stage4ReadyReview 
            checks={checks}
            tools={tools}
            workpiece={workpiece}
            onProceed={handleNextStage}
            loading={loading}
          />
        )}

        {currentStage === 'OPERATION' && (
          <Stage5Operation 
            machineState={machineState}
            onStart={handleStartOperation}
            onStop={handleStopOperation}
            onResetScenario={handleReset}
            loading={loading}
          />
        )}
      </main>

      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
          <div className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border shadow-2xl font-mono text-xs ${
            toast.type === 'error' 
              ? 'bg-red-950 border-red-500 text-red-200' 
              : 'bg-cyan-950 border-cyan-500 text-cyan-200'
          }`}>
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
