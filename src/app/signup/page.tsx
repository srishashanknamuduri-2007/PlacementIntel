'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserCheck, AlertCircle, CheckCircle2, ArrowRight, ShieldCheck, Mail, Zap, Loader2 } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    register_number: '',
    college_email: '',
    full_name: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [verifyingNow, setVerifyingNow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    message: string;
    verificationLink?: string;
    registerNumber: string;
    password: string;
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessData(null);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Signup failed');
      }

      router.push('/dashboard/profile');
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  const handleInstantVerifyAndLogin = async () => {
    if (!successData) return;
    setVerifyingNow(true);

    try {
      // 1. Verify account
      const vRes = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ register_number: successData.registerNumber }),
      });
      const vData = await vRes.json();
      if (!vRes.ok || !vData.success) {
        throw new Error(vData.error || 'Instant verification failed');
      }

      // 2. Log in immediately
      const lRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          register_number: successData.registerNumber,
          password: successData.password,
        }),
      });
      const lData = await lRes.json();
      if (!lRes.ok || !lData.success) {
        throw new Error(lData.error || 'Login failed after verification');
      }

      router.push('/dashboard/profile');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setVerifyingNow(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-md w-full glass-panel p-8 rounded-2xl border border-slate-800 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-indigo-900/60 border border-indigo-700/50 text-indigo-400 mx-auto flex items-center justify-center mb-3 shadow-inner">
            <UserCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Student Registration</h2>
          <p className="text-xs text-slate-400 mt-1">
            Institutional account setup for placement portfolio creation
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-200 text-sm flex items-start space-x-3 shadow-lg">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="leading-snug">{error}</div>
          </div>
        )}

        {successData ? (
          <div className="p-6 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-200 space-y-4">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
              <h3 className="font-semibold text-lg text-white">Registration Successful!</h3>
            </div>
            <p className="text-sm text-emerald-300 leading-relaxed">{successData.message}</p>

            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleInstantVerifyAndLogin}
                disabled={verifyingNow}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl text-sm shadow-lg transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {verifyingNow ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 text-emerald-200" />
                )}
                <span>{verifyingNow ? 'Verifying & Logging In...' : '⚡ Verify Account Now & Go To Dashboard'}</span>
              </button>

              <Link
                href="/login"
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium rounded-xl text-xs transition flex items-center justify-center space-x-1"
              >
                <span>Go to Login Page</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Register Number <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="register_number"
                required
                value={formData.register_number}
                onChange={handleChange}
                placeholder="e.g. 21CS045"
                className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase tracking-wide font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">This will be your primary login identifier.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                College Email <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                name="college_email"
                required
                value={formData.college_email}
                onChange={handleChange}
                placeholder="student@college.edu"
                className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Must be your official university email domain.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="full_name"
                required
                value={formData.full_name}
                onChange={handleChange}
                placeholder="e.g. Alex Rivera"
                className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Create Password <span className="text-rose-400">*</span>
              </label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-600/30 transition flex items-center justify-center space-x-2 disabled:opacity-50 mt-6"
            >
              {loading ? (
                <span>Registering Account...</span>
              ) : (
                <>
                  <span>Create Account & Verify</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-slate-800 text-center text-xs text-slate-400">
          Already registered?{' '}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold underline">
            Log in with Register Number
          </Link>
        </div>
      </div>
    </div>
  );
}
