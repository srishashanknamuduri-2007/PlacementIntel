# Student Professional Portfolio & Placement Intelligence Platform
### University Production Edition

A unified web platform where every college student creates **one structured profile source of truth** (education, skills graph, technical projects, certifications, experiences, achievements). From that single source of truth, the system automatically generates three targeted downstream outputs:

1. **Student View**: Live field-level profile completeness engine, 3 ATS-friendly vector PDF resume templates, public portfolio link manager, and decoupled AI placement copilot.
2. **T&P Admin View**: Real-time placement analytics dashboard, compound skill-graph SQL query candidate finder, and RFC-4180 CSV shortlist exporter.
3. **Public / Recruiter View**: High-performance SSR public portfolio pages (`/p/[username]`) displaying strictly student-permissioned public sections.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: Next.js 14 (React 18), Tailwind CSS (Glassmorphism Dark Theme & Clean Light Themes), Lucide React.
- **Backend API**: Next.js App Router API endpoints with Zod schema validation & JWT session cookies.
- **Database Schema**: Relational PostgreSQL schema defined via Prisma ORM (`prisma/schema.prisma`).
- **Auth**: Institutional **Register Number + Password** login with college email domain verification (`email_verified`).
- **PDF Pipeline**: Vector text-selectable ATS PDF compiler engine.
- **Decoupled AI Engine**: Fault-tolerant microservice wrapper (`src/lib/ai-service.ts`) with a 3-second circuit breaker and fallback heuristics so core profile CRUD, public portfolios, and PDF resume generation operate seamlessly with 0% downtime even if AI API keys are offline or rate-limited.

---

## 🌐 Platform Route Sitemap

| Route | Role / Audience | Description |
|---|---|---|
| `/` | Public | Hero landing page introducing platform features |
| `/signup` | Student | Account registration with register number uniqueness check |
| `/login` | Student / Admin | **Register Number + Password** login with single-click auto-verify & quick demo credentials |
| `/dashboard/profile` | Student | Multi-section profile stepper, per-section visibility toggles (`ProfileVisibility`), and live completeness meter |
| `/dashboard/portfolio-preview` | Student | Live recruiter preview & shareable public URL manager (`/p/[username]`) |
| `/p/[username]` | Public / Recruiters | **SSR Fast Page** displaying only student-permissioned public sections |
| `/dashboard/resume` | Student | 3 ATS-friendly resume templates with vector PDF exporter |
| `/admin/dashboard` | T&P Admin / College Admin | Compound SQL search, aggregate placement analytics, candidate inspector, and CSV exporter |
| `/dashboard/ai-analysis` | Student | AI Placement Copilot for project quality scoring & target JD keyword gap analysis |
| `/test-suite` | All | Automated acceptance test suite dashboard verifying all 5 phases |

---

## 🔑 Quick Demo Credentials (Pre-Verified)

For instant local testing without manual registration:
- **Student Account**: Register Number `21CS045` | Password `Student@123`
- **T&P Admin Account**: Register Number `ADMIN001` | Password `Admin@12345`

---

## 🚀 Local Setup & Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your web browser.

4. **Run Acceptance Test Suite**:
   Navigate to `http://localhost:3000/test-suite` to view live automated test execution results across all 5 phases.

---

## 📄 Documentation Artifacts

- [`DECISIONS.md`](file:///C:/Users/SRI%20SHASHANK/.gemini/antigravity/scratch/placement-intel-platform/DECISIONS.md) — Technical decision record detailing database ORM choices, template specs, and decoupled AI circuit breaker design.
- [`walkthrough.md`](file:///C:/Users/SRI%20SHASHANK/.gemini/antigravity/brain/52bcf61c-a17f-4ca5-a66c-d25591568810/walkthrough.md) — Comprehensive end-to-end acceptance criteria checklist and verification report.
