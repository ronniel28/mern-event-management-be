const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');

// Register for an event
const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.body;
    const userId = req.user._id;

    // Check if the user is already registered for the event
    const existingRegistration = await Registration.findOne({ event: eventId, user: userId });
    if (existingRegistration) {
      return res.status(400).json({ message: 'User is already registered for this event.' });
    }

    // Create a new registration
    let newRegistration = new Registration({
      event: eventId,
      user: userId
    });

    // Save the registration and populate the user field
    newRegistration = await newRegistration.save();
    newRegistration = await newRegistration.populate('user', 'name email');

    // Add the user to the attendees array in the Event model
    await Event.findByIdAndUpdate(eventId, { $addToSet: { attendees: userId } });

    res.status(201).json({ message: 'Registration successful', registration: newRegistration });
  } catch (error) {
    res.status(500).json({ message: 'Error registering for event', error: error.message });
  }
};

// Get all registrations for an event
const getRegistrationsForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const registrations = await Registration.find({ event: eventId }).populate('user', 'name email');
    res.status(200).json(registrations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching registrations', error: error.message });
  }
};

// Cancel a registration
const cancelRegistration = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const userId = req.user._id;

    // Find the registration
    const registration = await Registration.findById(registrationId);
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Remove the registration
    await Registration.deleteOne({ _id: registrationId });

    // Remove the user from the attendees array in the Event model
    await Event.findByIdAndUpdate(registration.event, { $pull: { attendees: userId } });

    res.status(200).json({ message: 'Registration cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling registration', error: error.message });
  }
};

const checkRegistrationStatus = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    // Check if the user is registered for the event
    const registration = await Registration.findOne({ event: eventId, user: userId });

    if (registration) {
      return res.status(200).json({ isRegistered: true, registrationId: registration._id });
    } else {
      return res.status(200).json({ isRegistered: false });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error checking registration status', error: error.message });
  }
};

module.exports = {
  registerForEvent,
  getRegistrationsForEvent,
  cancelRegistration,
  checkRegistrationStatus
};