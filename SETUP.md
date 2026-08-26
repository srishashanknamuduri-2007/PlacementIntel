# 🚀 Student Placement Intelligence Platform — Full-Stack Setup Guide

## ✅ What's Running RIGHT NOW (Without Any Setup)

The app runs **completely out of the box** with an in-memory database. Just do:

```bash
cd "C:\Users\SRI SHASHANK\.gemini\antigravity\scratch\placement-intel-platform"
npm run dev
```

Open `http://localhost:3000` and log in with:
- **Student**: `21CS045` / `Student@123`
- **Admin**: `ADMIN001` / `Admin@12345`

> In-memory mode is perfect for development. All data resets on server restart.

---

## 🗄️ Step 1 — Connect Real PostgreSQL Database

### Option A: Free Cloud DB (Recommended — Neon, no install required)

1. Go to **https://neon.tech** → Create free account → Create project
2. Copy the connection string (looks like `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`)
3. Open `.env` and add:
   ```env
   DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require"
   ```

### Option B: Free Cloud DB (Supabase)

1. Go to **https://supabase.com** → Create free project
2. Go to Settings → Database → Connection String (URI) → Copy
3. Add to `.env`:
   ```env
   DATABASE_URL="postgresql://postgres.xxx:[password]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"
   ```

### Option C: Local PostgreSQL

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/placement_intel?schema=public"
```

---

## 🔧 Step 2 — Apply Database Schema

After setting `DATABASE_URL`, run:

```bash
npm run db:push
```

This creates all tables (User, StudentProfile, Education, Skills, Projects, etc.) in your PostgreSQL database.

---

## 🌱 Step 3 — Seed Demo Data

```bash
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
```

This creates the pre-verified `21CS045 / Student@123` demo student account with full profile data in your real PostgreSQL database.

---

## 🤖 Step 4 — Enable Live AI (Gemini)

1. Get a **free Gemini API key** at: https://aistudio.google.com/app/apikey
2. Open `.env` and set:
   ```env
   ENABLE_AI=true
   GEMINI_API_KEY=your_key_here
   ```

The AI analysis page (`/dashboard/ai-analysis`) will now use **live Gemini 1.5 Flash** for:
- Project quality scoring (0–100 with actionable improvement suggestions)
- Job Description keyword gap analysis

> Even with `ENABLE_AI=false`, the platform works 100% with heuristic fallback scoring.

---

## 🔄 How the App Switches Between Modes

```
DATABASE_URL set?
├── YES → Uses PostgreSQL via Prisma ORM (persistent data)
└── NO  → Uses in-memory store (data resets on restart, great for dev)

ENABLE_AI=true + GEMINI_API_KEY set?
├── YES → Uses live Gemini 1.5 Flash API (5s circuit breaker)
└── NO  → Uses heuristic rule-based fallback (instant, zero latency)
```

---

## 📊 Platform Routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/login` | Login with Register Number + Password |
| `/signup` | New student registration |
| `/dashboard/profile` | Multi-section profile manager + live completeness meter |
| `/dashboard/portfolio-preview` | Portfolio template picker & shareable link |
| `/p/[username]` | Public SSR recruiter-facing portfolio |
| `/dashboard/resume` | ATS resume builder + PDF download |
| `/admin/dashboard` | T&P placement analytics dashboard |
| `/dashboard/ai-analysis` | AI project scoring + JD gap analysis |

---

## ✅ Profile Completeness = 100%

Fill in all these sections to reach 100%:
1. **Personal**: Name, Department, Year, Phone, Personal Email, LinkedIn, GitHub, Address, Bio
2. **Education**: 10th %, Board, 12th %, Degree, Specialization, Graduation Year
3. **CGPA**: Overall + at least 1 semester entry
4. **Skills**: At least 3 skills with proficiency levels
5. **Projects**: At least 1 project
6. **Certifications**: At least 1 certification
7. **Experience**: At least 1 internship or work experience entry
8. **Achievements**: At least 1 achievement

Optional (bonus points): Portfolio/website URL, Profile photo
