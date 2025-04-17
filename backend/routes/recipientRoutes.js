const express = require('express');
const router = express.Router();
const recipientController = require('../controllers/recipientController');
const { authenticateToken, isAdmin } = require('../middlewares/auth');

// All routes are protected
router.use(authenticateToken);

// Get all recipients
router.get('/', recipientController.getAllRecipients);

// Get a single recipient
router.get('/:id', recipientController.getRecipientById);

// Create a new recipient (admin only)
router.post('/', isAdmin, recipientController.createRecipient);

// Update a recipient (admin only)
router.put('/:id', isAdmin, recipientController.updateRecipient);

// Delete a recipient (admin only)
router.delete('/:id', isAdmin, recipientController.deleteRecipient);

// Get recipient's blood request history
router.get('/:id/requests', recipientController.getRecipientRequests);

module.exports = router; 