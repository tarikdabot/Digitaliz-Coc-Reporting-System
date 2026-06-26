# Digitaliz CoC Reporting System — MERN Stack

Migrated from the static HTML portal to a full MERN (MongoDB, Express, React, Node.js) architecture.

## Project Structure

```
Digitaliz-Coc-Reporting-System/
├── client/                   # React.js Frontend
│   ├── public/index.html
│   └── src/
│       ├── api/axios.js      # Axios instance with JWT interceptors
│       ├── context/
│       │   ├── AuthContext.js
│       │   ├── CandidatesContext.js   # Global state + derived stats
│       │   └── SettingsContext.js
│       ├── components/
│       │   ├── Layout.js
│       │   ├── Sidebar.js
│       │   ├── Toast.js
│       │   ├── StatusBadge.js
│       │   ├── ConfirmModal.js
│       │   └── CandidateModal.js     # View + Edit candidate
│       ├── pages/
│       │   ├── LoginPage.js
│       │   ├── Dashboard.js          # Live stats + dept matrix
│       │   ├── RegistrationPage.js   # Single + Bulk Excel import
│       │   ├── StudentListPage.js    # Full CRUD + bulk status
│       │   ├── ByDeptPage.js         # Dept filter + bulk status
│       │   ├── StatusPage.js         # Assessed/Registered/Competent/Non-Competent views
│       │   ├── ReportPage.js         # Form A, B, 11, List of Competency (printable)
│       │   └── SettingsPage.js       # Signatures + departments config
│       └── utils/
│           ├── excelExport.js        # xlsx-based export
│           └── toast.js              # Toast notification utility
│
├── server/                   # Express.js + Node.js Backend
│   ├── models/
│   │   ├── Candidate.js      # Mongoose schema with UC auto-logic
│   │   ├── User.js
│   │   └── Settings.js
│   ├── controllers/
│   │   ├── candidateController.js
│   │   ├── authController.js
│   │   └── settingsController.js
│   ├── routes/
│   │   ├── candidateRoutes.js
│   │   ├── authRoutes.js
│   │   └── settingsRoutes.js
│   ├── middleware/authMiddleware.js
│   ├── server.js
│   ├── seed.js               # Seed original 10 candidates + admin
│   └── .env
│
└── package.json              # Root — runs both with concurrently
```

## Prerequisites
- Node.js v18+
- MongoDB (local) — `mongod` running on port 27017
- npm

## Setup & Run

### 1. Install dependencies
```bash
cd Digitaliz-Coc-Reporting-System
npm run install-all
```

### 2. Seed database (optional — loads original 10 candidates)
```bash
node server/seed.js
```

### 3. Start development (both client + server)
```bash
npm run dev
```
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

### First Login
- Username: `admin`  Password: `admin123`
- Or enter any new credentials on the login page to auto-register

## Key Features
- **Real-time reactive state** — CandidatesContext computes dashboard stats on every state change
- **Full CRUD** — Create, Read, Update, Delete candidates
- **Bulk status updates** — Select multiple rows, apply status in one click
- **Status flow** — Registered → Assessed → Competent / Non-Competent
- **Auto UC marks** — Setting status to "Competent" auto-checks all 5 Units of Competency
- **Government forms** — Form A, Form B, Form 11, List of Competency (printable)
- **Excel export** — Export any table view to .xlsx
- **Excel import** — Bulk upload candidates via Excel template
- **JWT authentication** — Secure login/logout
- **Settings** — Configure signatures and departments
