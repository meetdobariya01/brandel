const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const { validateWaitlistForm } = require('../middleware/validation');

// Route for waitlist submission
router.post('/waitlist', validateWaitlistForm, emailController.handleWaitlistSubmission);

// Route to get all entries (admin only - add authentication in production)
router.get('/waitlist/all', emailController.getAllWaitlistEntries);

module.exports = router;