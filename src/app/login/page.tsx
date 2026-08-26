'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  LogIn,
  AlertCircle,
  ShieldCheck,
  Mail,
  ArrowRight,
  Zap,
  CheckCircle2,
  Loader2,
  Sparkles,
  Lock,
  GraduationCap,
  Building2,
  ArrowLeft,
  KeyRound,
  FileCheck,
  Check,
  BarChart3,
  Users,
} from 'lucide-react';

type PortalRole = 'selection' | 'student' | 'admin';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mode: 'selection' (the page with 2 buttons), 'student', or 'admin'
  const [portalMode, setPortalMode] = useState<PortalRole>('selection');

  const [formData, setFormData] = useState({
    register_number: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [autoVerifying, setAutoVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unverifiedNotice, setUnverifiedNotice] = useState<{
    college_email: string;
  } | null>(null);

  const [notFoundNotice, setNotFoundNotice] = useState<{
    register_number: string;
  } | null>(null);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'admin') {
      openAdminPortal();
    } else if (roleParam === 'student') {
      openStudentPortal();
    }
  }, [searchParams]);

  const openStudentPortal = () => {
    setPortalMode('student');
    setFormData({ register_number: '', password: '' });
    setError(null);
    setUnverifiedNotice(null);
    setNotFoundNotice(null);
  };

  const openAdminPortal = () => {
    setPortalMode('admin');
    setFormData({ register_number: '', password: '' });
    setError(null);
    setUnverifiedNotice(null);
    setNotFoundNotice(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
    setUnverifiedNotice(null);
    setNotFoundNotice(null);
  };

  const handleStudentDemoFill = (regNo: string, pass: string) => {
    setFormData({ register_number: regNo, password: pass });
    setError(null);
    setUnverifiedNotice(null);
    setNotFoundNotice(null);
  };

  const executeLogin = async (payload = formData) => {
    setLoading(true);
    setError(null);
    setUnverifiedNotice(null);
    setNotFoundNotice(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.status === 401 && data.notFound) {
        setNotFoundNotice({ register_number: data.register_number });
        throw new Error(data.error);
      }

      if (res.status === 403 && data.unverified) {
        setUnverifiedNotice({ college_email: data.college_email });
        throw new Error(data.error);
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Login failed');
      }

      // Successful Login -> Redirect based on role
      if (data.user?.role === 'TPO_ADMIN' || data.user?.role === 'COLLEGE_ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard/profile');
      }
    } catch (err: any) {
      setError(err.message || 'Login attempt failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin();
  };

  const handleInstantVerifyAndLogin = async () => {
    if (!formData.register_number) return;
    setAutoVerifying(true);

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ register_number: formData.register_number }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Verification failed');
      }

      await executeLogin();
    } catch (err: any) {
      setError(err.message || 'Failed to auto-verify email');
    } finally {
      setAutoVerifying(false);
    }
  };

  const handleInstantRegisterAndLogin = async () => {
    if (!formData.register_number || !formData.password) return;
    setAutoVerifying(true);
    setError(null);

    try {
      const regNo = formData.register_number.trim().toUpperCase();
      const signupRes = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          register_number: regNo,
          college_email: `${regNo.toLowerCase()}@college.edu`,
          full_name: `Student ${regNo}`,
          password: formData.password,
        }),
      });

      const signupData = await signupRes.json();
      if (!signupRes.ok && signupRes.status !== 409) {
        throw new Error(signupData.error || 'Failed to auto-register account');
      }

      await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ register_number: regNo }),
      });

      setNotFoundNotice(null);
      await executeLogin();
    } catch (err: any) {
      setError(err.message || 'Failed to auto-register account');
    } finally {
      setAutoVerifying(false);
    }
  };

  // ==========================================
  // VIEW 1: PORTAL SELECTION GATEWAY (2 BUTTONS)
  // ==========================================
  if (portalMode === 'selection') {
    return (
      <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-600/15 rounded-full blur-[160px] pointer-events-none" />

        <div className="max-w-4xl w-full space-y-10 relative z-10">
          {/* Header Title */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-indigo-300 text-xs font-mono font-bold uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>SRKR Engineering College • Placement Intel Platform</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Select Your Access Portal
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
              Choose your role below to access the Student Career Builder or T&P Officer Command Center.
            </p>
          </div>

          {/* TWO MAIN PORTAL CARDS / BUTTONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* BUTTON 1: STUDENT PORTAL */}
            <div
              onClick={openStudentPortal}
              className="group cursor-pointer p-8 rounded-3xl bg-slate-900/70 hover:bg-slate-900/90 backdrop-blur-xl border-2 border-slate-800 hover:border-indigo-500 shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-950 border border-indigo-600/50 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(99,102,241,0.4)] transition">
                  <GraduationCap className="w-8 h-8" />
                </div>

                <div>
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-indigo-950 text-indigo-300 text-[11px] font-mono font-bold uppercase tracking-wider mb-2">
                    <span>Student Access</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white group-hover:text-indigo-300 transition">
                    Student Career Portal
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Build your structured profile, generate ATS-optimized resumes, and preview your live recruiter portfolio.
                  </p>
                </div>

                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <span>Single Profile Completeness Engine</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <span>ATS PDF Resume Exporter (Classic & Modern)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <span>Public Recruiter Portfolio URL</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openStudentPortal();
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition flex items-center justify-center space-x-2 group-hover:shadow-indigo-600/50"
              >
                <span>Enter Student Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>
            </div>

            {/* BUTTON 2: T&P ADMIN PORTAL */}
            <div
              onClick={openAdminPortal}
              className="group cursor-pointer p-8 rounded-3xl bg-slate-900/70 hover:bg-slate-900/90 backdrop-blur-xl border-2 border-slate-800 hover:border-amber-500 shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-950 border border-amber-600/50 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] transition">
                  <Building2 className="w-8 h-8" />
                </div>

                <div>
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-amber-950 text-amber-300 text-[11px] font-mono font-bold uppercase tracking-wider mb-2">
                    <span>T&P Officer Authority</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white group-hover:text-amber-300 transition">
                    T&P Admin Command Center
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    T&P SRKR placement operations, candidate shortlisting, company drive eligibility matching, and analytics.
                  </p>
                </div>

                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>Company Drive Eligibility Simulator</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>Candidate Search & CSV Shortlist Exporter</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>Skill Distribution & Branch CGPA Heatmaps</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openAdminPortal();
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-sm shadow-lg shadow-amber-600/30 transition flex items-center justify-center space-x-2 group-hover:shadow-amber-600/50"
              >
                <span>Enter T&P Admin Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: DEDICATED LOGIN FORM (STUDENT OR ADMIN)
  // ==========================================
  return (
    <div className="min-h-[88vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 relative">
      {/* Background glow */}
      <div className={`absolute top-1/4 left-1/3 w-80 h-80 rounded-full blur-[140px] pointer-events-none ${portalMode === 'admin' ? 'bg-amber-600/15' : 'bg-indigo-600/15'}`} />

      <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl relative z-10 space-y-6">
        {/* Back to Portal Selection Button */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setPortalMode('selection')}
            className="text-xs font-semibold text-slate-400 hover:text-white transition flex items-center space-x-1.5 py-1 px-2.5 rounded-lg bg-slate-900 border border-slate-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Change Portal</span>
          </button>

          <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-[11px] font-semibold">
            <button
              type="button"
              onClick={openStudentPortal}
              className={`px-2.5 py-1 rounded-lg transition ${portalMode === 'student' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={openAdminPortal}
              className={`px-2.5 py-1 rounded-lg transition ${portalMode === 'admin' ? 'bg-amber-600 text-white' : 'text-slate-400'}`}
            >
              T&P Admin
            </button>
          </div>
        </div>

        {/* Portal Header */}
        <div className="text-center">
          {portalMode === 'admin' ? (
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-600/40 text-amber-400 mx-auto flex items-center justify-center shadow-lg shadow-amber-950/50">
                <Building2 className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">T&P SRKR Admin Portal</h2>
              <p className="text-xs text-amber-300/80">
                SRKR Engineering College • Training & Placement Authority
              </p>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-700/50 text-amber-300 text-[10px] font-mono font-bold tracking-wider uppercase">
                <Lock className="w-3 h-3 text-amber-400" />
                <span>Authorized Officer Login</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-950/80 border border-indigo-600/40 text-indigo-400 mx-auto flex items-center justify-center shadow-lg shadow-indigo-950/50">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Student Login</h2>
              <p className="text-xs text-slate-400">
                Sign in with your University Register Number
              </p>
            </div>
          )}
        </div>

        {/* Quick Demo Fill Bar (When in Student mode) */}
        {portalMode === 'student' && (
          <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <span>Quick Student Demo:</span>
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <button
              type="button"
              onClick={() => handleStudentDemoFill('21CS045', 'Student@123')}
              className="w-full px-3 py-2 rounded-xl bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 hover:text-white hover:bg-indigo-900 transition text-[11px] font-mono text-left flex justify-between items-center"
            >
              <div>
                <span className="font-bold block text-white">Student Demo Account</span>
                <span>21CS045 • Student@123</span>
              </div>
              <span className="text-[10px] bg-indigo-900 px-2 py-0.5 rounded text-indigo-200">Fill</span>
            </button>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-800/80 text-rose-200 text-sm flex items-start space-x-3 shadow-lg">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="leading-snug">
              <p className="font-semibold text-rose-300 mb-0.5">Authentication Notice</p>
              <p className="text-xs text-rose-200">{error}</p>
            </div>
          </div>
        )}

        {unverifiedNotice && (
          <div className="p-4 rounded-2xl bg-amber-950/80 border border-amber-800/80 text-amber-200 text-sm space-y-3 shadow-lg">
            <div className="flex items-center space-x-2 font-semibold text-amber-300">
              <Mail className="w-4 h-4 text-amber-400" />
              <span>Email Verification Required</span>
            </div>
            <p className="text-xs text-amber-200 leading-relaxed">
              Your college email ({unverifiedNotice.college_email}) is unverified.
            </p>
            <button
              type="button"
              onClick={handleInstantVerifyAndLogin}
              disabled={autoVerifying}
              className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-semibold text-xs transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {autoVerifying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-amber-200" />
              )}
              <span>{autoVerifying ? 'Verifying Account...' : '⚡ Verify Account Now & Log In'}</span>
            </button>
          </div>
        )}

        {notFoundNotice && (
          <div className="p-4 rounded-2xl bg-indigo-950/80 border border-indigo-700/80 text-indigo-200 text-sm space-y-3 shadow-lg">
            <div className="flex items-center space-x-2 font-semibold text-indigo-300">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Register Number Not Registered Yet</span>
            </div>
            <p className="text-xs text-indigo-200 leading-relaxed">
              Register number <strong className="text-white font-mono">{notFoundNotice.register_number}</strong> is not registered. Click below to instantly create this student account and log in!
            </p>
            <button
              type="button"
              onClick={handleInstantRegisterAndLogin}
              disabled={autoVerifying}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-semibold text-xs transition flex items-center justify-center space-x-2 disabled:opacity-50 shadow-md"
            >
              {autoVerifying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-amber-300" />
              )}
              <span>{autoVerifying ? 'Creating Account & Logging in...' : `⚡ Instant Register & Log In as ${notFoundNotice.register_number}`}</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              {portalMode === 'admin' ? 'Admin Username' : 'Student Register Number'}
            </label>
            <input
              type="text"
              name="register_number"
              required
              value={formData.register_number}
              onChange={handleChange}
              placeholder={portalMode === 'admin' ? 'Enter Officer ID / Username' : 'e.g. 24B91A05M9, 21CS045'}
              className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase tracking-wide font-mono"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-indigo-400 hover:text-indigo-300 transition"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 text-white font-bold rounded-xl text-sm shadow-lg transition flex items-center justify-center space-x-2 disabled:opacity-50 mt-6 ${
              portalMode === 'admin'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-600/30'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-600/30'
            }`}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating Credentials...</span>
              </div>
            ) : (
              <>
                <span>{portalMode === 'admin' ? 'Log In as T&P SRKR Admin' : 'Log In to Student Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {portalMode === 'student' && (
          <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
            New student?{' '}
            <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 font-semibold underline">
              Register your student account
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
