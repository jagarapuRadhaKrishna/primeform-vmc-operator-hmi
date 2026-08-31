import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db, initDatabase, seedDatabase } from './database.js';

dotenv.config();

// Initialize database schema and data
initDatabase();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Helper to get aggregated machine and workflow state
function getFullState() {
  const machineState = db.prepare('SELECT * FROM machine_state WHERE id = 1').get();
  
  const checks = db.prepare('SELECT * FROM machine_checks ORDER BY sequence ASC').all();
  const tools = db.prepare('SELECT * FROM tools ORDER BY sequence ASC').all();
  const workpiece = db.prepare('SELECT * FROM workpiece_setup ORDER BY sequence ASC').all();

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'FANUC 0i-MF Plus VMC HMI Server',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Full state endpoint
app.get('/api/state', (req, res) => {
  try {
    const state = getFullState();
    res.json(state);
  } catch (error) {
    console.error('Error fetching state:', error);
    res.status(500).json({ error: 'Failed to fetch state', details: error.message });
  }
});

// Machine checks endpoints
app.get('/api/machine-checks', (req, res) => {
  try {
    const checks = db.prepare('SELECT * FROM machine_checks ORDER BY sequence ASC').all();
    const confirmedCount = checks.filter(c => c.confirmed === 1).length;
    res.json({
      checks,
      total: checks.length,
      confirmedCount,
      allComplete: confirmedCount === checks.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch machine checks', details: error.message });
  }
});

app.post('/api/machine-checks/:id/confirm', (req, res) => {
  try {
    const { id } = req.params;
    const check = db.prepare('SELECT * FROM machine_checks WHERE id = ?').get(id);
    
    if (!check) {
      return res.status(404).json({ error: `Check with ID ${id} not found` });
    }

    const now = new Date().toISOString();
    db.prepare('UPDATE machine_checks SET confirmed = 1, confirmed_at = ? WHERE id = ?').run(now, id);
    
    db.prepare('INSERT INTO operation_logs (event_type, message) VALUES (?, ?)').run(
      'CHECK_CONFIRMED',
      `Machine check #${id} (${check.title}) confirmed by operator`
    );

    const updatedChecks = db.prepare('SELECT * FROM machine_checks ORDER BY sequence ASC').all();
    const confirmedCount = updatedChecks.filter(c => c.confirmed === 1).length;

    res.json({
      success: true,
      confirmedId: Number(id),
      total: updatedChecks.length,
      confirmedCount,
      allComplete: confirmedCount === updatedChecks.length,
      checks: updatedChecks
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to confirm machine check', details: error.message });
  }
});

// Tools endpoints
app.get('/api/tools', (req, res) => {
  try {
    const tools = db.prepare('SELECT * FROM tools ORDER BY sequence ASC').all();
    const confirmedCount = tools.filter(t => t.confirmed === 1).length;
    res.json({
      tools,
      total: tools.length,
      confirmedCount,
      allComplete: confirmedCount === tools.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tools', details: error.message });
  }
});

app.post('/api/tools/:id/confirm', (req, res) => {
  try {
    const { id } = req.params;
    const tool = db.prepare('SELECT * FROM tools WHERE id = ?').get(id);

    if (!tool) {
      return res.status(404).json({ error: `Tool with ID ${id} not found` });
    }

    const now = new Date().toISOString();
    db.prepare('UPDATE tools SET confirmed = 1, confirmed_at = ? WHERE id = ?').run(now, id);

    db.prepare('INSERT INTO operation_logs (event_type, message) VALUES (?, ?)').run(
      'TOOL_CONFIRMED',
      `Tool #${tool.tool_number} (${tool.tool_name}) confirmed loaded in spindle/magazine`
    );

    const updatedTools = db.prepare('SELECT * FROM tools ORDER BY sequence ASC').all();
    const confirmedCount = updatedTools.filter(t => t.confirmed === 1).length;

    res.json({
      success: true,
      confirmedId: Number(id),
      total: updatedTools.length,
      confirmedCount,
      allComplete: confirmedCount === updatedTools.length,
      tools: updatedTools
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to confirm tool', details: error.message });
  }
});

// Workpiece setup endpoints
app.get('/api/workpiece', (req, res) => {
  try {
    const workpiece = db.prepare('SELECT * FROM workpiece_setup ORDER BY sequence ASC').all();
    const confirmedCount = workpiece.filter(w => w.confirmed === 1).length;
    res.json({
      workpiece,
      total: workpiece.length,
      confirmedCount,
      allComplete: confirmedCount === workpiece.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch workpiece setup', details: error.message });
  }
});

app.post('/api/workpiece/:id/confirm', (req, res) => {
  try {
    const { id } = req.params;
    const step = db.prepare('SELECT * FROM workpiece_setup WHERE id = ?').get(id);

    if (!step) {
      return res.status(404).json({ error: `Workpiece step with ID ${id} not found` });
    }

    const now = new Date().toISOString();
    db.prepare('UPDATE workpiece_setup SET confirmed = 1, confirmed_at = ? WHERE id = ?').run(now, id);

    db.prepare('INSERT INTO operation_logs (event_type, message) VALUES (?, ?)').run(
      'WORKPIECE_CONFIRMED',
      `Workpiece setup step #${step.step_number} (${step.title}) confirmed`
    );

    const updatedWorkpiece = db.prepare('SELECT * FROM workpiece_setup ORDER BY sequence ASC').all();
    const confirmedCount = updatedWorkpiece.filter(w => w.confirmed === 1).length;

    res.json({
      success: true,
      confirmedId: Number(id),
      total: updatedWorkpiece.length,
      confirmedCount,
      allComplete: confirmedCount === updatedWorkpiece.length,
      workpiece: updatedWorkpiece
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to confirm workpiece step', details: error.message });
  }
});

// Advance stage with strict enforcement
app.post('/api/stage/next', (req, res) => {
  try {
    const fullState = getFullState();
    const currentStage = fullState.machineState.current_stage;
    let nextStage = currentStage;

    if (currentStage === 'MACHINE_CHECKS') {
      if (!fullState.progress.checks.complete) {
        return res.status(400).json({
          error: 'Cannot advance: All 6 machine checks must be confirmed before proceeding to Tools stage.',
          progress: fullState.progress.checks
        });
      }
      nextStage = 'TOOLS';
    } else if (currentStage === 'TOOLS') {
      if (!fullState.progress.tools.complete) {
        return res.status(400).json({
          error: 'Cannot advance: All 4 tools must be confirmed before proceeding to Workpiece setup stage.',
          progress: fullState.progress.tools
        });
      }
      nextStage = 'WORKPIECE';
    } else if (currentStage === 'WORKPIECE') {
      if (!fullState.progress.workpiece.complete) {
        return res.status(400).json({
          error: 'Cannot advance: All 5 workpiece setup steps must be confirmed before proceeding to Ready Review.',
          progress: fullState.progress.workpiece
        });
      }
      nextStage = 'READY';
    } else if (currentStage === 'READY') {
      if (!fullState.progress.isReady) {
        return res.status(400).json({
          error: 'Cannot proceed: Setup prerequisites not satisfied.',
          progress: fullState.progress
        });
      }
      nextStage = 'OPERATION';
    }

    db.prepare('UPDATE machine_state SET current_stage = ?, last_updated = CURRENT_TIMESTAMP WHERE id = 1').run(nextStage);
    
    db.prepare('INSERT INTO operation_logs (event_type, message) VALUES (?, ?)').run(
      'STAGE_ADVANCED',
      `Workflow advanced from ${currentStage} to ${nextStage}`
    );

    res.json({
      success: true,
      previousStage: currentStage,
      currentStage: nextStage,
      fullState: getFullState()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to advance stage', details: error.message });
  }
});

// Set specific stage (allows navigation to previously completed stages)
app.post('/api/stage/set', (req, res) => {
  try {
    const { stage } = req.body;
    const validStages = ['MACHINE_CHECKS', 'TOOLS', 'WORKPIECE', 'READY', 'OPERATION'];
    
    if (!validStages.includes(stage)) {
      return res.status(400).json({ error: `Invalid stage: ${stage}` });
    }

    const fullState = getFullState();

    // Verify stage prerequisites if jumping forward
    if (stage === 'TOOLS' && !fullState.progress.checks.complete) {
      return res.status(400).json({ error: 'Machine checks must be completed first.' });
    }
    if (stage === 'WORKPIECE' && (!fullState.progress.checks.complete || !fullState.progress.tools.complete)) {
      return res.status(400).json({ error: 'Machine checks and tools must be completed first.' });
    }
    if ((stage === 'READY' || stage === 'OPERATION') && !fullState.progress.isReady) {
      return res.status(400).json({ error: 'All machine checks, tools, and workpiece steps must be completed first.' });
    }

    db.prepare('UPDATE machine_state SET current_stage = ?, last_updated = CURRENT_TIMESTAMP WHERE id = 1').run(stage);

    res.json({
      success: true,
      currentStage: stage,
      fullState: getFullState()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to set stage', details: error.message });
  }
});

// Operation controls
app.post('/api/operation/start', (req, res) => {
  try {
    const fullState = getFullState();
    
    if (!fullState.progress.isReady) {
      return res.status(400).json({
        error: 'Cannot start operation: Machine checks, tools, and workpiece setup must all be confirmed.',
        progress: fullState.progress
      });
    }

    db.prepare(`
      UPDATE machine_state SET
        current_stage = 'OPERATION',
        operation_status = 'RUNNING',
        last_updated = CURRENT_TIMESTAMP
      WHERE id = 1
    `).run();

    db.prepare('INSERT INTO operation_logs (event_type, message) VALUES (?, ?)').run(
      'OPERATION_STARTED',
      `Cycle started for part #${fullState.machineState.active_part} of ${fullState.machineState.total_parts}`
    );

    res.json({
      success: true,
      operation_status: 'RUNNING',
      state: getFullState()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start operation', details: error.message });
  }
});

app.post('/api/operation/stop', (req, res) => {
  try {
    db.prepare(`
      UPDATE machine_state SET
        operation_status = 'STOPPED',
        last_updated = CURRENT_TIMESTAMP
      WHERE id = 1
    `).run();

    db.prepare('INSERT INTO operation_logs (event_type, message) VALUES (?, ?)').run(
      'OPERATION_STOPPED',
      'Operator halted cycle (Feed hold / Spindle stop)'
    );

    res.json({
      success: true,
      operation_status: 'STOPPED',
      state: getFullState()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to stop operation', details: error.message });
  }
});

app.post('/api/operation/part-complete', (req, res) => {
  try {
    const state = db.prepare('SELECT * FROM machine_state WHERE id = 1').get();
    let nextPart = state.active_part + 1;
    let nextStatus = state.operation_status;

    if (nextPart > state.total_parts) {
      nextPart = state.total_parts;
      nextStatus = 'COMPLETED';
    }

    db.prepare(`
      UPDATE machine_state SET
        active_part = ?,
        operation_status = ?,
        last_updated = CURRENT_TIMESTAMP
      WHERE id = 1
    `).run(nextPart, nextStatus);

    db.prepare('INSERT INTO operation_logs (event_type, message) VALUES (?, ?)').run(
      'PART_COMPLETED',
      `Part ${state.active_part} completed. Batch progress: ${nextPart <= state.total_parts ? nextPart : state.total_parts}/${state.total_parts}`
    );

    res.json({
      success: true,
      active_part: nextPart,
      operation_status: nextStatus,
      state: getFullState()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record part completion', details: error.message });
  }
});

// Reset entire scenario to Stage 1 (Machine Checks)
app.post('/api/reset', (req, res) => {
  try {
    seedDatabase(true);
    res.json({
      success: true,
      message: 'System reset to initial POWER ON state',
      state: getFullState()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset scenario', details: error.message });
  }
});

// Logs endpoint
app.get('/api/logs', (req, res) => {
  try {
    const logs = db.prepare('SELECT * FROM operation_logs ORDER BY id DESC LIMIT 50').all();
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch logs', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 VMC Operator HMI Backend running on http://localhost:${PORT}`);
});
