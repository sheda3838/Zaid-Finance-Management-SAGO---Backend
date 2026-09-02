import express from 'express';
import { getSummary, getTrends } from '../controllers/dashboardController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protect all dashboard routes
router.use(authMiddleware);

router.get('/summary', getSummary);
router.get('/trends', getTrends);

export default router;
