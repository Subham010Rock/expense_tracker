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

## 🌐 Deployment & Live Links

- **Frontend (Vercel)**: [Live Demo Link](https://expense-tracker-kappa-azure.vercel.app/)
- **Backend (Render)**: [API Health Check](https://expense-tracker-1yzk.onrender.com/health)
- **GitHub Repository**: [Public Repo Link](https://github.com/Subham010Rock/expense_tracker)

### Deployment Instructions

#### 1. Backend & Database (Render)

1. **PostgreSQL**: Create a new **PostgreSQL** instance on Render (Free plan).
2. **Web Service**: Create a new **Web Service** connected to the `backend` directory.
3. **Environment Variables**:
   - `DATABASE_URL`: Your Render PostgreSQL Internal/External URL.
   - `PORT`: `3001`
4. **Build Command**: `npm install`
5. **Start Command**: `npm start`

#### 2. Frontend (Vercel)

1. Import the repository into Vercel.
2. Select the `frontend` directory as the root.
3. **Environment Variables**:
   - `VITE_API_URL`: The URL of your deployed Render backend (e.g., `https://your-backend.onrender.com`).
4. Vercel will automatically detect the Vite build settings and deploy.

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

### 5. Robustness under Real-World Conditions

- **Network Retries**: By associating each submission with a client-generated UUID (`Idempotency-Key`), the API can safely handle retries without creating duplicate expenses.
- **Concurrent Submissions**: The UI disables the submit button immediately upon click to prevent accidental double-posts, while the database-level `UNIQUE` constraint provides a final line of defense.
- **Browser Refreshes**: The idempotency key is stored in `sessionStorage` per-form-session. Refreshing the page after a successful submission generates a fresh key, while refreshing during a hang allows the client to retry with the same key safely.

### 6. Data Correctness & Money Handling

- **NUMERIC vs FLOAT**: In financial systems, `FLOAT` is dangerous due to rounding errors (e.g., `0.1 + 0.2 != 0.3`). This system uses PostgreSQL `NUMERIC(12, 2)` and JS string-based normalization to ensure cent-perfect accuracy.
- **Date Consistency**: PostgreSQL `DATE` types are returned as raw strings (YYYY-MM-DD) via `pg.types.setTypeParser` to avoid the common JS pitfall where local timezones shift dates by a day when parsing objects.
- **Atomic Migrations**: The backend runs its schema check on startup, ensuring the database is always in the correct state before traffic hits.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), TanStack Query, Axios, CSS Modules (Vanilla CSS)
- **Backend**: Node.js, Express, `pg` (node-postgres)
- **Testing**: Jest, Supertest
- **Database**: PostgreSQL

---

## 📝 Design Trade-offs & Notes

- **Authentication**: Intentionally omitted to focus on the core "Expense Tracking" logic and idempotency within the 4-hour window.
- **Monorepo Structure**: Organized as a monorepo for easier management, with deployment configurations (`Procfile`, `vercel.json`) included for zero-config setup.
- **CI/CD**: Added a standard `.gitignore` and `package.json` scripts that follow industry norms for automated testing.

---

## ✅ Deliverables

- [x] Public GitHub Repository
- [x] Production-like code quality
- [x] Idempotency support
- [x] Proper money handling
- [x] Unit/Integration tests
