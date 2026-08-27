const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Bill = require('../models/Bill');

// @route   GET /api/patients
// @desc    Get all patients with optional search & filtering
router.get('/', async (req, res) => {
    try {
        const { search, bloodGroup, admissionStatus, gender } = req.query;
        let query = {};

        if (bloodGroup) {
            query.bloodGroup = bloodGroup;
        }
        if (admissionStatus) {
            query.admissionStatus = admissionStatus;
        }
        if (gender) {
            query.gender = gender;
        }
        if (search) {
            query.$or = [
                { name: new RegExp(search, 'i') },
                { phone: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') }
            ];
        }

        const patients = await Patient.find(query).sort({ createdAt: -1 });
        res.json({
            success: true,
            count: patients.length,
            data: patients
        });
    } catch (err) {
        console.error('Error fetching patients:', err.message);
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

// @route   GET /api/patients/:id
// @desc    Get patient by ID
router.get('/:id', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }
        res.json({ success: true, data: patient });
    } catch (err) {
        console.error('Error fetching patient:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

// @route   GET /api/patients/:id/appointments
// @desc    Get all appointment history for a patient
router.get('/:id/appointments', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        const appointments = await Appointment.find({ patient: req.params.id })
            .populate('doctor', 'name specialization qualification consultationFee phone email')
            .sort({ appointmentDate: -1 });

        res.json({
            success: true,
            patient: { id: patient._id, name: patient.name, phone: patient.phone },
            count: appointments.length,
            data: appointments
        });
    } catch (err) {
        console.error('Error fetching patient appointments:', err.message);
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

// @route   GET /api/patients/:id/bills
// @desc    Get all bills for a patient
router.get('/:id/bills', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        const bills = await Bill.find({ patient: req.params.id }).sort({ issueDate: -1 });
        res.json({
            success: true,
            patient: { id: patient._id, name: patient.name },
            count: bills.length,
            data: bills
        });
    } catch (err) {
        console.error('Error fetching patient bills:', err.message);
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

// @route   POST /api/patients
// @desc    Register a new patient
router.post('/', async (req, res) => {
    try {
        const {
            name,
            age,
            gender,
            bloodGroup,
            phone,
            email,
            address,
            emergencyContact,
            allergies,
            medicalHistory,
            admissionStatus
        } = req.body;

        if (!name || age === undefined || !gender || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields (name, age, gender, phone)'
            });
        }

        const newPatient = new Patient({
            name,
            age,
            gender,
            bloodGroup: bloodGroup || 'Unknown',
            phone,
            email,
            address,
            emergencyContact,
            allergies: allergies || [],
            medicalHistory: medicalHistory || [],
            admissionStatus: admissionStatus || 'Outpatient'
        });

        const savedPatient = await newPatient.save();
        res.status(201).json({
            success: true,
            message: 'Patient registered successfully',
            data: savedPatient
        });
    } catch (err) {
        console.error('Error registering patient:', err.message);
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

// @route   PUT /api/patients/:id
// @desc    Update patient details
router.put('/:id', async (req, res) => {
    try {
        let patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        patient = await Patient.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Patient updated successfully',
            data: patient
        });
    } catch (err) {
        console.error('Error updating patient:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

// @route   POST /api/patients/:id/medical-history
// @desc    Append medical history entry to patient
router.post('/:id/medical-history', async (req, res) => {
    try {
        const { condition, diagnosedDate, notes } = req.body;
        if (!condition) {
            return res.status(400).json({ success: false, message: 'Condition name is required' });
        }

        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        patient.medicalHistory.push({
            condition,
            diagnosedDate: diagnosedDate || Date.now(),
            notes: notes || ''
        });

        await patient.save();
        res.json({
            success: true,
            message: 'Medical history updated',
            data: patient.medicalHistory
        });
    } catch (err) {
        console.error('Error adding medical history:', err.message);
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

// @route   PATCH /api/patients/:id/admission
// @desc    Update patient admission status
router.patch('/:id/admission', async (req, res) => {
    try {
        const { admissionStatus } = req.body;
        if (!['Outpatient', 'Admitted', 'Discharged'].includes(admissionStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be Outpatient, Admitted, or Discharged'
            });
        }

        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        patient.admissionStatus = admissionStatus;
        await patient.save();

        res.json({
            success: true,
            message: `Patient admission status updated to ${admissionStatus}`,
            data: patient
        });
    } catch (err) {
        console.error('Error updating admission status:', err.message);
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

// @route   DELETE /api/patients/:id
// @desc    Delete patient record
router.delete('/:id', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        await Patient.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Patient record deleted successfully' });
    } catch (err) {
        console.error('Error deleting patient:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

module.exports = router;
