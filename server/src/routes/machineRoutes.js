import express from 'express';
import { getFullState } from '../services/workflowService.js';

const router = express.Router();

// GET /api/machine - Return machine configuration, operation, tools, checks and workpiece
router.get('/', async (req, res) => {
  try {
    const state = await getFullState();
    res.json({
      success: true,
      data: state
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch machine configuration',
      error: error.message 
    });
  }
});

export default router;
