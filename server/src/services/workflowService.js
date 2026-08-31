import { db } from '../db/database.js';

export async function getFullState() {
  const [machineStates] = await db.query('SELECT * FROM machine_state WHERE id = 1');
  const machineState = machineStates[0];
  
  const [checks] = await db.query('SELECT * FROM machine_checks ORDER BY sequence ASC');
  const [tools] = await db.query('SELECT * FROM tools ORDER BY sequence ASC');
  const [workpiece] = await db.query('SELECT * FROM workpiece_setup ORDER BY sequence ASC');

  const confirmedChecksCount = checks.filter(c => c.confirmed === 1).length;
  const totalChecksCount = checks.length;
  const allChecksConfirmed = confirmedChecksCount === totalChecksCount;

  const confirmedToolsCount = tools.filter(t => t.confirmed === 1).length;
  const totalToolsCount = tools.length;
  const allToolsConfirmed = confirmedToolsCount === totalToolsCount;

  const confirmedWorkpieceCount = workpiece.filter(w => w.confirmed === 1).length;
  const totalWorkpieceCount = workpiece.length;
  const allWorkpieceConfirmed = confirmedWorkpieceCount === totalWorkpieceCount;

  const isReady = allChecksConfirmed && allToolsConfirmed && allWorkpieceConfirmed;

  return {
    machineState,
    checks,
    tools,
    workpiece,
    progress: {
      checks: { confirmed: confirmedChecksCount, total: totalChecksCount, complete: allChecksConfirmed },
      tools: { confirmed: confirmedToolsCount, total: totalToolsCount, complete: allToolsConfirmed },
      workpiece: { confirmed: confirmedWorkpieceCount, total: totalWorkpieceCount, complete: allWorkpieceConfirmed },
      isReady
    }
  };
}

export async function getWorkflowState() {
  const fullState = await getFullState();
  const { machineState, progress } = fullState;
  
  // Calculate current index based on stage
  let currentIndex = 0;
  switch (machineState.current_stage) {
    case 'MACHINE_CHECKS':
      currentIndex = progress.checks.confirmed;
      break;
    case 'TOOLS':
      currentIndex = progress.tools.confirmed;
      break;
    case 'WORKPIECE':
      currentIndex = progress.workpiece.confirmed;
      break;
    case 'READY':
    case 'OPERATION':
      currentIndex = 0;
      break;
  }

  return {
    stage: machineState.current_stage,
    currentIndex,
    checksCompleted: progress.checks.confirmed,
    toolsCompleted: progress.tools.confirmed,
    workpieceCompleted: progress.workpiece.confirmed,
    operationStatus: machineState.operation_status
  };
}

export async function validateCheckConfirmation(checkId) {
  const [checks] = await db.query('SELECT * FROM machine_checks WHERE id = ?', [checkId]);
  const check = checks[0];
  if (!check) {
    return { valid: false, error: `Check with ID ${checkId} not found` };
  }
  
  // Validate sequential confirmation - can only confirm in order
  const [allChecks] = await db.query('SELECT * FROM machine_checks ORDER BY sequence ASC');
  const checkIndex = allChecks.findIndex(c => c.id === checkId);
  
  // Find the first unconfirmed check
  const firstUnconfirmedIndex = allChecks.findIndex(c => c.confirmed === 0);
  
  if (checkIndex !== firstUnconfirmedIndex) {
    return { 
      valid: false, 
      error: 'Cannot confirm this check. Please confirm checks in sequential order.' 
    };
  }
  
  return { valid: true };
}

export async function validateToolConfirmation(toolId) {
  const [tools] = await db.query('SELECT * FROM tools WHERE id = ?', [toolId]);
  const tool = tools[0];
  if (!tool) {
    return { valid: false, error: `Tool with ID ${toolId} not found` };
  }
  
  // Validate sequential confirmation
  const [allTools] = await db.query('SELECT * FROM tools ORDER BY sequence ASC');
  const toolIndex = allTools.findIndex(t => t.id === toolId);
  const firstUnconfirmedIndex = allTools.findIndex(t => t.confirmed === 0);
  
  if (toolIndex !== firstUnconfirmedIndex) {
    return { 
      valid: false, 
      error: 'Cannot confirm this tool. Please confirm tools in sequential order.' 
    };
  }
  
  return { valid: true };
}

export async function validateWorkpieceConfirmation(stepId) {
  const [steps] = await db.query('SELECT * FROM workpiece_setup WHERE id = ?', [stepId]);
  const step = steps[0];
  if (!step) {
    return { valid: false, error: `Workpiece step with ID ${stepId} not found` };
  }
  
  // Validate sequential confirmation
  const [allSteps] = await db.query('SELECT * FROM workpiece_setup ORDER BY sequence ASC');
  const stepIndex = allSteps.findIndex(s => s.id === stepId);
  const firstUnconfirmedIndex = allSteps.findIndex(s => s.confirmed === 0);
  
  if (stepIndex !== firstUnconfirmedIndex) {
    return { 
      valid: false, 
      error: 'Cannot confirm this step. Please confirm workpiece steps in sequential order.' 
    };
  }
  
  return { valid: true };
}

export async function validateStageAdvance(currentStage) {
  const fullState = await getFullState();
  
  if (currentStage === 'MACHINE_CHECKS') {
    if (!fullState.progress.checks.complete) {
      return { 
        valid: false, 
        error: 'All 6 machine checks must be completed before proceeding to Tools stage.' 
      };
    }
  } else if (currentStage === 'TOOLS') {
    if (!fullState.progress.tools.complete) {
      return { 
        valid: false, 
        error: 'All 4 tools must be confirmed before proceeding to Workpiece setup stage.' 
      };
    }
  } else if (currentStage === 'WORKPIECE') {
    if (!fullState.progress.workpiece.complete) {
      return { 
        valid: false, 
        error: 'All 5 workpiece setup steps must be confirmed before proceeding to Ready Review.' 
      };
    }
  } else if (currentStage === 'READY') {
    if (!fullState.progress.isReady) {
      return { 
        valid: false, 
        error: 'Setup prerequisites not satisfied.' 
      };
    }
  }
  
  return { valid: true };
}

export async function validateOperationStart() {
  const fullState = await getFullState();
  
  if (!fullState.progress.isReady) {
    return { 
      valid: false, 
      error: 'Machine checks, tools, and workpiece setup must all be confirmed before starting operation.' 
    };
  }
  
  if (fullState.machineState.operation_status === 'RUNNING') {
    return { 
      valid: false, 
      error: 'Operation is already running.' 
    };
  }
  
  return { valid: true };
}

export async function validateOperationStop() {
  const [states] = await db.query('SELECT * FROM machine_state WHERE id = 1');
  const machineState = states[0];
  
  if (machineState.operation_status !== 'RUNNING') {
    return { 
      valid: false, 
      error: 'Operation is not currently running.' 
    };
  }
  
  return { valid: true };
}

export async function logEvent(eventType, message) {
  await db.query('INSERT INTO operation_logs (event_type, message) VALUES (?, ?)', [eventType, message]);
}
