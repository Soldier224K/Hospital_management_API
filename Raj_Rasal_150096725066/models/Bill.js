const mongoose = require('mongoose');

const billItemSchema = new mongoose.Schema({
    description: { type: String, required: true, trim: true },
    cost: { type: Number, required: true, min: 0 }
}, { _id: false });

const billSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: [true, 'Patient reference is required']
    },
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        default: null
    },
    items: {
        type: [billItemSchema],
        default: []
    },
    totalAmount: {
        type: Number,
        required: [true, 'Total amount is required'],
        min: 0
    },
    paidAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    paymentStatus: {
        type: String,
        enum: ['Unpaid', 'Partially Paid', 'Paid'],
        default: 'Unpaid'
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Insurance', 'Pending'],
        default: 'Pending'
    },
    invoiceNumber: {
        type: String,
        unique: true,
        default: () => 'INV-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000)
    },
    issueDate: {
        type: Date,
        default: Date.now
    },
    paidDate: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Bill', billSchema);
