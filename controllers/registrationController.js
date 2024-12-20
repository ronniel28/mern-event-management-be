const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');
const sendMail = require('../utils/mailer');

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

    // Fetch the event details
    const event = await Event.findById(eventId).populate('organizer', 'name email');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
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

    // Generate the "Add to Calendar" link
    const calendarLink = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.name)}&dates=${new Date(event.date).toISOString().replace(/-|:|\.\d\d\d/g, '')}/${new Date(new Date(event.date).getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, '')}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}&trp=false&sprop=&sprop=name:`;

    // Send registration email
    const emailContent = `
      You have successfully registered for the event: ${event.name}
      Date: ${new Date(event.date).toLocaleString()}
      Organizer: ${event.organizer.name}
      Add to Calendar: ${calendarLink}
    `;
    await sendMail(newRegistration.user.email, 'Event Registration Successful', emailContent);

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
    const registration = await Registration.findById(registrationId).populate('user', 'email');
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Fetch the event details
    const event = await Event.findById(registration.event);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Remove the registration
    await Registration.deleteOne({ _id: registrationId });

    // Remove the user from the attendees array in the Event model
    await Event.findByIdAndUpdate(registration.event, { $pull: { attendees: userId } });

    // Send cancellation email
    await sendMail(registration.user.email, 'Event Registration Cancelled', `You have successfully cancelled your registration for the event: ${event.name}`);

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