'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [regNo, setRegNo] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setErrorMessage('Missing verification token in URL.');
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Verification failed');
        }

        setSuccessMessage(data.message);
        setRegNo(data.register_number);
      } catch (err: any) {
        setErrorMessage(err.message);
      } font-medium {
        setLoading(false);
      }
    };

    verify();
  }, [token]);

  return (
    <div className="max-w-md w-full glass-panel p-8 rounded-2xl border border-slate-800 text-center">
      {loading ? (
        <div className="space-y-4 py-8">
          <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-300 font-medium">Verifying your college email address...</p>
        </div>
      ) : errorMessage ? (
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-950/80 border border-rose-800 text-rose-400 mx-auto flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Verification Failed</h2>
          <p className="text-sm text-rose-300 leading-relaxed">{errorMessage}</p>
          <div className="pt-4">
            <Link
              href="/signup"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition"
            >
              <span>Back to Registration</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Email Verified!</h2>
          <p className="text-sm text-emerald-200 leading-relaxed">{successMessage}</p>

          {regNo && (
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono">
              Login Register Number: <span className="text-indigo-400 font-bold">{regNo}</span>
            </div>
          )}

          <div className="pt-4">
            <Link
              href="/login"
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition flex items-center justify-center space-x-2"
            >
              <span>Log In Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <Suspense fallback={<Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
