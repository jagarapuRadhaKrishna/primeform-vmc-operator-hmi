import express from 'express';
import { db } from '../db/database.js';
import { 
  validateWorkpieceConfirmation,
  getWorkflowState,
  getFullState,
  logEvent
} from '../services/workflowService.js';

const router = express.Router();

// POST /api/workpiece/:id/confirm - Confirm a workpiece setup step
router.post('/:id/confirm', async (req, res) => {
  try {
    const { id } = req.params;
    const stepId = parseInt(id);
    
    console.log(`Confirming workpiece step ID: ${stepId}`);
    
    const validation = await validateWorkpieceConfirmation(stepId);
    if (!validation.valid) {
      console.log(`Validation failed for workpiece step ${stepId}: ${validation.error}`);
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    const [steps] = await db.query('SELECT * FROM workpiece_setup WHERE id = ?', [stepId]);
    const step = steps[0];
    if (!step) {
      console.log(`Workpiece step ${stepId} not found`);
      return res.status(404).json({
        success: false,
        message: `Workpiece step with ID ${stepId} not found`
      });
    }

    const now = new Date();
    await db.query('UPDATE workpiece_setup SET confirmed = 1, confirmed_at = ? WHERE id = ?', [now, stepId]);

    await logEvent('WORKPIECE_CONFIRMED', `Workpiece setup step #${step.step_number} (${step.title}) confirmed`);
    console.log(`Workpiece step ${stepId} confirmed successfully`);

    res.json({
      success: true,
      data: {
        confirmedId: stepId,
        workflow: await getWorkflowState(),
        fullState: await getFullState()
      }
    });
  } catch (error) {
    console.error(`Error confirming workpiece step: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to confirm workpiece step',
      error: error.message 
    });
  }
});

export default router;
