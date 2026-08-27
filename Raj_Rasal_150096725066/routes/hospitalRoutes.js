const express = require('express');
const router = express.Router();
const Hospital = require('../models/Hospital');

// @route   GET /api/hospitals
// @desc    Get all hospitals
router.get('/', async (req, res) => {
    try {
        const hospitals = await Hospital.find().sort({ name: 1 });
        res.json({
            success: true,
            count: hospitals.length,
            data: hospitals
        });
    } catch (err) {
        console.error('Error fetching hospitals:', err.message);
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

// @route   GET /api/hospitals/:id
// @desc    Get hospital by ID
router.get('/:id', async (req, res) => {
    try {
        const hospital = await Hospital.findById(req.params.id);
        if (!hospital) {
            return res.status(404).json({ success: false, message: 'Hospital not found' });
        }
        res.json({ success: true, data: hospital });
    } catch (err) {
        console.error('Error fetching hospital:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'Hospital not found' });
        }
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

// @route   POST /api/hospitals
// @desc    Create a new hospital
router.post('/', async (req, res) => {
    try {
        const { name, city, totalBeds, availableBeds } = req.body;

        if (!name || !city || totalBeds === undefined || availableBeds === undefined) {
            return res.status(400).json({ success: false, message: 'Please provide name, city, totalBeds, and availableBeds' });
        }

        const newHospital = new Hospital({
            name,
            city,
            totalBeds,
            availableBeds
        });

        const savedHospital = await newHospital.save();
        res.status(201).json({
            success: true,
            message: 'Hospital created successfully',
            data: savedHospital
        });
    } catch (err) {
        console.error('Error creating hospital:', err.message);
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

// @route   PUT /api/hospitals/:id
// @desc    Update hospital details
router.put('/:id', async (req, res) => {
    try {
        let hospital = await Hospital.findById(req.params.id);
        if (!hospital) {
            return res.status(404).json({ success: false, message: 'Hospital not found' });
        }

        hospital = await Hospital.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Hospital updated successfully',
            data: hospital
        });
    } catch (err) {
        console.error('Error updating hospital:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'Hospital not found' });
        }
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

// @route   DELETE /api/hospitals/:id
// @desc    Delete hospital
router.delete('/:id', async (req, res) => {
    try {
        const hospital = await Hospital.findById(req.params.id);
        if (!hospital) {
            return res.status(404).json({ success: false, message: 'Hospital not found' });
        }

        await Hospital.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Hospital deleted successfully' });
    } catch (err) {
        console.error('Error deleting hospital:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'Hospital not found' });
        }
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

module.exports = router;
