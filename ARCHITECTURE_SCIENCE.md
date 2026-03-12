# Science & Architecture of the OCR Lab Report App

This document describes how the application is built: the **stack**, **data flow**, and how **Express**, **Neon**, **middleware**, and the **frontend** work together.

---

## 1. High-Level Stack

| Layer        | Technology              | Role |
|-------------|--------------------------|------|
| **Frontend** | React 18, React Router 6 | UI: login, signup, dashboard, PDF/lab upload, report list |
| **API client** | Axios                    | HTTP calls to backend; adds `Authorization: Bearer <token>` |
| **Backend**  | Node.js + Express 4     | REST API: auth, file upload, OCR, CRUD |
| **Middleware** | Express middleware + JWT | CORS, body parsing, auth protection, logging |
| **Database** | Neon (PostgreSQL)       | Persistent store: users, lab_reports |
| **OCR**      | Tesseract.js and/or Google Vision | Extract text from images/PDFs |

---

## 2. Request Flow (End-to-End)

```
User (browser)
    → React app (frontend)
    → Axios (api.js: baseURL = REACT_APP_API_URL or localhost:3008/api)
    → HTTP request (with or without Bearer token)
    → Render / your server (backend)
    → Express (app.js)
    → CORS → express.json() → optional auth middleware
    → Route handler (auth or lab reports)
    → Controller → DB (Neon) or OCR service
    → JSON response
    → Frontend updates UI
```

- **Public routes**: no token (e.g. `POST /api/auth/login`, `POST /api/auth/signup`).
- **Protected routes**: `Authorization: Bearer <JWT>` required; middleware verifies JWT and attaches `req.user`.

---

## 3. Backend (Express)

### 3.1 Entry point

- **Start**: `npm start` → `node backend/app.js`.
- **Port**: `process.env.PORT` or `3008`.

### 3.2 Middleware order (app.js)

1. **dotenv** – Loads `backend/.env` (e.g. `DATABASE_URL`, `JWT_SECRET`).
2. **cors** – Allows origins: `localhost:3000`, `localhost:3001`, `FRONTEND_URL`; credentials allowed.
3. **express.json()** / **express.urlencoded()** – Parse JSON and form bodies.
4. **Static** – `/uploads` serves uploaded files.
5. **Request logging** – Logs `METHOD /path` and timestamp.
6. **Routes** – Health, API health, `/`, then mounted routers:
   - `/api/auth` → auth routes
   - `/api/reports` → lab report routes (all protected).
7. **404 handler** – JSON `{ success: false, error: "Route not found" }`.
8. **Global error handler** – Catches errors (e.g. Multer), returns 500 with message.

### 3.3 Main routes

| Method | Path | Auth | Purpose |
|--------|------|------|--------|
| GET | `/health` | No | Liveness (no DB). |
| GET | `/api/health` | No | Env + DB check (hasDatabaseUrl, hasJwtSecret, database.connected). |
| GET | `/` | No | API info. |
| POST | `/api/auth/signup` | No | Register user. |
| POST | `/api/auth/login` | No | Login; returns JWT + user. |
| POST | `/api/auth/logout` | Yes | Logout (client drops token). |
| GET | `/api/auth/me` | Yes | Current user. |
| POST | `/api/reports/upload` | Yes | Upload image/PDF → OCR → save. |
| GET | `/api/reports` | Yes | List reports. |
| GET | `/api/reports/:id` | Yes | One report. |
| PUT | `/api/reports/:id` | Yes | Update report. |
| DELETE | `/api/reports/:id` | Yes | Delete report. |
| GET | `/api/reports/search` | Yes | Search. |

---

## 4. Middleware (Auth)

- **File**: `backend/middleware/auth.js`.
- **authenticateToken**:
  - Reads `Authorization: Bearer <token>`.
  - Verifies token with `JWT_SECRET`; on success sets `req.user = { userId, email, role }`.
  - On missing/invalid/expired token → 401 or 403 JSON response.
- **checkRole(...roles)** (optional): Ensures `req.user.role` is in allowed roles.

**Usage**:

- Auth routes: no auth middleware (signup/login are public).
- Lab report router: `router.use(authenticateToken)` so every report route is protected.

---

## 5. Database (Neon PostgreSQL)

- **Driver**: `pg` (node-postgres).
- **Config**: `backend/config/db.js` – creates a **Pool** with `process.env.DATABASE_URL`, SSL for Neon, timeouts and pool size.
- **API**: Controllers use `db.query(text, params)` and `db.testConnection()`.

### 5.1 Schema (two main tables)

**users**

- `id` (UUID, PK), `email` (unique), `password_hash`, `full_name`, `role`, `created_at`, `updated_at`.
- Used for signup/login and for `uploaded_by` in lab reports.

**lab_reports**

- `id` (UUID, PK), `patient_id`, `patient_name`, `report_type`, `image_path`, `ocr_text`, `extracted_data` (JSONB), `status`, `uploaded_by` (FK → users.id), `uploaded_at`, `processed_at`, `created_at`, `updated_at`.
- One report per upload; same user id links reports to the logged-in user.

All primary keys are **UUID**; no integer IDs.

---

## 6. Auth Science (Backend)

- **Signup**: Validate email/password/confirm → check user exists → bcrypt hash → insert into `users` → sign JWT with `JWT_SECRET` → return token + user (no password).
- **Login**: Validate email/password → find user by email → bcrypt.compare → sign JWT → return token + user.
- **JWT payload**: `{ userId, email, role }`; expiry e.g. 24h.
- **Protected routes**: Middleware verifies JWT; controller uses `req.user.userId` (e.g. for `uploaded_by`).

If `JWT_SECRET` or `DATABASE_URL` is missing, login/signup can return 500; `/api/health` and startup logs help debug.

---

## 7. OCR Science

- **Service**: `backend/services/ocrService.js`.
- **Input**: Image (e.g. JPEG, PNG) or PDF path (after upload via Multer).
- **PDF**: `pdf-parse` for text extraction; if no/minimal text, image-based OCR (Tesseract or Vision) when available.
- **Images**: Tesseract.js and/or Google Cloud Vision (if `GOOGLE_VISION_API_KEY` set); optional preprocessing in `backend/utils/imagePreprocessing.js`.
- **Output**: Extracted text and optionally structured data; stored in `lab_reports.ocr_text` and `extracted_data`.

---

## 8. Frontend (React)

- **Router**: React Router 6; routes for `/login`, `/signup`, `/dashboard`, `/pdf-scanner`, `/` (redirect to login).
- **Protected routes**: Wrapped in `ProtectedRoute`; if no token in localStorage, redirect to `/login`.
- **API**: `frontend/src/services/api.js` – Axios instance with `baseURL = REACT_APP_API_URL || 'http://localhost:3008/api'`.
  - Request: for non-auth endpoints, attach `Authorization: Bearer ${localStorage.getItem('token')}`.
  - Response: on 401, clear token/user and redirect to `/login`.
- **Auth flow**: Login/Signup pages call `authAPI.login` / `authAPI.signup` → store token and user in localStorage → navigate to dashboard.

---

## 9. Environment Variables

| Variable | Where | Purpose |
|----------|--------|--------|
| `DATABASE_URL` | Backend (Render / .env) | Neon PostgreSQL connection string. |
| `JWT_SECRET` | Backend | Sign/verify JWTs; required for auth. |
| `PORT` | Backend | Server port (Render sets this). |
| `NODE_ENV` | Backend | e.g. `production` on Render. |
| `FRONTEND_URL` | Backend | Allowed CORS origin for frontend. |
| `REACT_APP_API_URL` | Frontend build | Backend API base (e.g. `https://ai-image-ocr-5ejd.onrender.com/api`). |
| `GOOGLE_VISION_API_KEY` | Backend | Optional; for Google Vision OCR. |
| `USE_TESSERACT` | Backend | Optional; prefer Tesseract when `true`. |

---

## 10. One-Page Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│  BROWSER (React)                                                        │
│  Login / Signup / Dashboard / PDF Scanner                                 │
│  api.js → REACT_APP_API_URL + /auth/* or /reports/*                     │
│  Token in localStorage; Axios adds Bearer header for /reports/*          │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ HTTPS
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  EXPRESS (Node.js) – app.js                                             │
│  CORS → express.json → logging → routes                                 │
│  /health, /api/health, / → /api/auth (authRoutes) → /api/reports        │
│  (labReportRoutes: router.use(authenticateToken))                        │
└───┬─────────────────────────────┬───────────────────────────────────────┘
    │                             │
    │ JWT verify                  │ Controllers: authController,
    │ (middleware/auth.js)        │ labReportController → db.query(), ocrService
    │                             │
    ▼                             ▼
┌──────────────────────┐   ┌──────────────────────────────────────────────┐
│  Neon PostgreSQL     │   │  OCR (Tesseract / Google Vision)              │
│  Pool (pg)           │   │  Images/PDF → text → lab_reports.ocr_text     │
│  users, lab_reports  │   │  Multer: uploads → disk → path in DB          │
└──────────────────────┘   └──────────────────────────────────────────────┘
```

---

## 11. Summary

- **Express** serves the REST API and runs middleware (CORS, body, auth).
- **Neon** is the single PostgreSQL database (users + lab_reports, UUIDs).
- **Middleware** (auth) protects report routes and attaches `req.user` from JWT.
- **Frontend** is a React SPA that talks to the backend via Axios, stores JWT in localStorage, and uses protected routes for dashboard and PDF scanner.
- **OCR** runs on the backend (Tesseract and/or Google Vision) and writes results into the database linked to the logged-in user.

This is the “science” of how the OCR app is wired from frontend to Express, middleware, Neon, and OCR.
