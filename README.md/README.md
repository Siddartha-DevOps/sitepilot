# 🏗️ sitePilot — Construction Site Management App

> A full-stack mobile app for small construction contractors to manage projects,
> daily reports, materials, and progress photos — optimized for field engineers.

---

## 📁 Project Structure

```
sitepilot/
├── frontend/                   # React Native (Expo) mobile app
│   ├── App.js                  # Entry point
│   ├── app.json                # Expo config
│   ├── package.json
│   └── src/
│       ├── api/
│       │   └── apiClient.js    # Axios instance with interceptors
│       ├── components/
│       │   ├── Button.js       # Reusable button (5 variants)
│       │   ├── Card.js         # Surface card
│       │   ├── Header.js       # Screen header
│       │   ├── InputField.js   # Text input with icon & error
│       │   └── ProgressBar.js  # Animated progress bar
│       ├── constants/
│       │   └── theme.js        # Colors, fonts, spacing, shadows
│       ├── context/
│       │   └── AppContext.js   # Global state (useReducer)
│       ├── navigation/
│       │   └── AppNavigator.js # Stack + Bottom Tab navigation
│       ├── screens/
│       │   ├── LoginScreen.js
│       │   ├── DashboardScreen.js
│       │   ├── ProjectListScreen.js
│       │   ├── ProjectDetailsScreen.js   # 4 tabs
│       │   ├── DailyReportScreen.js
│       │   ├── MaterialEntryScreen.js
│       │   ├── MaterialInventoryScreen.js
│       │   ├── PhotoUploadScreen.js
│       │   ├── NotificationsScreen.js
│       │   └── ProfileScreen.js
│       ├── services/
│       │   ├── authService.js
│       │   ├── projectService.js
│       │   ├── reportService.js
│       │   └── materialService.js
│       └── storage/
│           └── asyncStorage.js # Offline caching helpers
│
└── backend/                    # Node.js + Express REST API
    ├── server.js               # App entry point
    ├── .env.example            # Environment variables template
    ├── package.json
    ├── middleware/
    │   ├── auth.js             # JWT protect middleware
    │   └── upload.js           # Multer file upload
    ├── models/
    │   ├── User.js
    │   ├── Project.js
    │   ├── Report.js
    │   ├── Material.js
    │   └── Photo.js
    ├── routes/
    │   ├── auth.js             # /api/auth/*
    │   ├── projects.js         # /api/projects/*
    │   ├── reports.js          # /api/reports/*
    │   ├── materials.js        # /api/materials/*
    │   ├── photos.js           # /api/photos/*
    │   └── notifications.js    # /api/notifications
    └── utils/
        └── seed.js             # Demo data seeder
```

---

## 🚀 Quick Start

### Prerequisites
| Tool        | Version  |
|-------------|----------|
| Node.js     | ≥ 18.x   |
| npm         | ≥ 9.x    |
| MongoDB     | ≥ 6.x    |
| Expo CLI    | latest   |
| Android Studio / Xcode | for device testing |

---

## ⚙️ Backend Setup

```bash
# 1. Enter backend directory
cd sitepilot/backend

# 2. Install dependencies
npm install

# 3. Create .env from template
cp .env.example .env

# 4. Edit .env — set your MongoDB URI & JWT secret
nano .env

# 5. Seed demo data (optional but recommended)
npm run seed

# 6. Start development server
npm run dev
# → API running at http://0.0.0.0:5000
```

### Example `.env`
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/sitepilot
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRE=30d
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

### API Endpoints

| Method | Endpoint                        | Description              | Auth |
|--------|---------------------------------|--------------------------|------|
| POST   | `/api/auth/register`            | Register new user        | ❌   |
| POST   | `/api/auth/login`               | Login, returns JWT       | ❌   |
| GET    | `/api/auth/profile`             | Get own profile          | ✅   |
| PUT    | `/api/auth/profile`             | Update profile           | ✅   |
| GET    | `/api/projects`                 | List all projects        | ✅   |
| POST   | `/api/projects`                 | Create project           | ✅   |
| GET    | `/api/projects/:id`             | Get project details      | ✅   |
| PUT    | `/api/projects/:id`             | Update project           | ✅   |
| DELETE | `/api/projects/:id`             | Delete project           | ✅   |
| GET    | `/api/projects/:id/reports`     | Reports for project      | ✅   |
| GET    | `/api/projects/:id/materials`   | Materials for project    | ✅   |
| GET    | `/api/projects/:id/photos`      | Photos for project       | ✅   |
| GET    | `/api/reports`                  | List all reports         | ✅   |
| POST   | `/api/reports`                  | Submit daily report      | ✅   |
| GET    | `/api/materials`                | List all materials       | ✅   |
| POST   | `/api/materials`                | Add material entry       | ✅   |
| GET    | `/api/materials/low-stock`      | Get low-stock items      | ✅   |
| PATCH  | `/api/materials/:id/consume`    | Deduct material used     | ✅   |
| POST   | `/api/photos/upload`            | Upload photos            | ✅   |
| GET    | `/api/notifications`            | Get live notifications   | ✅   |
| GET    | `/health`                       | Health check             | ❌   |

---

## 📱 Frontend Setup

```bash
# 1. Enter frontend directory
cd sitepilot/frontend

# 2. Install dependencies
npm install

# 3. Set your backend IP in the API client
nano src/api/apiClient.js
# → Change BASE_URL to your machine's local IP
#   e.g. http://192.168.1.100:5000/api

# 4. Start Expo
npx expo start

# 5. Open on device
#   → Press 'a' for Android emulator
#   → Press 'i' for iOS simulator
#   → Scan QR code with Expo Go app on your phone
```

---

## 📱 Screen Overview

| #  | Screen                  | Tab / Navigation      | Key Features                                              |
|----|-------------------------|-----------------------|-----------------------------------------------------------|
| 1  | Login                   | Root Stack            | Email/phone + password, demo login button                 |
| 2  | Dashboard               | Bottom Tab 1          | Stats, quick actions, active projects, material alerts    |
| 3  | Project List            | Bottom Tab 2          | Search, filter pills, add project modal, FAB              |
| 4  | Project Details         | Stack (from list)     | 4 tabs: Overview, Reports, Materials, Photos              |
| 5  | Daily Report            | Stack (from dashboard)| Project picker, work form, photo upload, draft save       |
| 6  | Material Entry          | Stack (from dashboard)| Dropdown pickers, quantity + unit, summary card           |
| 7  | Material Inventory      | Bottom Tab 3          | Stock bars, critical/low badges, search & filter          |
| 8  | Photo Upload            | Bottom Tab 4          | Camera + gallery, multi-select, notes, recent grid        |
| 9  | Notifications           | Bottom Tab 5          | Grouped by date, filter pills, unread badge, mark all     |
| 10 | Profile                 | Stack (from dashboard)| Stats, settings toggles, menu items, logout               |

---

## 🗃️ Data Models

### User
```js
{ name, email, phone, password(hashed), company, role, location, avatar, isActive }
```

### Project
```js
{ name, location, description, startDate, endDate, budget, progress, status, manager, team, createdBy }
```

### Report (Daily)
```js
{ project, date, workDone, workersCount, materialsUsed, notes, photos[], weather, issues, submittedBy }
```

### Material
```js
{ project, name, quantity, unit, minThreshold, supplier, deliveryDate, invoiceNo, notes, addedBy }
// Virtual: stockStatus → 'ok' | 'low' | 'critical'
```

### Photo
```js
{ project, filename, url, note, uploadedBy, size, mimeType }
```

---

## 🔧 Tech Stack

### Frontend
- **React Native** (Expo SDK 50)
- **React Navigation** v6 — Stack + Bottom Tabs
- **Axios** — HTTP client with JWT interceptors
- **AsyncStorage** — Offline caching
- **Expo Camera / Image Picker** — Photo capture & upload
- **Context API + useReducer** — Global state management
- **@expo/vector-icons (Ionicons)**

### Backend
- **Node.js + Express** — REST API
- **MongoDB + Mongoose** — Database & ODM
- **JWT (jsonwebtoken)** — Authentication
- **bcryptjs** — Password hashing
- **Multer** — File upload middleware
- **Helmet** — Security headers
- **express-rate-limit** — Rate limiting
- **Morgan** — HTTP request logging

---

## 🔀 GitHub Push Guide

### First Time Setup

```bash
# ── 1. Navigate to project root ───────────────────────────────────────────────
cd sitepilot

# ── 2. Initialize git repo ───────────────────────────────────────────────────
git init
git branch -M main

# ── 3. Stage all files ───────────────────────────────────────────────────────
git add .

# ── 4. First commit ──────────────────────────────────────────────────────────
git commit -m "🚀 Initial commit: sitePilot full-stack app

- React Native (Expo) frontend with 10 screens
- Node.js/Express REST API backend
- MongoDB models: User, Project, Report, Material, Photo
- JWT authentication with AsyncStorage persistence
- Bottom tab navigation + stack navigation
- Offline data caching support
- Image upload with Multer
- Demo seed data script"

# ── 5. Create repo on GitHub ─────────────────────────────────────────────────
#    Go to https://github.com/new
#    Repo name: sitepilot
#    Visibility: Public or Private
#    Do NOT initialize with README (we already have one)

# ── 6. Add remote origin ─────────────────────────────────────────────────────
git remote add origin https://github.com/YOUR_USERNAME/sitepilot.git

# ── 7. Push to GitHub ────────────────────────────────────────────────────────
git push -u origin main
```

### Subsequent Pushes

```bash
git add .
git commit -m "✨ feat: <describe your change>"
git push
```

### Recommended Branch Strategy

```bash
# Feature branches
git checkout -b feature/offline-sync
git checkout -b feature/push-notifications
git checkout -b fix/material-stock-alert

# Merge back to main
git checkout main
git merge feature/offline-sync
git push
```

---

## 🌐 Deployment

### Backend (Render / Railway / VPS)

```bash
# Render (free tier available)
# 1. Push to GitHub
# 2. Go to https://render.com → New Web Service
# 3. Connect your GitHub repo
# 4. Root Directory: backend
# 5. Build Command: npm install
# 6. Start Command: node server.js
# 7. Add environment variables from .env.example
```

### MongoDB Atlas (Free Tier)
```
1. Go to https://cloud.mongodb.com
2. Create free M0 cluster
3. Add IP 0.0.0.0/0 to Network Access
4. Create database user
5. Copy connection string to MONGO_URI in .env
```

### Frontend (Expo EAS Build)
```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android   # APK for Android
eas build --platform ios       # IPA for iOS
```

---

## 🧪 Testing Demo Login

After running the seed script:
```
Email:    ravi@sitepilot.com
Password: password123
```

Or tap **"Demo Login (Testing)"** on the Login screen to bypass auth entirely.

---

## 📸 Color Palette

| Token         | Hex       | Usage                    |
|---------------|-----------|--------------------------|
| `primary`     | `#F97316` | Orange — brand, buttons  |
| `primaryDark` | `#EA580C` | Darker orange            |
| `secondary`   | `#1E293B` | Slate dark — headings    |
| `success`     | `#22C55E` | Active / OK status       |
| `warning`     | `#F59E0B` | Low stock / deadline     |
| `danger`      | `#EF4444` | Critical / error         |
| `info`        | `#3B82F6` | Info notifications       |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'feat: add my feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT © 2025 sitePilot — Built for construction teams in the field.