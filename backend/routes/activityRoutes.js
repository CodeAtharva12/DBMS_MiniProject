const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { authenticateToken } = require('../middlewares/auth');

// Public routes - none

// Protected routes
router.get('/', authenticateToken, activityController.getAllActivities);
router.get('/recent', authenticateToken, activityController.getRecentActivities);
router.post('/', authenticateToken, activityController.createActivity);

module.exports = router;
