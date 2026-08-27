# Hospital Management REST API

A robust REST API built with Node.js, Express, and MongoDB (Mongoose) for managing hospital operations including Doctors, Patients, Appointments, Departments, Hospitals, and Billing.

## 🌐 Live Deployment
- **Live Base URL:** [https://hospital-management-api-2.onrender.com](https://hospital-management-api-2.onrender.com)
- **Health Check:** [https://hospital-management-api-2.onrender.com/health](https://hospital-management-api-2.onrender.com/health)

---

## 🚀 Setup & Installation (Local)

1. Clone the repository and navigate to the project directory:
   ```bash
   cd assignment2/Raj_Rasal_150096725066
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env` and set your `MONGO_URI` and `PORT`.

4. Seed the database with initial data (Optional):
   ```bash
   npm run seed
   ```

5. Start the server:
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```
   The API will be running locally at `http://localhost:5001`.

---

## 📡 API Endpoints

### 🩺 Doctors (`/api/doctors`)
- `GET /api/doctors` - Get all doctors (supports query filters: `?specialization=...&department=...&isAvailable=true&search=...`)
- `GET /api/doctors/specializations` - Get list of unique specializations
- `GET /api/doctors/:id` - Get doctor by ID
- `GET /api/doctors/:id/appointments` - Get all appointments for a specific doctor
- `POST /api/doctors` - Register a new doctor
- `PUT /api/doctors/:id` - Update doctor profile
- `PATCH /api/doctors/:id/availability` - Toggle doctor availability status
- `DELETE /api/doctors/:id` - Remove doctor record

### 🤒 Patients (`/api/patients`)
- `GET /api/patients` - Get all patients (supports filters: `?search=...&bloodGroup=...&admissionStatus=...`)
- `GET /api/patients/:id` - Get patient details
- `GET /api/patients/:id/appointments` - Get appointment history for a patient
- `GET /api/patients/:id/bills` - Get billing history for a patient
- `POST /api/patients` - Register a new patient
- `PUT /api/patients/:id` - Update patient details
- `POST /api/patients/:id/medical-history` - Add a medical condition/history entry
- `PATCH /api/patients/:id/admission` - Update admission status (`Outpatient`, `Admitted`, `Discharged`)
- `DELETE /api/patients/:id` - Remove patient record

### 📅 Appointments (`/api/appointments`)
- `GET /api/appointments` - Get all appointments (supports filters: `?status=...&doctorId=...&patientId=...&date=...`)
- `GET /api/appointments/:id` - Get appointment by ID
- `POST /api/appointments` - Book a new appointment
- `PUT /api/appointments/:id` - Update / reschedule appointment
- `PATCH /api/appointments/:id/status` - Update status (`Scheduled`, `In-Progress`, `Completed`, `Cancelled`)
- `POST /api/appointments/:id/prescriptions` - Add prescription to appointment
- `DELETE /api/appointments/:id` - Cancel and delete appointment

### 🏥 Departments (`/api/departments`)
- `GET /api/departments` - List all hospital departments
- `GET /api/departments/:id` - Get department details and doctors in the department
- `POST /api/departments` - Add a new department
- `PUT /api/departments/:id` - Update department details
- `DELETE /api/departments/:id` - Remove department

### 🏨 Hospitals (`/api/hospitals`)
- `GET /api/hospitals` - List all hospital branches
- `GET /api/hospitals/:id` - Get hospital branch by ID
- `POST /api/hospitals` - Create a new hospital branch (`name`, `city`, `totalBeds`, `availableBeds`)
- `PUT /api/hospitals/:id` - Update hospital branch details
- `DELETE /api/hospitals/:id` - Delete hospital branch

### 💳 Billing (`/api/bills`)
- `GET /api/bills` - List all bills (supports `?paymentStatus=...&patientId=...`)
- `GET /api/bills/:id` - Get bill details
- `POST /api/bills` - Generate a new patient invoice
- `PATCH /api/bills/:id/pay` - Record a payment towards a bill
- `DELETE /api/bills/:id` - Delete bill record

---

## 🛠️ Technologies Used
- **Node.js** & **Express.js**
- **MongoDB** & **Mongoose** (MongoDB Atlas)
- **CORS**
- **dotenv**
