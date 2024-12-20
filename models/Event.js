const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    date: { 
        type: Date, 
        required: true,
        validate: {
            validator: function (value) {
                return value > Date.now();
            },
            message: 'Event date must be in the future.'
        }
    },
    location: { type: String, required: true },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Optional
    status: { type: String, enum: ['upcoming', 'completed', 'cancelled'], default: 'upcoming' },
    price: { type: Number, required: true, min: 0 },
    eventPhoto: { type: String, default: 'https://via.placeholder.com/400x300?text=Event+Image' }, // Add eventPhoto field
    
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
