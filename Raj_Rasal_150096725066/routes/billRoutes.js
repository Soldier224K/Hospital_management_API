const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');

// @route   GET /api/bills
// @desc    Get all bills with optional filtering
router.get('/', async (req, res) => {
    try {
        const { paymentStatus, patientId } = req.query;
        let query = {};

        if (paymentStatus) {
            query.paymentStatus = paymentStatus;
        }
        if (patientId) {
            query.patient = patientId;
        }

        const bills = await Bill.find(query)
            .populate('patient', 'name phone email')
            .populate('appointment', 'appointmentDate reasonForVisit doctor')
            .sort({ issueDate: -1 });

        res.json({
            success: true,
            count: bills.length,
            data: bills
        });
    } catch (err) {
        console.error('Error fetching bills:', err.message);
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

// @route   GET /api/bills/:id
// @desc    Get bill details by ID
router.get('/:id', async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.id)
            .populate('patient', 'name phone email address')
            .populate({
                path: 'appointment',
                populate: { path: 'doctor', select: 'name specialization' }
            });

        if (!bill) {
            return res.status(404).json({ success: false, message: 'Bill not found' });
        }

        res.json({ success: true, data: bill });
    } catch (err) {
        console.error('Error fetching bill:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'Bill not found' });
        }
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

// @route   POST /api/bills
// @desc    Generate a new bill
router.post('/', async (req, res) => {
    try {
        const { patientId, appointmentId, items, totalAmount, paidAmount, paymentMethod } = req.body;

        if (!patientId) {
            return res.status(400).json({ success: false, message: 'Patient ID is required' });
        }

        const patient = await Patient.findById(patientId);
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        // Calculate total amount from items if not provided
        let calculatedTotal = totalAmount;
        if (!calculatedTotal && items && items.length > 0) {
            calculatedTotal = items.reduce((acc, item) => acc + (Number(item.cost) || 0), 0);
        }

        if (calculatedTotal === undefined || calculatedTotal < 0) {
            return res.status(400).json({ success: false, message: 'Valid totalAmount or items with costs are required' });
        }

        const initialPaid = Number(paidAmount) || 0;
        let status = 'Unpaid';
        if (initialPaid >= calculatedTotal) {
            status = 'Paid';
        } else if (initialPaid > 0) {
            status = 'Partially Paid';
        }

        const newBill = new Bill({
            patient: patientId,
            appointment: appointmentId || null,
            items: items || [],
            totalAmount: calculatedTotal,
            paidAmount: initialPaid,
            paymentStatus: status,
            paymentMethod: paymentMethod || 'Pending',
            paidDate: status === 'Paid' ? new Date() : null
        });

        const savedBill = await newBill.save();
        const populated = await Bill.findById(savedBill._id).populate('patient', 'name phone');

        res.status(201).json({
            success: true,
            message: 'Invoice generated successfully',
            data: populated
        });
    } catch (err) {
        console.error('Error generating bill:', err.message);
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

// @route   PATCH /api/bills/:id/pay
// @desc    Record payment for a bill
router.patch('/:id/pay', async (req, res) => {
    try {
        const { amount, paymentMethod } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Valid payment amount is required' });
        }

        const bill = await Bill.findById(req.params.id);
        if (!bill) {
            return res.status(404).json({ success: false, message: 'Bill not found' });
        }

        bill.paidAmount = (bill.paidAmount || 0) + Number(amount);
        if (paymentMethod) {
            bill.paymentMethod = paymentMethod;
        }

        if (bill.paidAmount >= bill.totalAmount) {
            bill.paymentStatus = 'Paid';
            bill.paidDate = new Date();
        } else {
            bill.paymentStatus = 'Partially Paid';
        }

        await bill.save();

        res.json({
            success: true,
            message: `Payment of $${amount} recorded. New status: ${bill.paymentStatus}`,
            data: bill
        });
    } catch (err) {
        console.error('Error processing payment:', err.message);
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

// @route   DELETE /api/bills/:id
// @desc    Delete bill record
router.delete('/:id', async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.id);
        if (!bill) {
            return res.status(404).json({ success: false, message: 'Bill not found' });
        }

        await Bill.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Bill record deleted successfully' });
    } catch (err) {
        console.error('Error deleting bill:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'Bill not found' });
        }
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

module.exports = router;
