const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Department name is required'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    headDoctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        default: null
    },
    location: {
        building: { type: String, default: 'Main Wing' },
        floor: { type: Number, default: 1 }
    },
    contactPhone: {
        type: String,
        trim: true
    },
    totalBeds: {
        type: Number,
        default: 20
    },
    availableBeds: {
        type: Number,
        default: 20
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Department', departmentSchema);
