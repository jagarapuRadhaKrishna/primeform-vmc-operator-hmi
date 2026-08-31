import express from 'express';
import { db } from '../db/database.js';
import { 
  validateCheckConfirmation,
  getWorkflowState,
  getFullState,
  logEvent
} from '../services/workflowService.js';

const router = express.Router();

// POST /api/checks/:id/confirm - Confirm a machine check
router.post('/:id/confirm', async (req, res) => {
  try {
    const { id } = req.params;
    const checkId = parseInt(id);
    
    console.log(`Confirming check ID: ${checkId}`);
    
    const validation = await validateCheckConfirmation(checkId);
    if (!validation.valid) {
      console.log(`Validation failed for check ${checkId}: ${validation.error}`);
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    const [checks] = await db.query('SELECT * FROM machine_checks WHERE id = ?', [checkId]);
    const check = checks[0];
    if (!check) {
      console.log(`Check ${checkId} not found`);
      return res.status(404).json({
        success: false,
        message: `Check with ID ${checkId} not found`
      });
    }

    const now = new Date();
    await db.query('UPDATE machine_checks SET confirmed = 1, confirmed_at = ? WHERE id = ?', [now, checkId]);
    
    await logEvent('CHECK_CONFIRMED', `Machine check #${checkId} (${check.title}) confirmed by operator`);
    console.log(`Check ${checkId} confirmed successfully`);

    res.json({
      success: true,
      data: {
        confirmedId: checkId,
        workflow: await getWorkflowState(),
        fullState: await getFullState()
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

export default router;
