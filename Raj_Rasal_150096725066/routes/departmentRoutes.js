const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const Doctor = require('../models/Doctor');

// @route   GET /api/departments
// @desc    Get all departments
router.get('/', async (req, res) => {
    try {
        const departments = await Department.find()
            .populate('headDoctor', 'name specialization phone email')
            .sort({ name: 1 });

        res.json({
            success: true,
            count: departments.length,
            data: departments
        });
    } catch (err) {
        console.error('Error fetching departments:', err.message);
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

// @route   GET /api/departments/:id
// @desc    Get department by ID including doctors in department
router.get('/:id', async (req, res) => {
    try {
        const department = await Department.findById(req.params.id)
            .populate('headDoctor', 'name specialization qualification phone email');

        if (!department) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }

        const doctors = await Doctor.find({ department: new RegExp(`^${department.name}$`, 'i') });

        res.json({
            success: true,
            data: department,
            doctorsCount: doctors.length,
            doctors
        });
    } catch (err) {
        console.error('Error fetching department:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

// @route   POST /api/departments
// @desc    Create a new department
router.post('/', async (req, res) => {
    try {
        const { name, description, headDoctor, location, contactPhone, totalBeds } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Department name is required' });
        }

        const existing = await Department.findOne({ name: new RegExp(`^${name}$`, 'i') });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Department already exists' });
        }

        const newDepartment = new Department({
            name,
            description,
            headDoctor: headDoctor || null,
            location: location || { building: 'Main Wing', floor: 1 },
            contactPhone,
            totalBeds: totalBeds !== undefined ? totalBeds : 20,
            availableBeds: totalBeds !== undefined ? totalBeds : 20
        });

        const savedDepartment = await newDepartment.save();
        res.status(201).json({
            success: true,
            message: 'Department created successfully',
            data: savedDepartment
        });
    } catch (err) {
        console.error('Error creating department:', err.message);
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

// @route   PUT /api/departments/:id
// @desc    Update department
router.put('/:id', async (req, res) => {
    try {
        let department = await Department.findById(req.params.id);
        if (!department) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }

        department = await Department.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Department updated successfully',
            data: department
        });
    } catch (err) {
        console.error('Error updating department:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

// @route   DELETE /api/departments/:id
// @desc    Delete department
router.delete('/:id', async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);
        if (!department) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }

        await Department.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Department deleted successfully' });
    } catch (err) {
        console.error('Error deleting department:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

module.exports = router;
