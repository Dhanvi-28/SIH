# OptiFreight — Smart Farmer Procurement Management System

**Theme / Ministry:** Ministry of Consumer Affairs, Food & Public Distribution  
**System Name:** OptiFreight

---

## 🌾 Project Vision & Core Impact

OptiFreight is a full-stack digital platform designed to eliminate long waiting times, uncertain procurement schedules, and overcrowding at agricultural procurement centers.

> **SMART PROCUREMENT = LESS WAITING + BETTER CAPACITY + MORE TRANSPARENCY**

---

## 🚀 Key Modules & Architecture

1. **BOOK (Farmer Booking)**: 4-step guided booking wizard with produce selection, capacity checking, and instant digital token generation (`KPC-041`).
2. **AI PREDICT (Waiting-Time Engine)**: Scikit-learn Random Forest regression model predicting waiting times, confidence intervals, and explainable factor impacts based on live queue, volume in tons, active counters, and hourly turnaround.
3. **ALLOCATE (Smart Slot Allocation)**: Multi-factor scoring algorithm ranking available slots to prevent center overload and bottlenecks.
4. **PROCURE (Center Workflow Command Center)**: Gate token verification, moisture % inspection, weighbridge recording, accept/reject decision, and direct payment payout trigger.
5. **TRACK (Procurement Status & Payment Timeline)**: Live vertical timeline tracking produce from arrival to bank payout.

---

## 🔑 Seeded Demo Credentials

| Role | Name | Login / Phone | Password |
|---|---|---|---|
| **Farmer** | Ramesh Kumar | `9876543210` | `farmer123` |
| **Official** | Suresh Gowda (Procurement Officer) | `official@procurement.gov` | `official123` |
| **Admin** | Dr. Anita Rao (State Administrator) | `admin@procurement.gov` | `admin123` |

---

## 🛠️ Requirements & Tech Stack

- **Node.js**: v18.x or v20.x or v22.x
- **Python**: 3.10+ (for FastAPI & Scikit-learn ML service)
- **Database**: SQLite (Zero-config local database via Prisma ORM)
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts

---

## 🏃 Step-by-Step Instructions to Setup & Run

### 1. Clone & Install Dependencies

In the root project folder:

```bash
# Install root monorepo dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

---

### 2. Setup Database & Seed Initial Data

Run the Prisma migration and seed script to generate SQLite database `backend/prisma/dev.db` pre-populated with 5 procurement centers, MSP crop rates, schedules, live queue entries, and 120+ historical ML logs:

```bash
cd backend
npx prisma migrate dev --name init
npx prisma db seed
cd ..
```

---

### 3. (Optional) Run Python AI / ML Service

If you wish to run the standalone Python Scikit-learn ML service:

```bash
# Install Python dependencies
pip install -r ml-service/requirements.txt

# Run Python FastAPI server on http://localhost:8000
python ml-service/run.py
```

*(Note: If the Python service is not running, the Express backend automatically uses its built-in TypeScript ML regression engine fallback, ensuring 100% functionality out-of-the-box!)*

---

### 4. Start Development Servers

You can launch both Backend and Frontend concurrently from the root directory:

```bash
# Start backend and frontend simultaneously
npm run dev
```

Or start them individually in separate terminals:

**Backend Server (Port 5000):**
```bash
cd backend
npm run dev
```

**Frontend React App (Port 5173):**
```bash
cd frontend
npm run dev
```

---

## 🎯 Step-by-Step Demo Acceptance Story

1. Open `http://localhost:5173` in your browser.
2. Click **"Demo as Farmer Ramesh"** or login with `9876543210` / `farmer123`.
3. Observe **Token KPC-041** for 24 Tons of Rice at Mandya Central Center.
4. Click **"Token & Live Queue"** to view position #7, 6 farmers ahead, and AI estimated wait time of 42 mins with confidence and factor analysis.
5. Use the floating **Interactive Demo Control Toolbar** at the bottom:
   - Click **"Official"** role or switch to Official view.
   - Click **"Verify Arrival"** for token `KPC-041`.
   - Click **"Inspection & Payout"** for token `KPC-041`.
   - Fill Moisture (12%), Quality Grade (A), click **"ACCEPT Produce"**.
   - Enter Weight (23.6 Tons), click **"Record Weighing"**.
   - Click **"Trigger Direct Bank Payout"** to disburse ₹54,000 net payout.
6. Switch back to **Farmer** view to see the live vertical timeline update to **Payment Completed**!
