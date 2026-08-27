const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

// @route   GET /api/appointments
// @desc    Get all appointments with optional filters (status, doctorId, patientId, date)
router.get('/', async (req, res) => {
    try {
        const { status, doctorId, patientId, date } = req.query;
        let query = {};

        if (status) {
            query.status = status;
        }
        if (doctorId) {
            query.doctor = doctorId;
        }
        if (patientId) {
            query.patient = patientId;
        }
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            query.appointmentDate = { $gte: startOfDay, $lte: endOfDay };
        }

        const appointments = await Appointment.find(query)
            .populate('doctor', 'name specialization qualification phone email department consultationFee')
            .populate('patient', 'name age gender phone bloodGroup admissionStatus')
            .sort({ appointmentDate: -1 });

        res.json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (err) {
        console.error('Error fetching appointments:', err.message);
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

// @route   GET /api/appointments/:id
// @desc    Get appointment details by ID
router.get('/:id', async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('doctor', 'name specialization qualification phone email department consultationFee')
            .populate('patient', 'name age gender phone bloodGroup allergies medicalHistory');

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        res.json({ success: true, data: appointment });
    } catch (err) {
        console.error('Error fetching appointment:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

// @route   POST /api/appointments
// @desc    Book a new appointment
router.post('/', async (req, res) => {
    try {
        const {
            patientId,
            doctorId,
            appointmentDate,
            timeSlot,
            reasonForVisit,
            notes
        } = req.body;

        if (!patientId || !doctorId || !appointmentDate || !timeSlot || !reasonForVisit) {
            return res.status(400).json({
                success: false,
                message: 'Please provide patientId, doctorId, appointmentDate, timeSlot, and reasonForVisit'
            });
        }

        // Verify patient exists
        const patient = await Patient.findById(patientId);
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        // Verify doctor exists
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }

        const newAppointment = new Appointment({
            patient: patientId,
            doctor: doctorId,
            department: doctor.department,
            appointmentDate: new Date(appointmentDate),
            timeSlot,
            reasonForVisit,
            notes: notes || '',
            consultationFee: doctor.consultationFee,
            status: 'Scheduled'
        });

        const savedAppointment = await newAppointment.save();
        const populated = await Appointment.findById(savedAppointment._id)
            .populate('doctor', 'name specialization phone')
            .populate('patient', 'name phone');

        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully',
            data: populated
        });
    } catch (err) {
        console.error('Error booking appointment:', err.message);
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

// @route   PUT /api/appointments/:id
// @desc    Update / Reschedule appointment
router.put('/:id', async (req, res) => {
    try {
        let appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        ).populate('doctor', 'name specialization phone').populate('patient', 'name phone');

        res.json({
            success: true,
            message: 'Appointment updated successfully',
            data: appointment
        });
    } catch (err) {
        console.error('Error updating appointment:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

// @route   PATCH /api/appointments/:id/status
// @desc    Update appointment status ('Scheduled', 'In-Progress', 'Completed', 'Cancelled')
router.patch('/:id/status', async (req, res) => {
    try {
        const { status, diagnosis, notes } = req.body;
        const validStatuses = ['Scheduled', 'In-Progress', 'Completed', 'Cancelled'];

        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Choose from: ${validStatuses.join(', ')}`
            });
        }

        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        appointment.status = status;
        if (diagnosis) appointment.diagnosis = diagnosis;
        if (notes) appointment.notes = notes;

        await appointment.save();

        res.json({
            success: true,
            message: `Appointment status updated to ${status}`,
            data: appointment
        });
    } catch (err) {
        console.error('Error updating appointment status:', err.message);
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

// @route   POST /api/appointments/:id/prescriptions
// @desc    Add prescriptions to an appointment
router.post('/:id/prescriptions', async (req, res) => {
    try {
        const { medicine, dosage, frequency, duration } = req.body;
        if (!medicine || !dosage) {
            return res.status(400).json({
                success: false,
                message: 'Medicine name and dosage are required'
            });
        }

        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        appointment.prescriptions.push({ medicine, dosage, frequency, duration });
        await appointment.save();

        res.json({
            success: true,
            message: 'Prescription added',
            data: appointment.prescriptions
        });
    } catch (err) {
        console.error('Error adding prescription:', err.message);
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

// @route   DELETE /api/appointments/:id
// @desc    Delete/Cancel an appointment
router.delete('/:id', async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        await Appointment.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Appointment deleted successfully' });
    } catch (err) {
        console.error('Error deleting appointment:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

module.exports = router;
