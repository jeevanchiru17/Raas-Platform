# ForaMetric — Robotics-as-a-Service Platform

A full-stack, cloud-ready **Robotics-as-a-Service (RaaS)** platform for warehouse automation, delivery robots, and cleaning/security robots — rebranded as **ForaMetric**.

🌐 **Live Demo:** [smaratara-jeevanchiru17s-projects.vercel.app](https://smaratara-jeevanchiru17s-projects.vercel.app)

---

## ✨ Features

- 🔐 **Firebase Authentication** — Email/password & Google OAuth sign-in
- 🤖 **Multi-robot Fleet Management** — Deploy, monitor, and control robots
- 📡 **Real-time Telemetry** — Socket.io powered live robot status
- 💳 **Stripe Billing** — Subscription plans with Stripe Checkout & Customer Portal
- 🗂️ **Task Management** — Create and track robot task queues
- 📊 **Operations Dashboard** — Rich analytics and fleet overview
- 🖥️ **Robot Visualizations** — RViz and Foxglove telemetry views
- 🌙 **Premium Dark UI** — Glassmorphism design with micro-animations
- ☁️ **Vercel + Render Deployment** — Frontend on Vercel, backend on Render

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Redux Toolkit, React Router v6 |
| **Styling** | Vanilla CSS, Glassmorphism, custom animations |
| **Auth** | Firebase Auth (Email/Password + Google OAuth) |
| **Real-time** | Socket.io |
| **Backend** | Node.js, Express |
| **Database** | Google Cloud Firestore + MongoDB (Mongoose fallback) |
| **Payments** | Stripe Checkout + Billing Portal |
| **Deployment** | Vercel (frontend) + Render (backend) |
| **Serverless** | Vercel API Routes (Stripe billing) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- A [Firebase project](https://console.firebase.google.com) with Email/Password and Google auth enabled
- A [Stripe account](https://stripe.com) (test mode is fine)

### 1. Clone the repo
```bash
git clone https://github.com/jeevanchiru17/smaratara.git
cd smaratara
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in your credentials (see Environment Variables section)
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Fill in your Firebase credentials
npm start
```

---

## 📁 Project Structure

```
Raas-Platform/
├── backend/                    # Express API server (port 5001)
│   ├── src/
│   │   ├── config/
│   │   │   ├── firebase.js     # Firebase Admin SDK
│   │   │   ├── stripe.js       # Stripe client
│   │   │   ├── mongo.js        # MongoDB connection
│   │   │   └── localDb.js      # Local JSON fallback DB
│   │   ├── models/
│   │   │   └── Subscription.js # Mongoose subscription model
│   │   └── routes/
│   │       ├── auth.js         # Authentication routes
│   │       ├── billing.js      # Stripe checkout & portal
│   │       ├── robots.js       # Robot CRUD & commands
│   │       └── tasks.js        # Task management
│   └── .env.example
│
├── frontend/                   # React dashboard (port 3000)
│   ├── api/                    # Vercel serverless functions
│   │   └── billing/
│   │       ├── create-checkout-session.js
│   │       ├── create-portal-session.js
│   │       └── subscription.js
│   ├── src/
│   │   ├── config/
│   │   │   └── firebase.js     # Firebase client SDK
│   │   ├── pages/
│   │   │   ├── LandingPage.js  # Marketing landing page
│   │   │   ├── LoginPage.js    # Firebase auth UI
│   │   │   ├── Dashboard.js    # Operations overview
│   │   │   ├── Fleet.js        # Robot fleet management
│   │   │   ├── Tasks.js        # Task queue
│   │   │   ├── Billing.js      # Subscription & payments
│   │   │   ├── RvizView.js     # Robot visualization
│   │   │   └── FoxgloveView.js # Foxglove telemetry
│   │   └── App.js              # Auth state & routing
│   ├── vercel.json             # Vercel routing config
│   └── .env.example
│
├── gcp/                        # GCP configuration
│   ├── kubernetes/             # GKE manifests
│   └── firestore/              # DB schemas
├── docs/                       # Deployment guides
└── docker-compose.yml          # Local development
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
```env
NODE_ENV=development
PORT=5001
CORS_ORIGIN=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Firebase Admin (optional — uses local fallback if not set)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@...

# MongoDB (optional — uses local JSON fallback if not set)
MONGODB_URI=mongodb+srv://...
```

### Frontend (`frontend/.env`)
```env
REACT_APP_API_URL=http://localhost:5001
REACT_APP_FIREBASE_API_KEY=AIza...
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc...
REACT_APP_FIREBASE_MEASUREMENT_ID=G-XXXXXXXX
```

---

## 🔐 Authentication

Firebase Auth is integrated with persistent sessions (`browserLocalPersistence`).

- **Sign up / Sign in** via Email + Password
- **Google OAuth** one-click sign-in
- **Persistent login** — stays signed in across browser refreshes
- **Landing page** shows the logged-in user's name + avatar in the navbar
- **Protected routes** — unauthenticated users are redirected to the login page

### Firebase Console Setup
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Authentication → Sign-in methods → Enable **Email/Password** and **Google**
3. Authentication → Settings → Authorized Domains → Add your **Vercel domain**

---

## 💳 Stripe Billing

Three subscription plans:

| Plan | Price | Robots | Credits |
|------|-------|--------|---------|
| Free | $0/mo | 5 | 100 |
| Pro | $29/mo | 50 | 1,000 |
| Business | Custom | Unlimited | Unlimited |

### How it works (on Vercel)
Stripe billing is handled by **Vercel serverless functions** in `frontend/api/billing/` — no separate backend required for payments on the live deployment.

- **Upgrade** → `POST /api/billing/create-checkout-session` → Stripe Checkout
- **Manage** → `POST /api/billing/create-portal-session` → Stripe Customer Portal
- **Billing data** → `GET /api/billing/subscription`

### Required Vercel Environment Variables
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRO_PRICE_ID=price_...
FRONTEND_URL=https://your-app.vercel.app
```

---

## 🌐 Deployment

### Frontend → Vercel

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Set **Root Directory** to `frontend`
4. Add all environment variables (Firebase + Stripe)
5. Deploy — Vercel auto-deploys on every push

See [docs/VERCEL_RENDER_DEPLOY.md](docs/VERCEL_RENDER_DEPLOY.md) for full guide.

### Backend → Render

1. Go to [Render](https://render.com) → New Web Service
2. Connect your GitHub repo
3. Set **Root Directory** to `backend`
4. Build Command: `npm install` | Start Command: `npm start`
5. Add environment variables
6. Update `REACT_APP_API_URL` in Vercel to the Render URL

---

## 📡 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |

### Robots
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/robots` | List all robots |
| POST | `/api/robots` | Register new robot |
| GET | `/api/robots/:id` | Get robot status |
| POST | `/api/robots/:id/command` | Send command |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List tasks |
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/:id` | Get task status |

### Billing
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/billing/subscription` | Get subscription info |
| POST | `/api/billing/create-checkout-session` | Start Stripe Checkout |
| POST | `/api/billing/create-portal-session` | Open Stripe Portal |

---

## ⚡ Real-time Events (Socket.io)

```javascript
// Robot telemetry
socket.on('robot:telemetry', ({ robotId, battery, location, status }) => {
  console.log('Robot status:', robotId, status);
});

// Task updates
socket.on('task:update', ({ taskId, status, progress }) => {
  console.log('Task progress:', taskId, progress);
});
```

---

## 🗄️ Database

The platform supports three data storage modes (auto-detected):

1. **Google Cloud Firestore** — primary production database
2. **MongoDB (Mongoose)** — alternative cloud database
3. **Local JSON fallback** — zero-config development mode (no DB setup needed)

### Firestore Collections
- `users` — accounts, subscriptions, Stripe customer IDs
- `robots` — fleet inventory and status
- `tasks` — task queue
- `telemetry` — time-series sensor data
- `commands` — command history

---

## 💰 Cost Breakdown (Free Tier)

| Service | Monthly Cost |
|---------|-------------|
| Vercel (Frontend) | **FREE** |
| Render (Backend) | **FREE** (750 hrs/month) |
| Firebase Auth | **FREE** (10k/month) |
| Firestore | **FREE** (50k reads / 20k writes) |
| Stripe | **FREE** (test mode) |
| **Total** | **$0** in development |

---

## 📄 License

MIT

---

## 🤝 Support

For issues and questions, [create a GitHub issue](https://github.com/jeevanchiru17/smaratara/issues).
