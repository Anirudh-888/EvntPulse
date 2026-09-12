# EvntPulse: Smart Campus & Club Event Intelligence Hub

> **The Next-Generation Campus Event Operating System**  
> Connecting students, clubs, and campus organizers with cryptographic QR ticketing, live audience engagement, and explainable rule-based Event Health Scoring.

---

## 1. Problem Statement & Product Vision

Traditional campus event management is fragmented: flyers get lost, Google Forms lack capacity limits and barcode ticketing, check-ins are handled on paper clipboards, audience engagement during sessions is lost, and organizers have no post-event analytics to improve future attendance.

**EvntPulse** solves this with an integrated event operating system:
- **For Students**: Instant event discovery, single-click RSVP, digital passcards with verifiable QR codes, attendance logs, and interactive live polls.
- **For Organizers**: Streamlined event publishing, real-time camera QR scanning, manual ticket code fallback, live turnout stats, audience voting polls, verified feedback, and an automated **Event Health Score**.
- **For Campus Administration**: Transparent platform oversight, club moderation, and global attendance metrics.

---

## 2. Core Architecture & Stack

### Frontend
- **Framework**: React 18 with Vite (Pure JavaScript, Zero TypeScript)
- **Styling**: Tailwind CSS with custom glassmorphism and modern dark-mode palette
- **Icons**: Lucide React
- **Visualizations**: Recharts (Turnout rates, registration velocity, review distributions)
- **Routing**: React Router DOM v6 with role-based route guards
- **API Client**: Centralized Axios with Bearer JWT interceptors and error normalization
- **QR Scanner**: `html5-qrcode` camera video scanner + manual code input fallback

### Backend
- **Framework**: Python 3.14 + FastAPI (Modular router & service architecture)
- **Database**: SQLite + SQLAlchemy ORM (Clean declarative models prepared for immediate PostgreSQL migration)
- **Security**: JWT (`HS256`), salted password hashing with `bcrypt`
- **QR Generation**: Python `qrcode` + Pillow producing base64 data URLs
- **Documentation**: Automatic interactive Swagger UI at `/docs`

### Intelligence & Event Health Score
- **Deterministic Rule-Based Engine**:
  $$\text{Score} = 0.30 \times \text{Attendance} + 0.25 \times \text{Engagement} + 0.25 \times \text{Rating} + 0.20 \times \text{Feedback Participation}$$
- Clamped between $0$ and $100$ with classifications:
  - **90–100**: *Excellent*
  - **75–89**: *Strong*
  - **60–74**: *Needs Improvement*
  - **0–59**: *Needs Attention*
- **Automated Event Insights**: Context-aware rule heuristics that highlight student demand, turnout rates, and feedback trends without making false AI claims.

---

## 3. Repository Structure

```
EvntPulse/
├── README.md                  # Comprehensive manual & documentation
├── .gitignore                 # Python, Node, and environment ignores
├── .env.example               # Template environment configuration
│
├── frontend/                  # React + Vite frontend
│   ├── src/
│   │   ├── components/        # UI, events, attendance, polls, feedback, dashboard
│   │   ├── pages/             # public, auth, student, organizer, admin
│   │   ├── context/           # AuthContext, NotificationContext
│   │   ├── services/          # Centralized api.js
│   │   ├── layouts/           # MainLayout, OrganizerLayout, AdminLayout
│   │   ├── routes/            # AppRoutes.jsx, ProtectedRoutes.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/                   # FastAPI backend
│   ├── app/
│   │   ├── main.py            # FastAPI initialization & CORS
│   │   ├── seed.py            # Realistic campus database seeder
│   │   ├── core/              # config, database, security
│   │   ├── models/            # SQLAlchemy models (User, Club, Event, Ticket, etc.)
│   │   ├── schemas/           # Pydantic validation models
│   │   ├── api/               # auth, events, registrations, attendance, polls, etc.
│   │   ├── services/          # Isolated domain business logic
│   │   └── utils/             # QR base64 generator & role validators
│   ├── tests/                 # Automated pytest test suite
│   └── requirements.txt
│
├── ml/                        # Future ML Architecture & Data Scaffolding
│   ├── README.md              # Detailed ML specifications
│   ├── data/
│   ├── preprocessing/
│   ├── training/
│   ├── models/
│   └── inference/
│
└── docs/                      # Technical Documentation
    ├── architecture.md
    ├── database.md
    ├── api.md
    └── user-flows.md
```

---

## 4. Demo Accounts & Credentials

The database is pre-seeded with realistic clubs, events, registrations, checked-in tickets, polls, and feedback reviews. Use these accounts for evaluation:

| Role | Email | Password | Persona |
|---|---|---|---|
| **Student** | `student@evntpulse.demo` | `Student@123` | Devon Patel (CS Sophomore) |
| **Organizer** | `organizer@evntpulse.demo` | `Organizer@123` | Sarah Jenkins (GDSC Lead) |
| **Admin** | `admin@evntpulse.demo` | `Admin@123` | Alex Mercer (Campus Admin) |

> **Pro-Tip**: The navigation bar includes a **"Demo Roles"** 1-click switcher so you can alternate between Student, Organizer, and Admin without retyping credentials.

---

## 5. Quickstart & Installation

### Prerequisites
- Python 3.10+ (Tested on Python 3.14)
- Node.js 18+ & npm

### Step 1: Clone Repository
```bash
git clone https://github.com/Anirudh-888/EvntPulse.git
cd EvntPulse
```

### Step 2: Set Up Backend
```bash
# Create and activate Python virtual environment
python -m venv .venv
# On Windows:
.\.venv\Scripts\activate
# On Linux/macOS:
# source .venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Seed database with realistic campus data
python -m app.seed
```

### Step 3: Run Backend Server
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
# Server runs on http://127.0.0.1:8000
# Interactive Swagger docs: http://127.0.0.1:8000/docs
```

### Step 4: Set Up & Run Frontend
```bash
cd ../frontend
npm install
npm run dev
# Vite dev server runs on http://127.0.0.1:5173
```

---

## 6. Running Automated Tests

Run the complete backend test suite covering Authentication, Role Protection, Event Lifecycle, Capacity Handling, Ticket Generation, Check-in Validation, Polls, and Event Health Scoring:

```bash
# From workspace root:
pytest -o pythonpath=backend -v backend/tests
```

All 12 critical integration tests run against an isolated SQLite test database and pass cleanly.

---

## 7. Critical Demonstration Flow

Follow this end-to-end user journey to evaluate the system:
1. **Discover Event**: Visit `http://127.0.0.1:5173/`, explore upcoming events, or use search and category chips.
2. **Student RSVP**: Click on an event (e.g., *AI Innovation Summit 2026*). Sign in as **Student** (`student@evntpulse.demo`), click **"Register Now"**, and receive an instant digital QR ticket.
3. **Inspect Ticket**: Navigate to **My Tickets** to view the passcard and enlarge the verified QR barcode.
4. **Organizer Switch**: Use the **Demo Roles** switcher in the navbar to switch to **Organizer** (`organizer@evntpulse.demo`).
5. **Venue Check-in**: Open **Organizer Hub** -> select the event -> open the **Check-In & Scanner** tab. Enter the student's ticket code (`EP-...`) or scan the QR code.
   - Status updates instantly to `SUCCESS` with confetti.
   - Attendance counter and turnout rate increment in real-time.
   - Rescanning returns `ALREADY_CHECKED_IN: Ticket already checked in.`
6. **Live Engagement**: Go to the **Live Polls** tab, launch an audience poll, switch to student to cast a vote, and observe the live bar chart.
7. **Verified Feedback**: Attendee submits a 5-star rating and comment.
8. **Event Health Intelligence**: Switch to the **Intelligence & Health** tab to view the computed **Event Health Score (0-100)** with 4-factor breakdown and automated event insights.
