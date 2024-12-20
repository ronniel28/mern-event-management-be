const express = require('express');
const router = express.Router();
const { registerForEvent, getRegistrationsForEvent, cancelRegistration, checkRegistrationStatus } = require('../controllers/registrationController');
const { protect } = require('../middlewares/authMiddleware'); // Import the protect middleware

router.post('/', protect, registerForEvent); // Register for an event
router.get('/:eventId', protect, getRegistrationsForEvent); // Get all registrations for an event
router.delete('/:registrationId', protect, cancelRegistration); // Cancel a registration
router.get('/status/:eventId', protect, checkRegistrationStatus);

module.exports = router;
