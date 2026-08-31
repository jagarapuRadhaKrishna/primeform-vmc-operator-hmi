import express from 'express';
import { db } from '../db/database.js';
import { 
  validateToolConfirmation,
  getWorkflowState,
  getFullState,
  logEvent
} from '../services/workflowService.js';

const router = express.Router();

// POST /api/tools/:id/confirm - Confirm a required tool
router.post('/:id/confirm', async (req, res) => {
  try {
    const { id } = req.params;
    const toolId = parseInt(id);
    
    console.log(`Confirming tool ID: ${toolId}`);
    
    const validation = await validateToolConfirmation(toolId);
    if (!validation.valid) {
      console.log(`Validation failed for tool ${toolId}: ${validation.error}`);
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    const [tools] = await db.query('SELECT * FROM tools WHERE id = ?', [toolId]);
    const tool = tools[0];
    if (!tool) {
      console.log(`Tool ${toolId} not found`);
      return res.status(404).json({
        success: false,
        message: `Tool with ID ${toolId} not found`
      });
    }

    const now = new Date();
    await db.query('UPDATE tools SET confirmed = 1, confirmed_at = ? WHERE id = ?', [now, toolId]);

    await logEvent('TOOL_CONFIRMED', `Tool #${tool.tool_number} (${tool.tool_name}) confirmed loaded in spindle/magazine`);
    console.log(`Tool ${toolId} confirmed successfully`);

    res.json({
      success: true,
      data: {
        confirmedId: toolId,
        workflow: await getWorkflowState(),
        fullState: await getFullState()
      }
    });
  } catch (error) {
    console.error(`Error confirming tool: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to confirm tool',
      error: error.message 
    });
  }
});

export default router;
