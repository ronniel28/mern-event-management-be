const multer = require('multer');
const path = require('path');
const Event = require('../models/Event');

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

const createEvent = async (req, res) => {
    try {
        const { name, description, date, location, status, price } = req.body;
        const eventPhoto = req.file ? `/uploads/${req.file.filename}` : null;

        // Ensure the organizer field is included
        const organizer = req.user._id;

        const newEvent = new Event({
            name,
            description,
            date,
            location,
            status,
            price,
            eventPhoto,
            organizer
        });

        await newEvent.save();
        res.status(201).json({ message: 'Event created successfully', event: newEvent });
    } catch (err) {
        res.status(500).json({ message: 'Error creating event', error: err.message });
    }
};

const updateEvent = async (req, res) => {
    try {
        const { name, description, date, location, status, price } = req.body;
        const eventPhoto = req.file ? `/uploads/${req.file.filename}` : req.body.eventPhoto;

        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        event.name = name || event.name;
        event.description = description || event.description;
        event.date = date || event.date;
        event.location = location || event.location;
        event.status = status || event.status;
        event.price = price || event.price;
        event.eventPhoto = eventPhoto || event.eventPhoto;

        await event.save();
        res.status(200).json({ message: 'Event updated successfully', event });

    } catch (err) {
        res.status(500).json({ message: 'Error updating event', error: err.message });
    }
};

const getEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('organizer', 'name email')
            .populate('attendees', 'name email'); // Populate attendees with name and email
        if (!event) return res.status(404).json({ message: 'Event not found' });

        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching event', error: error.message });
    }
};

const getAllEvents = async (req, res) => {
    try {
        const events = await Event.find()
            .populate('organizer', 'name email')
            .populate('attendees', 'name email')// Populate attendees with name and email
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching events', error: error.message });
    }
};

const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        if (event.organizer.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this event' });
        }

        await event.remove();
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting event', error: err.message });
    }
};

module.exports = {
    createEvent,
    updateEvent,
    getEvent,
    deleteEvent,
    getAllEvents,
    upload
};
