const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

// @route   GET /api/doctors/specializations
// @desc    Get list of unique specializations
router.get('/specializations', async (req, res) => {
    try {
        const specializations = await Doctor.distinct('specialization');
        res.json({ success: true, count: specializations.length, data: specializations });
    } catch (err) {
        console.error('Error fetching specializations:', err.message);
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

// @route   GET /api/doctors
// @desc    Get all doctors with optional filters (specialization, department, isAvailable, search)
router.get('/', async (req, res) => {
    try {
        const { specialization, department, isAvailable, search } = req.query;
        let query = {};

        if (specialization) {
            query.specialization = new RegExp(specialization, 'i');
        }
        if (department) {
            query.department = new RegExp(department, 'i');
        }
        if (isAvailable !== undefined) {
            query.isAvailable = isAvailable === 'true';
        }
        if (search) {
            query.$or = [
                { name: new RegExp(search, 'i') },
                { specialization: new RegExp(search, 'i') },
                { department: new RegExp(search, 'i') }
            ];
        }

        const doctors = await Doctor.find(query).sort({ createdAt: -1 });
        res.json({
            success: true,
            count: doctors.length,
            data: doctors
        });
    } catch (err) {
        console.error('Error fetching doctors:', err.message);
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

// @route   GET /api/doctors/:id
// @desc    Get doctor by ID
router.get('/:id', async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }
        res.json({ success: true, data: doctor });
    } catch (err) {
        console.error('Error fetching doctor:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

// @route   GET /api/doctors/:id/appointments
// @desc    Get all appointments for a specific doctor
router.get('/:id/appointments', async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }

        const appointments = await Appointment.find({ doctor: req.params.id })
            .populate('patient', 'name age gender phone bloodGroup')
            .sort({ appointmentDate: 1 });

        res.json({
            success: true,
            doctor: { id: doctor._id, name: doctor.name, specialization: doctor.specialization },
            count: appointments.length,
            data: appointments
        });
    } catch (err) {
        console.error('Error fetching doctor appointments:', err.message);
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

// @route   POST /api/doctors
// @desc    Register a new doctor
router.post('/', async (req, res) => {
    try {
        const {
            name,
            specialization,
            qualification,
            experienceYears,
            email,
            phone,
            department,
            consultationFee,
            isAvailable,
            availableDays,
            workingHours
        } = req.body;

        if (!name || !specialization || !qualification || experienceYears === undefined || !email || !phone || !department || consultationFee === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields (name, specialization, qualification, experienceYears, email, phone, department, consultationFee)'
            });
        }

        const existingDoctor = await Doctor.findOne({ email: email.toLowerCase() });
        if (existingDoctor) {
            return res.status(400).json({ success: false, message: 'Doctor with this email already exists' });
        }

        const newDoctor = new Doctor({
            name,
            specialization,
            qualification,
            experienceYears,
            email,
            phone,
            department,
            consultationFee,
            isAvailable: isAvailable !== undefined ? isAvailable : true,
            availableDays,
            workingHours
        });

        const savedDoctor = await newDoctor.save();
        res.status(201).json({ success: true, message: 'Doctor registered successfully', data: savedDoctor });
    } catch (err) {
        console.error('Error creating doctor:', err.message);
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

// @route   PUT /api/doctors/:id
// @desc    Update doctor profile
router.put('/:id', async (req, res) => {
    try {
        let doctor = await Doctor.findById(req.params.id);
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }

        doctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        res.json({ success: true, message: 'Doctor updated successfully', data: doctor });
    } catch (err) {
        console.error('Error updating doctor:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

// @route   PATCH /api/doctors/:id/availability
// @desc    Toggle or set doctor availability
router.patch('/:id/availability', async (req, res) => {
    try {
        const { isAvailable } = req.body;
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }

        doctor.isAvailable = isAvailable !== undefined ? isAvailable : !doctor.isAvailable;
        await doctor.save();

        res.json({
            success: true,
            message: `Doctor availability updated to ${doctor.isAvailable}`,
            data: doctor
        });
    } catch (err) {
        console.error('Error changing availability:', err.message);
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

// @route   DELETE /api/doctors/:id
// @desc    Delete doctor record
router.delete('/:id', async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }

        await Doctor.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Doctor record removed successfully' });
    } catch (err) {
        console.error('Error deleting doctor:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

module.exports = router;
