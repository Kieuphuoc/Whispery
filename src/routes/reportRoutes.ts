import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import {
    submitReport,
    getMyReports,
    getReport
} from '../controllers/reportController.js';

const router = express.Router();

// Submit a report
router.post('/', authenticate, submitReport);

// Get my submitted reports
router.get('/my', authenticate, getMyReports);

// Get a specific report
router.get('/:id', authenticate, getReport);

export default router;
