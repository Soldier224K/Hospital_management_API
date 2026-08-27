const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Hospital name is required'],
        trim: true
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        trim: true
    },
    totalBeds: {
        type: Number,
        required: [true, 'Total beds is required'],
        min: 0
    },
    availableBeds: {
        type: Number,
        required: [true, 'Available beds is required'],
        min: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Hospital', hospitalSchema);
