# 🏥 LiveTrack — Real-Time ER Dashboard

A full-stack, real-time Emergency Room management system built with **React**, **Node.js**, **Socket.IO**, and **MySQL**. Designed to streamline patient intake, triage, staff coordination, and hospital analytics — all updating live across every connected screen.

---

## ✨ Features

### 🔐 Role-Based Access
- **Landing page** with Patient / Staff role selection
- **PIN-authenticated** staff portal (session-guarded routes)
- Patients are redirected to a clean intake form

### 📋 Patient Flow
- Patients register through a premium dark-mode intake form
- Auto-assigned to the live waiting queue
- Staff can **Admit**, **Discharge**, and update **Urgency Levels** in real time

### 📊 Public Dashboard (`/board`)
- **KPI Cards** — Total Waiting, Avg Wait Time, Critical Alerts, Bed Capacity
- **Live Queue Table** — auto-updates via WebSocket
- **Charts** — Demographics donut, Department load bar, 24-hour patient influx area chart
- **Health quotes ticker** at the bottom

### 🛠️ Staff Portal (`/staff`)
- **Liveboard** — Full patient table with Admit/Discharge buttons and urgency dropdowns
- **Team Management** — Add/remove staff, assign doctors/nurses to patients
- **Analytics** — Avg wait by department, status breakdown pie, staff workload, urgency distribution

### ⚡ Real-Time Updates
- Socket.IO broadcasts changes instantly to all connected clients
- No page refresh needed — admissions, discharges, and assignments appear live

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, Recharts, Lucide Icons |
| Backend | Node.js, Express.js, Socket.IO |
| Database | MySQL (mysql2/promise) |
| Auth | Session-based PIN guard (sessionStorage) |

---

## 📂 Project Structure

```
LiveTrack/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── components/      # StaffNav, StaffGuard
│   │   ├── pages/           # Landing, PatientIntake, StaffLiveboard, StaffTeam, StaffAnalytics
│   │   ├── App.jsx          # Public ER Dashboard
│   │   └── main.jsx         # Router config
│   └── ...
├── routes/                  # Express API routes
│   ├── patients.js          # Patient CRUD + analytics
│   └── staff.js             # Staff CRUD + assignments
├── db.js                    # MySQL connection pool + table init
├── server.js                # Express + Socket.IO server
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+)
- **MySQL** (running locally)

### 1. Clone the repo
```bash
git clone https://github.com/asmitdas64-lgtm/LiveTrack.git
cd LiveTrack
```

### 2. Set up the database
```sql
CREATE DATABASE er_dashboard;
```

### 3. Install dependencies
```bash
# Backend
npm install

# Frontend
cd client
npm install
```

### 4. Start the app
```bash
# Terminal 1 — Backend (from root)
node server.js

# Terminal 2 — Frontend (from /client)
npm run dev
```

### 5. Open in browser
- **Landing Page:** http://localhost:5173
- **Staff PIN:** `1234`

---

## 📸 Pages

| Page | URL | Description |
|---|---|---|
| Landing | `/` | Role selection + Staff PIN entry |
| Patient Intake | `/intake` | Admission form |
| Public Dashboard | `/board` | Live ER overview with charts |
| Staff Liveboard | `/staff` | Patient management table |
| Staff Team | `/staff/team` | Staff directory + assignments |
| Staff Analytics | `/staff/analytics` | KPIs + 4 data visualizations |

---

## 🛡️ Security

- Staff routes are protected by a `StaffGuard` component
- Direct URL access to `/staff/*` without PIN authentication redirects to the landing page
- Auth is stored in `sessionStorage` (clears when the tab is closed)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

Built with ☕ and late nights.
