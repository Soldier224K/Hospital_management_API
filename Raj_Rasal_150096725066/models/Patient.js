const mongoose = require('mongoose');

const medicalHistoryEntrySchema = new mongoose.Schema({
    condition: { type: String, required: true },
    diagnosedDate: { type: Date, default: Date.now },
    notes: { type: String, trim: true }
}, { _id: false });

const patientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Patient name is required'],
        trim: true
    },
    age: {
        type: Number,
        required: [true, 'Patient age is required'],
        min: [0, 'Age cannot be negative'],
        max: [130, 'Age must be realistic']
    },
    gender: {
        type: String,
        required: [true, 'Gender is required'],
        enum: ['Male', 'Female', 'Other']
    },
    bloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
        default: 'Unknown'
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'Please provide a valid email']
    },
    address: {
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        zipCode: { type: String, trim: true }
    },
    emergencyContact: {
        name: { type: String, trim: true },
        relationship: { type: String, trim: true },
        phone: { type: String, trim: true }
    },
    allergies: {
        type: [String],
        default: []
    },
    medicalHistory: {
        type: [medicalHistoryEntrySchema],
        default: []
    },
    admissionStatus: {
        type: String,
        enum: ['Outpatient', 'Admitted', 'Discharged'],
        default: 'Outpatient'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Patient', patientSchema);
