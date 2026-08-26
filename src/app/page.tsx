import Link from 'next/link';
import { ArrowRight, CheckCircle2, ShieldCheck, Zap, Award, Sparkles, Code2, Users, Building2, BarChart3, Target, Download } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative overflow-hidden py-16 sm:py-24">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 text-xs font-semibold uppercase tracking-wider shadow-inner">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Single Profile • Triple Audience Outputs • T&P Command Center</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            One Structured Profile.{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              Unlimited Placement Potential.
            </span>
          </h1>

          <p className="text-lg text-slate-300 font-normal leading-relaxed">
            Fill your comprehensive academic, project, skill, and certification profile once.
            Our platform automatically powers public recruiter portfolios, ATS-compliant resumes, and institutional T&P placement intelligence.
          </p>

          {/* Role Entry Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition group"
            >
              <span>Create Student Account</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800/80 font-bold transition flex items-center justify-center space-x-2 shadow-md"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Student / Admin Sign In</span>
            </Link>

            <Link
              href="/login?role=admin"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-500/40 text-amber-300 hover:text-white hover:bg-amber-600 font-bold transition flex items-center justify-center space-x-2"
            >
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>T&P Officer Portal</span>
            </Link>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-6 rounded-3xl border border-slate-800/80 hover:border-indigo-500/40 transition space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-900/50 border border-indigo-700/40 flex items-center justify-center text-indigo-400 mb-2">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Live Completeness Meter</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Field-level percentage tracking with precise, actionable gap recommendations highlighting missing projects, links, or percentage details.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-slate-800/80 hover:border-purple-500/40 transition space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-900/50 border border-purple-700/40 flex items-center justify-center text-purple-400 mb-2">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Corporate Drive Simulator</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Placement officers can define custom corporate cutoff criteria (CGPA, Skills, Projects) and instantly calculate the shortlisted candidate funnel.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-slate-800/80 hover:border-amber-500/40 transition space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-900/50 border border-amber-700/40 flex items-center justify-center text-amber-400 mb-2">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Institutional Skill Analytics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time heatmaps for in-demand tech skills, department-wise average CGPAs, and one-click filtered candidate shortlist exports.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
