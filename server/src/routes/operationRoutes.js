import express from 'express';
import { db } from '../db/database.js';
import { 
  getFullState, 
  validateOperationStart, 
  validateOperationStop,
  logEvent 
} from '../services/workflowService.js';

const router = express.Router();

// POST /api/operation/start - Start the operation
router.post('/start', async (req, res) => {
  try {
    const validation = await validateOperationStart();
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    const fullState = await getFullState();
    
    await db.query(`
      UPDATE machine_state SET
        current_stage = 'OPERATION',
        operation_status = 'RUNNING'
      WHERE id = 1
    `);

    await logEvent('OPERATION_STARTED', `Cycle started for part #${fullState.machineState.active_part} of ${fullState.machineState.total_parts}`);

    res.json({
      success: true,
      data: {
        operation_status: 'RUNNING',
        workflow: {
          stage: 'OPERATION',
          operationStatus: 'RUNNING'
        },
        fullState: await getFullState()
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to start operation',
      error: error.message 
    });
  }
});

// POST /api/operation/stop - Stop the operation
router.post('/stop', async (req, res) => {
  try {
    const validation = await validateOperationStop();
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    await db.query(`
      UPDATE machine_state SET
        operation_status = 'STOPPED'
      WHERE id = 1
    `);

    await logEvent('OPERATION_STOPPED', 'Operator halted cycle (Feed hold / Spindle stop)');

    res.json({
      success: true,
      data: {
        operation_status: 'STOPPED',
        workflow: {
          operationStatus: 'STOPPED'
        },
        fullState: await getFullState()
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to stop operation',
      error: error.message 
    });
  }
});

export default router;
