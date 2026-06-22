// routes/emailRoutes.js
const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');

// Route for waitlist submission (without validation middleware)
router.post('/waitlist', emailController.handleWaitlistSubmission);

// Route to get all entries with filters
router.get('/waitlist/all', emailController.getAllWaitlistEntries);

// Route to get single entry by ID
router.get('/waitlist/:id', emailController.getEntryById);

// Route to update entry status
router.put('/waitlist/:id', emailController.updateEntryStatus);

// 📥 DOWNLOAD INQUIRY REPORT
router.get('/waitlist/download/report', emailController.downloadInquiryReport);

// Bulk update status
router.post('/waitlist/bulk-update', emailController.bulkUpdateStatus);

module.exports = router;