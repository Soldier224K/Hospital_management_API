const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Doctor name is required'],
        trim: true
    },
    specialization: {
        type: String,
        required: [true, 'Specialization is required'],
        trim: true
    },
    qualification: {
        type: String,
        required: [true, 'Qualification is required'],
        trim: true
    },
    experienceYears: {
        type: Number,
        required: [true, 'Experience in years is required'],
        min: [0, 'Experience cannot be negative']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'Please provide a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    department: {
        type: String,
        required: [true, 'Department is required'],
        trim: true
    },
    consultationFee: {
        type: Number,
        required: [true, 'Consultation fee is required'],
        min: [0, 'Fee cannot be negative']
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    availableDays: {
        type: [String],
        default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    },
    workingHours: {
        start: { type: String, default: '09:00 AM' },
        end: { type: String, default: '05:00 PM' }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Doctor', doctorSchema);
