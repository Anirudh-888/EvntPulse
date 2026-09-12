# EvntPulse Architecture & System Design

## 1. Executive Summary
**EvntPulse** is engineered as a modern, high-throughput campus event management and intelligence operating system. It bridges the gap between student discovery, organizer lifecycle management, and transparent event health scoring.

---

## 2. Layered Architecture

```
┌────────────────────────────────────────────────────────┐
│               Frontend (React 18 + Vite)                │
│    Tailwind CSS • Lucide Icons • Recharts • QR Scanner  │
└───────────────────────────┬────────────────────────────┘
                            │ Axios Centralized Client (Bearer JWT)
┌───────────────────────────▼────────────────────────────┐
│              FastAPI Application Server                │
│      Routers (api/v1) • Dependencies • CORS Middleware │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                    Business Services                   │
│   Event • Registration • Ticket • Attendance • Polls    │
│            Feedback • Rule-Based Analytics             │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                Data Layer (SQLAlchemy ORM)             │
│            SQLite (MVP) ──> PostgreSQL (Prod)          │
└────────────────────────────────────────────────────────┘
```

---

## 3. Core Architectural Patterns

### Layered Separation of Concerns
1. **API Router Layer (`backend/app/api/`)**: Defines HTTP verbs, paths, query/path parameters, and handles dependency injection.
2. **Schema Layer (`backend/app/schemas/`)**: Pydantic models enforcing strict request validations, type coercions, and serialization formats.
3. **Service Layer (`backend/app/services/`)**: Enforces business logic, domain validation (e.g. deadline checks, capacity limits, attendance prerequisites, role permissions).
4. **Data Access Layer (`backend/app/models/`)**: SQLAlchemy models with foreign keys, index declarations, and cascading relationships.

### Extensible Migration from SQLite to PostgreSQL
- The application uses declarative SQLAlchemy models with standard data types (`Integer`, `String`, `DateTime`, `Enum`, `Boolean`).
- All time fields use explicit UTC timestamps.
- Moving from SQLite to PostgreSQL only requires updating `DATABASE_URL` in the `.env` file; zero schema refactoring is needed.

---

## 4. Security Architecture

1. **Authentication**:
   - Industry-standard JSON Web Tokens (JWT) signed with HMAC-SHA256 (`HS256`).
   - Tokens carry user subject ID, role, and expiration timestamp.
2. **Password Security**:
   - Salting and hashing via `bcrypt` with work factor 12. Plain passwords are never persisted or returned in API responses.
3. **Cryptographic QR Ticketing**:
   - QR tokens contain opaque, high-entropy cryptographic strings (`ep_qr_...`).
   - No Personally Identifiable Information (PII) is embedded inside the QR barcode.
   - Validation occurs server-side with atomic ticket status transitions to prevent replay or duplicate entry.
4. **Role-Based Access Control (RBAC)**:
   - Three distinct roles: `STUDENT`, `ORGANIZER`, `ADMIN`.
   - Organizers can only manage events and check-ins for clubs they own.
