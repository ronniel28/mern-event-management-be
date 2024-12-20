const express = require('express');
const router = express.Router();
const { createEvent, updateEvent, getEvent, deleteEvent, upload, getAllEvents } = require('../controllers/eventController');
const { protect } = require('../middlewares/authMiddleware');

// Routes
router.post('/', protect, upload.single('eventPhoto'), createEvent);
router.put('/:id', protect, upload.single('eventPhoto'), updateEvent);
router.get('/:id', getEvent);
router.get('/', getAllEvents);
router.delete('/:id', protect, deleteEvent);

module.exports = router;