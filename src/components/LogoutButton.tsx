'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Loader2 } from 'lucide-react';

export function LogoutButton({ className = '', variant = 'compact' }: { className?: string; variant?: 'compact' | 'full' }) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoggingOut(false);
    }
  };

  if (variant === 'full') {
    return (
      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className={`px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-rose-500/60 text-slate-300 hover:text-rose-300 text-xs font-semibold transition flex items-center space-x-1.5 disabled:opacity-50 ${className}`}
      >
        {loggingOut ? <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" /> : <LogOut className="w-3.5 h-3.5 text-rose-400" />}
        <span>{loggingOut ? 'Signing Out...' : 'Sign Out'}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loggingOut}
      title="Sign Out of Session"
      className={`p-2 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-rose-500/60 text-slate-400 hover:text-rose-400 text-xs transition flex items-center space-x-1 disabled:opacity-50 ${className}`}
    >
      {loggingOut ? <Loader2 className="w-4 h-4 animate-spin text-rose-400" /> : <LogOut className="w-4 h-4" />}
    </button>
  );
}
