# 🧠 ForaMetric — Project Memory File

> **Read this first** at the start of every dev session.  
> Last updated: 2026-07-17 | Sprint: 1 (in progress)

---

## 🏢 Project Identity

| Field | Value |
|-------|-------|
| **Product Name** | ForaMetric |
| **Type** | Robotics-as-a-Service (RaaS) SaaS Platform |
| **GitHub Repo** | https://github.com/jeevanchiru17/smaratara |
| **Live URL** | https://smaratara-jeevanchiru17s-projects.vercel.app |
| **Owner** | Jeevan HR (@jeevanchiru17) |
| **Process** | Scrum — 4 × 1-week sprints |

---

## 🌿 Git Branch Strategy (GitFlow-lite)

```
main         ← PRODUCTION  (Vercel + Render live deploy — NEVER touch directly)
beta         ← STAGING     (created in Sprint 4 — stakeholder sign-off here)
develop      ← INTEGRATION (all sprint features merge here via PR)
feat/sprint-N-<story>  ← per-story feature branches
```

### Rules
- **Never push directly to `main`**
- Every user story = one `feat/*` branch → PR → `develop`
- End of sprint → `develop` merges into `beta` (staging deploy)
- End of Sprint 4 → `beta` → `main` (go live)
- **Current active branch:** `feat/sprint-1-foundation`

---

## 📦 Tech Stack

### Current (Legacy — being migrated)
| Layer | Tech |
|-------|------|
| Frontend Build | CRA (`react-scripts 5.0.1`) — **being removed** |
| Language | Plain JavaScript |
| Styling | Vanilla CSS (mixed per-page CSS files) |
| State | Redux Toolkit |
| API Calls | Axios + raw `useEffect` |
| Backend | Express 4 |
| Validation | `express-validator` |
| Testing | Jest (bare) |

### Target (Professional — Sprint 1–4)
| Layer | Tech | Sprint |
|-------|------|--------|
| Frontend Build | **Vite** + `@vitejs/plugin-react` | S1 |
| Language | **TypeScript** (frontend + backend) | S1 / S3 |
| Styling | **Tailwind CSS v3** | S1 |
| Components | **shadcn/ui** (Radix UI primitives) | S1 |
| State (UI) | **Zustand** | S2 |
| State (Server) | **TanStack Query v5** | S2 |
| Forms | **React Hook Form + Zod** | S2 |
| 3D / Robot Vis | **React Three Fiber** | S4 |
| Backend | **Fastify** + TypeScript | S3 |
| Validation | **Zod** (shared frontend + backend) | S3 |
| Logging | **Pino** (structured JSON logs) | S3 |
| Linting | **ESLint** + TypeScript ESLint | S1 |
| Formatting | **Prettier** | S1 |
| Git hooks | **Husky** + lint-staged | S1 |
| Testing | **Vitest** + React Testing Library | S1 |
| CI/CD | **GitHub Actions** | S4 |

### Stays (Already Professional — keep as-is)
| Layer | Tech |
|-------|------|
| Auth | Firebase Auth (Email/Password + Google OAuth) |
| Real-time | Socket.io |
| Payments | Stripe Checkout + Billing Portal |
| Frontend Deploy | Vercel |
| Backend Deploy | Render |
| Primary DB | Google Cloud Firestore |

---

## 🏗️ Architecture

```
Raas-Platform/
├── frontend/                    # React 18 app (CRA port 3000 → Vite port 5173)
│   ├── api/                     # Vercel serverless functions (Stripe billing)
│   │   └── billing/
│   │       ├── create-checkout-session.js
│   │       ├── create-portal-session.js
│   │       └── subscription.js
│   └── src/
│       ├── config/
│       │   └── firebase.ts      # Firebase client SDK (migrated to TS)
│       ├── pages/
│       │   ├── LandingPage.js   # Marketing landing page
│       │   ├── LoginPage.js     # Firebase auth UI
│       │   ├── Dashboard.js     # Operations overview
│       │   ├── RobotsList.js    # Robot fleet management
│       │   ├── TaskManager.js   # Task queue
│       │   ├── Billing.js       # Subscription & payments
│       │   ├── RvizView.js      # Robot visualization (raw Three.js → R3F in S4)
│       │   ├── RoboBarista.js   # Special robot experience
│       │   └── FoxgloveView.js  # Foxglove telemetry
│       ├── components/
│       │   ├── CursorPaint.js
│       │   ├── barista/
│       │   └── three/
│       ├── App.js               # Auth state + manual routing (no React Router)
│       └── index.js             # CRA entry → main.tsx after Vite migration
│
├── backend/                     # Express → Fastify API (port 5001)
│   └── src/
│       ├── app.js               # Express app setup → app.ts (Fastify in S3)
│       ├── index.js             # Server entry + Socket.io
│       ├── config/
│       │   ├── firebase.js      # Firebase Admin SDK
│       │   ├── stripe.js        # Stripe client
│       │   ├── mongo.js         # MongoDB connection
│       │   └── localDb.js       # Local JSON fallback DB (dev only)
│       ├── models/
│       │   └── Subscription.js  # Mongoose schema
│       ├── routes/
│       │   ├── auth.js
│       │   ├── billing.js
│       │   ├── robots.js
│       │   └── tasks.js
│       └── sockets/             # Socket.io handlers
│
├── gcp/                         # GCP/GKE Kubernetes manifests
├── docs/                        # Deployment guides
├── docker-compose.yml           # Local dev orchestration
└── MEMORY.md                    # ← You are here
```

---

## 🔑 Environment Variables (Key Names Only)

### Frontend (`frontend/.env`)
```
REACT_APP_API_URL=http://localhost:5001
REACT_APP_SOCKET_URL=http://localhost:5001
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=forametric.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=forametric
REACT_APP_FIREBASE_STORAGE_BUCKET=forametric.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
REACT_APP_FIREBASE_MEASUREMENT_ID=G-JTJBC7E1FW
```
> ⚠️ After Vite migration (Sprint 1): rename ALL `REACT_APP_` → `VITE_`  
> And update code: `process.env.REACT_APP_X` → `import.meta.env.VITE_X`

### Backend (`backend/.env`)
```
NODE_ENV=development
PORT=5001
CORS_ORIGIN=http://localhost:3000     # update to 5173 after Vite migration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRO_PRICE_ID=price_1TltwJLIHF8dAbqV3pgRKVRU
STRIPE_WEBHOOK_SECRET=               # not yet configured
```

---

## 🎨 Design System Tokens

```css
/* Colors */
--accent-blue:   #0071e3   /* Primary CTA */
--accent-purple: #af52de
--accent-gold:   #ff9500
--accent-green:  #34c759
--accent-red:    #ff3b30
--bg-primary:    #f5f5f7
--bg-secondary:  #ffffff
--text-primary:  #1d1d1f
--text-muted:    #6e6e73
--panel-border:  rgba(0,0,0,0.06)

/* Typography */
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display'
--font-mono: 'SF Mono', 'Menlo', monospace
```

> In Tailwind: these map to `tailwind.config.ts` → `theme.extend.colors` & `theme.extend.fontFamily`

---

## 💳 Stripe Billing

| Plan | Price | Robots | Credits |
|------|-------|--------|---------|
| Free | $0/mo | 5 | 100 |
| Pro | $29/mo | 50 | 1,000 |
| Business | Custom | Unlimited | Unlimited |

- Pro Price ID: `price_1TltwJLIHF8dAbqV3pgRKVRU`
- Billing via Vercel serverless in `frontend/api/billing/`

---

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/robots` | List all robots |
| POST | `/api/robots` | Register new robot |
| GET | `/api/robots/:id` | Get robot status |
| POST | `/api/robots/:id/command` | Send command |
| GET | `/api/tasks` | List tasks |
| POST | `/api/tasks` | Create task |
| GET | `/api/billing/subscription` | Get subscription |
| POST | `/api/billing/create-checkout-session` | Stripe Checkout |
| POST | `/api/billing/create-portal-session` | Stripe Portal |

---

## ⚡ Real-time (Socket.io)

```javascript
// Robot telemetry
socket.on('robot:telemetry', ({ robotId, battery, location, status }) => {})

// Task updates
socket.on('task:update', ({ taskId, status, progress }) => {})
```

---

## 🏃 Scrum Sprint Status

| Sprint | Status | Branch | Goal |
|--------|--------|--------|------|
| **Sprint 1** | 🔄 In Progress | `feat/sprint-1-foundation` | Vite + TS + Tailwind + Toolchain |
| **Sprint 2** | ⏳ Pending | `feat/sprint-2-state` | TanStack Query + Zustand |
| **Sprint 3** | ⏳ Pending | `feat/sprint-3-backend` | Fastify + TypeScript backend |
| **Sprint 4** | ⏳ Pending | `feat/sprint-4-cicd` | CI/CD + Beta deploy + Go live |

### Sprint 1 Checklist
- [x] Branch `feat/sprint-1-foundation` created & pushed
- [x] Vite + `@vitejs/plugin-react` + `typescript` + `@types/*` installed
- [ ] `react-scripts` removed (peer dep conflict — must remove FIRST before other installs)
- [ ] Tailwind CSS + PostCSS + Autoprefixer installed
- [ ] `vite.config.ts` created
- [ ] `tsconfig.json` + `tsconfig.node.json` created
- [ ] `index.html` at project root (Vite entry point)
- [ ] `src/main.tsx` (replaces `src/index.js`)
- [ ] `src/App.tsx` (migrated from `App.js`)
- [ ] `src/config/firebase.ts` (migrated from `firebase.js`)
- [ ] `.env` renamed `REACT_APP_` → `VITE_`
- [ ] `shadcn/ui` base components added (Button, Card, Badge)
- [ ] `src/lib/utils.ts` (`cn()` helper)
- [ ] ESLint + Prettier + Husky configured
- [ ] Vitest + React Testing Library configured
- [ ] Path alias `@/` → `src/` in Vite + TS config
- [ ] `npm run dev` boots cleanly on Vite

---

## ⚠️ Known Issues & Gotchas

1. **`react-scripts` peer dep conflict**  
   CRA locks `typescript@^3.2.1 || ^4`. Vite needs TS 5+.  
   **Fix:** Run `npm remove react-scripts` BEFORE any new installs.

2. **`REACT_APP_` → `VITE_` prefix**  
   Vite reads `VITE_*` not `REACT_APP_*`.  
   **Fix:** Rename all vars in `.env` AND all usages: `process.env.REACT_APP_X` → `import.meta.env.VITE_X`

3. **Backend CORS port mismatch**  
   Backend `CORS_ORIGIN` is `http://localhost:3000` (CRA). After Vite, dev server runs on `5173`.  
   **Fix:** Update `backend/.env` → `CORS_ORIGIN=http://localhost:5173` for dev.

4. **No React Router**  
   Current routing is manual (`mode: 'landing' | 'login' | 'app'` state). Works but not scalable.  
   **Decision:** Add React Router v6 in Sprint 2.

5. **Local JSON fallback DB**  
   Backend auto-detects DB. Falls back to JSON file if Firestore/MongoDB not configured.  
   Fine for dev — but ensure `FIREBASE_*` vars are set before staging deploy.

---

## 📋 Definition of Done (DoD)

A story is ✅ Done only when ALL pass:
- [ ] Written in TypeScript (no `any` types)
- [ ] ESLint: zero errors/warnings
- [ ] Prettier: formatted
- [ ] Min. 1 Vitest unit test per new module
- [ ] PR raised `feat/*` → `develop`
- [ ] `npm run build` exits 0
- [ ] No regressions in existing features

---

## 🚀 How to Run Locally

```bash
# Backend (port 5001)
cd backend
npm run dev

# Frontend — CRA (current, port 3000)
cd frontend
npm start

# Frontend — Vite (after Sprint 1, port 5173)
cd frontend
npm run dev
```
