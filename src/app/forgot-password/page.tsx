'use client';

import { useState } from 'react';
import Link from 'next/link';
import { KeyRound, AlertCircle, Mail, ArrowRight } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [collegeEmail, setCollegeEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultData, setResultData] = useState<{ message: string; resetLink?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResultData(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ college_email: collegeEmail }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Password recovery failed');
      }

      setResultData({ message: data.message, resetLink: data.resetLink });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full glass-panel p-8 rounded-2xl border border-slate-800">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-purple-900/60 border border-purple-700/50 text-purple-400 mx-auto flex items-center justify-center mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Password Recovery</h2>
          <p className="text-xs text-slate-400 mt-1">
            Enter your college email on file to receive password reset instructions
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-sm flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        {resultData ? (
          <div className="p-6 rounded-xl bg-purple-950/80 border border-purple-800 text-purple-200 space-y-4 text-center">
            <Mail className="w-8 h-8 text-purple-400 mx-auto" />
            <h3 className="font-semibold text-lg text-white">Reset Link Dispatched</h3>
            <p className="text-xs text-purple-200 leading-relaxed">{resultData.message}</p>

            {resultData.resetLink && (
              <div className="mt-4 pt-4 border-t border-purple-800/60 text-xs text-left">
                <p className="font-semibold text-purple-300 mb-1">Instant Reset Link (Dev Mode):</p>
                <a
                  href={resultData.resetLink}
                  className="text-indigo-300 hover:text-indigo-200 underline break-all font-mono"
                >
                  {resultData.resetLink}
                </a>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                College Email Address
              </label>
              <input
                type="email"
                required
                value={collegeEmail}
                onChange={(e) => setCollegeEmail(e.target.value)}
                placeholder="student@college.edu"
                className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                College email is the designated channel for password reset.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-purple-600/30 transition flex items-center justify-center space-x-2 disabled:opacity-50 mt-6"
            >
              {loading ? <span>Sending...</span> : <span>Send Reset Instructions</span>}
            </button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-slate-800 text-center text-xs text-slate-400">
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 underline font-medium">
            Back to Student Login
          </Link>
        </div>
      </div>
    </div>
  );
}
