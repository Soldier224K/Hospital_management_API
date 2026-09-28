# 🏥 Assignment 02: Hospital Management REST API
> **Track:** Backend Development | **Level:** Beginner to Intermediate | **Estimated Time:** 5–7 Hours  
> **Tech Stack:** Node.js, Express.js, MongoDB (Local/Mongoose), Passport.js, bcryptjs, Express-Session

---

## 📌 1. Objective & Overview

Build a production-structured RESTful API for managing Hospital records, bed availability, and user authentication using **Node.js, Express.js, MongoDB, and Mongoose**. Students will learn database connectivity, Mongoose ODM schemas, indexing, validation, and session authentication with Passport.js backed by persistent database storage.

### Key Learning Outcomes:
- Connecting Express.js to a local or hosted MongoDB database using Mongoose.
- Designing schema definitions with built-in data types, validation, and defaults.
- Performing asynchronous database queries using `async/await` and robust `try/catch` error blocks.
- Integrating Passport.js authentication with a real MongoDB `User` model.
- Managing resource availability and filtering data using MongoDB query operators (`$gt`, `$regex`, etc.).

---

## 🛠️ 2. Tech Stack & Dependencies

```bash
# Initialize project
npm init -y

# Install dependencies
npm install express mongoose bcryptjs passport passport-local express-session dotenv

# Install development dependencies
npm install -D nodemon
```

---

## 🗄️ 3. Database Schemas (Mongoose Models)

### 🏥 Hospital Model (`models/Hospital.js`)
```javascript
const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hospital name is required'],
    trim: true,
    unique: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  totalBeds: {
    type: Number,
    required: [true, 'Total beds count is required'],
    min: [1, 'Total beds must be at least 1']
  },
  availableBeds: {
    type: Number,
    required: [true, 'Available beds count is required'],
    validate: {
      validator: function(val) {
        return val <= this.totalBeds;
      },
      message: 'Available beds cannot exceed total beds'
    }
  },
  contactNumber: {
    type: String,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Hospital', hospitalSchema);
```

### 👤 User Model (`models/User.js`)
```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
```

---

## 📋 4. API Endpoints Specification

### 🔐 Authentication Endpoints

| Method | Endpoint | Description | Request Body Example | Status Codes |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user & save to MongoDB (hash password) | `{"username":"dr_smith","email":"smith@hospital.org","password":"secretPass123"}` | `201 Created`<br>`400 Bad Request` |
| `POST` | `/api/auth/login` | Authenticate using Passport Local strategy | `{"username":"dr_smith","password":"secretPass123"}` | `200 OK`<br>`401 Unauthorized` |
| `POST` | `/api/auth/logout` | Terminate session | None | `200 OK` |
| `GET` | `/api/auth/me` | Get profile of logged-in user | None | `200 OK`<br>`401 Unauthorized` |

### 🏥 Hospital Management Endpoints

| Method | Endpoint | Description | Request Body / Query Params | Status Codes |
|---|---|---|---|---|
| `GET` | `/` | API Health Check route | Returns `{ "message": "Welcome to Hospital Management API" }` | `200 OK` |
| `GET` | `/api/hospitals` | Fetch all hospitals (supports search & filter) | `?city=Delhi&minBeds=10` | `200 OK`<br>`500 Server Error` |
| `GET` | `/api/hospitals/available` | Get only hospitals with available beds (`availableBeds > 0`) | None | `200 OK` |
| `GET` | `/api/hospitals/:id` | Get single hospital by MongoDB `_id` | None | `200 OK`<br>`404 Not Found`<br>`400 Invalid ID` |
| `POST` | `/api/hospitals` | Add a new hospital record to MongoDB | `{"name":"Apollo Hospital","city":"Delhi","totalBeds":150,"availableBeds":32}` | `201 Created`<br>`400 Bad Request` |
| `PUT` | `/api/hospitals/:id` | Update hospital details or adjust bed counts | `{"availableBeds":28}` | `200 OK`<br>`404 Not Found` |
| `DELETE` | `/api/hospitals/:id` | Delete a hospital record from MongoDB | None | `200 OK`<br>`404 Not Found` |

---

## 🏗️ 5. Project Folder Architecture

```text
assignment-02-hospital-api/
├── config/
│   ├── db.js                # MongoDB Mongoose connection handler
│   └── passport.js          # Passport local strategy using Mongoose User model
├── controllers/
│   ├── authController.js    # Registration and session authentication logic
│   └── hospitalController.js# Hospital CRUD & business queries logic
├── middleware/
│   ├── authMiddleware.js    # Protect hospital mutation routes
│   ├── errorMiddleware.js   # Global express error handler
│   └── loggerMiddleware.js  # Request logger middleware
├── models/
│   ├── Hospital.js          # Hospital Mongoose schema
│   └── User.js              # User Mongoose schema with bcrypt integration
├── routes/
│   ├── authRoutes.js        # Authentication endpoints
│   └── hospitalRoutes.js    # Hospital endpoints
├── .env.example             # MONGO_URI, PORT, SESSION_SECRET
├── .gitignore
├── package.json
├── server.js                # Entry point
└── README.md
```

---

## ⚙️ 6. Core Implementation Highlights

### MongoDB Connection (`config/db.js`):
```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_db');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### Available Beds Route Logic (`controllers/hospitalController.js`):
```javascript
exports.getAvailableHospitals = async (req, res, next) => {
  try {
    const hospitals = await Hospital.find({ availableBeds: { $gt: 0 } }).sort({ availableBeds: -1 });
    res.status(200).json({
      success: true,
      count: hospitals.length,
      data: hospitals
    });
  } catch (error) {
    next(error);
  }
};
```

---

## 🧪 7. Postman & Testing Guide

1. Ensure MongoDB daemon is running locally (`mongod`) or provide your connection string in `.env`.
2. Seed initial data by running a test script or via Postman POST requests.
3. Verify that adding a hospital with `availableBeds > totalBeds` returns a `400 Bad Request` with custom validation message.
4. Test `/api/hospitals/available` to confirm hospitals with `availableBeds == 0` are excluded.

---

## 🌟 8. Extra Challenge Tasks (Bonus)

- **Bed Allocation Transaction**: Implement `PATCH /api/hospitals/:id/admit` and `PATCH /api/hospitals/:id/discharge` to atomically increment/decrement `availableBeds`.
- **Geographic Distance / City Grouping**: Add an aggregate endpoint `/api/hospitals/stats/by-city` using MongoDB Aggregation Pipeline (`$group` by city).

---

## 📊 9. Grading Rubric (100 Marks)

| Criteria | Marks |
|---|:---:|
| **MongoDB & Mongoose Schema Architecture** (Validations, indexes, unique constraints) | 25 |
| **Complete Hospital CRUD Operations** (Including `/hospitals/available`) | 25 |
| **Passport-Local Authentication & Sessions** (User registration, secure password hashing) | 20 |
| **Error Handling & HTTP Status Codes** (Proper 201, 400, 404, 500 responses) | 15 |
| **Code Modularity & Folder Cleanliness** (MVC structure, clean config separation) | 15 |
| **Total Marks** | **100** |

---

## 📤 10. Submission Guidelines

1. Push your solution to a GitHub repository: `itm-assignment-02-hospital-api`.
2. Include `.env.example` with instructions on how to start the app.
3. Export and attach your Postman collection file in the repo.
