# Expense Tracker – Personal Finance Tool

A production-grade, full-stack personal finance tool built for the Fenmo SDE Technical Assessment.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- PostgreSQL (v14+)

### Backend Setup

1. `cd backend`
2. `npm install`
3. Create a `.env` file (see `.env.example`):
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=expense_tracker
   DB_USER=your_user
   DB_PASSWORD=your_password
   PORT=3001
   ```
4. Run migrations & start: `npm start`
5. Run tests: `npm test`

### Frontend Setup

1. `cd frontend`
2. `npm install`
3. Start dev server: `npm run dev`
4. Open [http://localhost:5173](http://localhost:5173)

---

## 🏗️ Architecture & Key Design Decisions

### 1. Database: PostgreSQL with NUMERIC

- **Decision**: Used PostgreSQL for production-ready persistence.
- **Money Handling**: Stored amounts as `NUMERIC(12, 2)`. This avoids the infamous floating-point errors inherent in `FLOAT` or `DOUBLE`. In the API, amounts are handled as strings to maintain precision during transport.

### 2. Reliability: Idempotency keys

- **Decision**: Implemented `Idempotency-Key` headers for all `POST /expenses` requests.
- **Why?**: To handle real-world conditions like "submit button double-clicks", "network retries", or "page refreshes after submission".
- **Mechanism**: The client generates a UUID per form view. If the backend receives the same key twice, it returns the _existing_ record with a `200 OK` and an `idempotent: true` flag, preventing duplicate entries.

### 3. Frontend: React + TanStack Query

- **Decision**: Used `React Query` for all server state.
- **Why?**: It provides out-of-the-box handling for loading states, error handling, auto-refetching on window focus, and cache invalidation after mutations.

### 4. Data Integrity: Strict Validation

- Backend validates all inputs (positive amount, required fields, ISO date format).
- Frontend provides immediate feedback and disables the submit button during in-flight requests.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), TanStack Query, Axios, CSS Modules (Vanilla CSS)
- **Backend**: Node.js, Express, `pg` (node-postgres)
- **Testing**: Jest, Supertest
- **Database**: PostgreSQL

---

## 📝 Design Trade-offs & Notes

- **Authentication**: Intentionally omitted to focus on the core "Expense Tracking" logic and idempotency within the 4-hour window.
- **Deployment**: Configured for Railway (Backend) and Vercel (Frontend). `DATABASE_URL` environment variable support is included in the backend for easy cloud connection.
- **CI/CD**: Added a standard `.gitignore` and `package.json` scripts that follow industry norms for automated testing.

---

## ✅ Deliverables

- [x] Public GitHub Repository
- [x] Production-like code quality
- [x] Idempotency support
- [x] Proper money handling
- [x] Unit/Integration tests
