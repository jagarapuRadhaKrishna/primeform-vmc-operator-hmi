# Primeform VMC Operator HMI

A modern, responsive, high-precision **Vertical Machining Center (VMC) Operator Human-Machine Interface (HMI)** designed for CNC machining workflow guidance and cycle execution.

---

## 🚀 Overview

The **Primeform VMC Operator HMI** guides machinists through a strict 5-stage sequential workflow:

$$\text{POWER ON} \longrightarrow \text{01 MACHINE CHECKS} \longrightarrow \text{02 REQUIRED TOOLS} \longrightarrow \text{03 WORKPIECE SETUP} \longrightarrow \text{04 READY REVIEW} \longrightarrow \text{05 OPERATION}$$

Each screen displays only the relevant actions and telemetry for the active stage, enforcing stage-gate safety checks before advancing to cutting operations.

---

## 🛠️ Machining Scenario

- **Machine ID:** `VMC-01`
- **Controller:** `FANUC 0i-MF Plus`
- **Operation:** Pocket Machining
- **Part Quantity:** 10 Pieces
- **Material:** Aluminium 6061
- **Drawing:** `DWG-VM-1024` (Rev B)
- **CNC Program:** `O1024` (Rev 03)
- **Fixture:** 3-Jaw Fixture
- **Work Offset:** `G54`
- **Tooling Magazine:**
  - **T01:** Ø10 mm Face Mill (BT40-FMB22-45 | 6000 RPM | 1500 mm/min)
  - **T02:** Ø8 mm End Mill (BT40-ER32-70 | 8000 RPM | 1200 mm/min)
  - **T03:** Ø6 mm End Mill (BT40-ER32-70 | 9000 RPM | 1000 mm/min)
  - **T04:** Ø5 mm Drill (BT40-ER25-60 | 3800 RPM | 450 mm/min)

---

## 📁 Architecture & Tech Stack

```
primeform-vmc-operator-hmi/
├── client/                     # Frontend (React 19 + Vite + Tailwind CSS + Lucide)
│   ├── src/
│   │   ├── components/         # HmiHeader, StageProgress
│   │   ├── stages/             # Stage1MachineChecks .. Stage5Operation
│   │   ├── services/           # Axios API Client
│   │   ├── App.jsx             # Main HMI Container & State Orchestration
│   │   └── index.css           # Industrial Design System Tokens
│   └── package.json
├── server/                     # Backend (Node.js + Express + SQLite / MySQL)
│   ├── database.js             # Schema definition & auto-seeding
│   ├── server.js               # REST API Endpoints & State Gate Validation
│   ├── test-api.js             # Automated API test suite
│   └── package.json
└── README.md
```

- **Frontend:** React 19, Vite, Tailwind CSS, Lucide React icons
- **Backend:** Node.js, Express.js
- **Persistence:** SQLite (`better-sqlite3`) / MySQL (`mysql2`)
- **Design System:** High-contrast dark industrial theme (`#080c14`), tactical HUD badges, LED indicators, and full-viewport non-scrolling layouts.

---

## ⚡ Quick Start

### 1. Prerequisites
- Node.js (v18+)
- npm (v9+)

### 2. Backend Setup & Run
```bash
cd server
npm install
npm start
```
The backend will start at `http://localhost:5000`.

### 3. Frontend Setup & Run
```bash
cd ../client
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Testing

To run the automated backend test suite:
```bash
cd server
node test-api.js
```
Runs 15 verification tests covering state-gate enforcement, check confirmation, tool verification, workpiece registration, and cycle state machines.

---

## 📜 License

MIT License. Designed and developed for Primeform VMC Machining Operations.
