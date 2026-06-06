# OBE Management System
### MIT Academy of Engineering — NAAC Compliant | Pune University

A complete web-based **Outcome Based Education (OBE)** course file management system for B.E./B.Tech programs, replacing manual Excel-based processes.

---

## 🏗️ Project Structure

```
obe-system/
├── backend/          # Node.js + Express + MongoDB API
│   ├── controllers/  # Business logic
│   ├── models/       # MongoDB schemas
│   ├── routes/       # API routes
│   ├── middleware/   # Auth, validation
│   ├── utils/        # Calculators, PO data
│   ├── server.js     # Entry point
│   └── seed.js       # Create first admin
└── frontend/         # React.js UI
    └── src/
        ├── pages/    # All page components
        ├── context/  # Auth context
        ├── utils/    # API client
        └── styles/   # Global CSS
```

---

## 🚀 Deployment Guide

### Step 1: MongoDB Atlas (Free)
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) → Create free cluster
2. Create a database user (save username + password)
3. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/obe_system`

### Step 2: Deploy Backend on Railway
1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Connect your GitHub repo, select the `backend` folder
3. Add environment variables:
   ```
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your_random_secret_min_32_chars
   FRONTEND_URL=https://your-app.vercel.app
   PORT=5000
   NODE_ENV=production
   ```
4. Railway will auto-deploy. Copy your backend URL (e.g. `https://obe-backend.railway.app`)

### Step 3: Create Admin Account
```bash
# In Railway terminal or locally:
node seed.js
# This creates: ADMIN001 / Admin@123
```

### Step 4: Deploy Frontend on Vercel
1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Select the `frontend` folder
3. Add environment variable:
   ```
   REACT_APP_API_URL=https://obe-backend.railway.app/api
   ```
4. Deploy! Vercel gives you a URL like `https://obe-system.vercel.app`

### Step 5: Update Backend FRONTEND_URL
Update `FRONTEND_URL` in Railway to match your Vercel URL.

---

## 💻 Local Development

```bash
# Backend
cd backend
npm install
cp .env.example .env   # Fill in your MongoDB URI
node seed.js           # Create admin account
npm run dev            # Runs on http://localhost:5000

# Frontend (new terminal)
cd frontend
npm install
cp .env.example .env   # Set REACT_APP_API_URL=http://localhost:5000/api
npm start              # Runs on http://localhost:3000
```

---

## 👤 Default Login

| Role | Employee ID | Password |
|------|-------------|----------|
| Admin | ADMIN001 | Admin@123 |

**Change the admin password after first login!**

---

## 🔄 Workflow

```
Admin Creates Subject
        ↓
Admin Registers Faculty → Assigns Champion + Instructor
        ↓
Champion Logs In → Selects Subject
        ↓
Step 1: Vision & Mission
Step 2: Course Outcomes (CO1-CO6)
Step 3: PI Mapping (Y/N per indicator)
Step 4: CO-PO Matrix (auto-calculated, editable)
Step 5: Activities (IA, MSE, ESE, Assignments)
Step 6: Upload Students (bulk Excel or manual)
Step 7: Enter/Upload Marks (per activity)
Step 8: Exit Survey (shareable link for students)
Step 9: Calculate Attainment (CO + PO levels)
Step 10: Action Report (high/low attainment actions)
        ↓
Generate PDF Course File (NAAC compliant)
```

---

## 📐 Calculation Logic

### Attainment Levels (configurable by Admin per year)
- Level 0: < 65%
- Level 1: ≥ 65%
- Level 2: ≥ 75%
- Level 3: ≥ 85%

### CO Attainment
```
CIE% = (IA_avg% × 30 + MSE_avg% × 20) / 50
Direct_avg% = (CIE% + ESE%) / 2
Direct_Level = threshold_check(Direct_avg%)
Indirect_Level = threshold_check(Survey_avg%)
Final_Level = Direct_Level × 0.8 + Indirect_Level × 0.2
```

### PO Attainment
```
For each PO:
  contribution from CO_x = CO_x_FinalLevel × mapping_value / 3
  PO_achieved = average of all CO contributions
  PO_target = average of all mapping values
  PO_% = (achieved / target) × 100
```

---

## 📄 PDF Output Sections
1. Cover Page
2. Index
3. 1A — Vision & Mission (Institute)
4. 1B — Vision & Mission (Department) + PEOs
5. 1C — POs & PSOs (Pune University)
6. 6A — PI Mapping Matrix
7. 6B — Course Description
8. 6C — CO-PO Mapping Matrix
9. 14A — CO Attainment (Direct + Indirect + Final)
10. 14B — PO Attainment
11. 14C — Action Taken Report

---

## 🛡️ Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Create subjects, register faculty, assign roles, set thresholds |
| **Champion** | Full control over subject: define COs, mappings, finalize data, generate PDF |
| **Instructor** | Enter marks, submit suggestions (Champion must approve changes) |

---

## 🔧 Tech Stack
- **Frontend**: React.js, React Router, Recharts, React Hot Toast
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT
- **PDF**: html-pdf-node
- **Excel**: xlsx (SheetJS)
- **Deploy**: Vercel (frontend) + Railway (backend) + MongoDB Atlas

---

## 📞 Support
For issues, check the browser console and Railway logs.
Common issues:
- **CORS error**: Check `FRONTEND_URL` env variable in Railway
- **PDF not generating**: Ensure `html-pdf-node` installed; Railway may need Chrome dep
- **401 errors**: JWT_SECRET mismatch between deploys
