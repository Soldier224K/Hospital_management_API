const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: [true, 'Patient ID is required']
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: [true, 'Doctor ID is required']
    },
    department: {
        type: String,
        trim: true
    },
    appointmentDate: {
        type: Date,
        required: [true, 'Appointment date is required']
    },
    timeSlot: {
        type: String,
        required: [true, 'Time slot is required'],
        trim: true
    },
    reasonForVisit: {
        type: String,
        required: [true, 'Reason for visit is required'],
        trim: true
    },
    status: {
        type: String,
        enum: ['Scheduled', 'In-Progress', 'Completed', 'Cancelled'],
        default: 'Scheduled'
    },
    diagnosis: {
        type: String,
        trim: true
    },
    prescriptions: [{
        medicine: { type: String, trim: true },
        dosage: { type: String, trim: true },
        frequency: { type: String, trim: true },
        duration: { type: String, trim: true }
    }],
    notes: {
        type: String,
        trim: true
    },
    consultationFee: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Appointment', appointmentSchema);
