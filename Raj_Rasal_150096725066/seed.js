require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const Doctor = require('./models/Doctor');
const Patient = require('./models/Patient');
const Department = require('./models/Department');
const Appointment = require('./models/Appointment');
const Bill = require('./models/Bill');

const seedData = async () => {
    try {
        await connectDB();

        console.log('Clearing old data...');
        await Doctor.deleteMany();
        await Patient.deleteMany();
        await Department.deleteMany();
        await Appointment.deleteMany();
        await Bill.deleteMany();

        console.log('Inserting Departments...');
        const cardiology = await Department.create({ name: 'Cardiology', description: 'Heart and blood vessel diseases' });
        const neurology = await Department.create({ name: 'Neurology', description: 'Nervous system disorders' });

        console.log('Inserting Doctors...');
        const doc1 = await Doctor.create({
            name: 'Dr. John Smith',
            specialization: 'Cardiologist',
            qualification: 'MD, FACC',
            experienceYears: 15,
            email: 'john.smith@hospital.com',
            phone: '555-0101',
            department: cardiology.name,
            consultationFee: 150
        });

        const doc2 = await Doctor.create({
            name: 'Dr. Sarah Connor',
            specialization: 'Neurologist',
            qualification: 'MD, PhD',
            experienceYears: 10,
            email: 'sarah.connor@hospital.com',
            phone: '555-0102',
            department: neurology.name,
            consultationFee: 200
        });

        // Update department heads
        cardiology.headDoctor = doc1._id;
        neurology.headDoctor = doc2._id;
        await cardiology.save();
        await neurology.save();

        console.log('Inserting Patients...');
        const pat1 = await Patient.create({
            name: 'Alice Johnson',
            age: 45,
            gender: 'Female',
            bloodGroup: 'A+',
            phone: '555-0201',
            email: 'alice.j@example.com',
            medicalHistory: [{ condition: 'Hypertension' }]
        });

        console.log('Inserting Appointments...');
        const appointment = await Appointment.create({
            patient: pat1._id,
            doctor: doc1._id,
            department: doc1.department,
            appointmentDate: new Date(Date.now() + 86400000), // Tomorrow
            timeSlot: '10:00 AM',
            reasonForVisit: 'Routine checkup',
            consultationFee: doc1.consultationFee,
            status: 'Scheduled'
        });

        console.log('Inserting Bills...');
        await Bill.create({
            patient: pat1._id,
            appointment: appointment._id,
            items: [{ description: 'Consultation Fee', cost: doc1.consultationFee }],
            totalAmount: doc1.consultationFee,
            paymentStatus: 'Unpaid'
        });

        console.log('Data seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
