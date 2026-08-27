require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Route imports
const doctorRoutes = require('./routes/doctorRoutes');
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const billRoutes = require('./routes/billRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');

// Initialize app
const app = express();

// Connect Database
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// Welcome / Index Route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🏥 Welcome to the Hospital Management REST API',
        version: '1.0.0',
        documentation: {
            doctors: '/api/doctors',
            patients: '/api/patients',
            appointments: '/api/appointments',
            departments: '/api/departments',
            bills: '/api/bills',
            hospitals: '/api/hospitals'
        },
        healthCheck: '/health'
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Mount Routes
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/hospitals', hospitalRoutes);

// 404 Handler for undefined routes
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Endpoint ${req.originalUrl} not found on this server`
    });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'production' ? {} : err.stack
    });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`🚀 Hospital Management API server running on port ${PORT}`);
    console.log(`📡 Local URL: http://localhost:${PORT}`);
});

module.exports = { app, server };
