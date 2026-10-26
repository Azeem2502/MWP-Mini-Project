import express from 'express';
import { getReportsAnalytics } from '../controllers/reportController.js';

const router = express.Router();

router.get('/analytics', getReportsAnalytics);

export default router;
