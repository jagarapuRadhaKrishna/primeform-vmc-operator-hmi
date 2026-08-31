import express from 'express';
import { db } from '../db/database.js';
import { 
  getWorkflowState, 
  getFullState,
  validateCheckConfirmation,
  validateToolConfirmation,
  validateWorkpieceConfirmation,
  validateStageAdvance,
  logEvent
} from '../services/workflowService.js';
import { seedDatabase } from '../db/database.js';

const router = express.Router();

// GET /api/workflow - Return current operator progress
router.get('/', async (req, res) => {
  try {
    const workflow = await getWorkflowState();
    res.json({
      success: true,
      data: workflow
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch workflow state',
      error: error.message 
    });
  }
});

// POST /api/checks/:id/confirm - Confirm a machine check
router.post('/checks/:id/confirm', (req, res) => {
  try {
    const { id } = req.params;
    const checkId = parseInt(id);
    
    console.log(`Confirming check ID: ${checkId}`);
    
    const validation = validateCheckConfirmation(checkId);
    if (!validation.valid) {
      console.log(`Validation failed for check ${checkId}: ${validation.error}`);
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    const check = db.prepare('SELECT * FROM machine_checks WHERE id = ?').get(checkId);
    if (!check) {
      console.log(`Check ${checkId} not found`);
      return res.status(404).json({
        success: false,
        message: `Check with ID ${checkId} not found`
      });
    }

    const now = new Date().toISOString();
    db.prepare('UPDATE machine_checks SET confirmed = 1, confirmed_at = ? WHERE id = ?').run(now, checkId);
    
    logEvent('CHECK_CONFIRMED', `Machine check #${checkId} (${check.title}) confirmed by operator`);
    console.log(`Check ${checkId} confirmed successfully`);

    res.json({
      success: true,
      data: {
        confirmedId: checkId,
        workflow: getWorkflowState(),
        fullState: getFullState()
      }
    });
  } catch (error) {
    console.error(`Error confirming check: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to confirm machine check',
      error: error.message 
    });
  }
});

// POST /api/tools/:id/confirm - Confirm a required tool
router.post('/tools/:id/confirm', (req, res) => {
  try {
    const { id } = req.params;
    const toolId = parseInt(id);
    
    const validation = validateToolConfirmation(toolId);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    const tool = db.prepare('SELECT * FROM tools WHERE id = ?').get(toolId);
    const now = new Date().toISOString();
    db.prepare('UPDATE tools SET confirmed = 1, confirmed_at = ? WHERE id = ?').run(now, toolId);

    logEvent('TOOL_CONFIRMED', `Tool #${tool.tool_number} (${tool.tool_name}) confirmed loaded in spindle/magazine`);

    res.json({
      success: true,
      data: {
        confirmedId: toolId,
        workflow: getWorkflowState(),
        fullState: getFullState()
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to confirm tool',
      error: error.message 
    });
  }
});

// POST /api/workpiece/:id/confirm - Confirm a workpiece setup step
router.post('/workpiece/:id/confirm', (req, res) => {
  try {
    const { id } = req.params;
    const stepId = parseInt(id);
    
    const validation = validateWorkpieceConfirmation(stepId);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    const step = db.prepare('SELECT * FROM workpiece_setup WHERE id = ?').get(stepId);
    const now = new Date().toISOString();
    db.prepare('UPDATE workpiece_setup SET confirmed = 1, confirmed_at = ? WHERE id = ?').run(now, stepId);

    logEvent('WORKPIECE_CONFIRMED', `Workpiece setup step #${step.step_number} (${step.title}) confirmed`);

    res.json({
      success: true,
      data: {
        confirmedId: stepId,
        workflow: getWorkflowState(),
        fullState: getFullState()
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to confirm workpiece step',
      error: error.message 
    });
  }
});

// POST /api/workflow/next - Move to the next stage
router.post('/next', async (req, res) => {
  try {
    const fullState = await getFullState();
    const currentStage = fullState.machineState.current_stage;
    
    const validation = await validateStageAdvance(currentStage);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    let nextStage = currentStage;
    if (currentStage === 'MACHINE_CHECKS') {
      nextStage = 'TOOLS';
    } else if (currentStage === 'TOOLS') {
      nextStage = 'WORKPIECE';
    } else if (currentStage === 'WORKPIECE') {
      nextStage = 'READY';
    } else if (currentStage === 'READY') {
      nextStage = 'OPERATION';
    }

    await db.query('UPDATE machine_state SET current_stage = ? WHERE id = 1', [nextStage]);
    await logEvent('STAGE_ADVANCED', `Workflow advanced from ${currentStage} to ${nextStage}`);

    res.json({
      success: true,
      data: {
        previousStage: currentStage,
        currentStage: nextStage,
        workflow: await getWorkflowState(),
        fullState: await getFullState()
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to advance stage',
      error: error.message 
    });
  }
});

// POST /api/workflow/reset - Reset to initial state
router.post('/reset', async (req, res) => {
  try {
    await seedDatabase(true);
    res.json({
      success: true,
      message: 'System reset to initial POWER ON state',
      data: {
        workflow: await getWorkflowState(),
        fullState: await getFullState()
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reset scenario',
      error: error.message 
    });
  }
});

export default router;
