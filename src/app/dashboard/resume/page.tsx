'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StudentProfile } from '@/lib/types';
import { ResumeViewer } from '@/components/resume/ResumeViewer';
import { FileCheck, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function ResumeDashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/profile');
        const data = await res.json();

        if (res.status === 401) {
          router.push('/login');
          return;
        }

        if (data.success && data.profile) {
          setProfile(data.profile);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
        <p className="text-sm text-slate-300 font-medium">Generating ATS resume preview from profile data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Single Profile • ATS Resume Generator</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">ATS Resume Builder & PDF Exporter</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Auto-generated from your structured student profile. Guaranteed text-selectable ATS vector PDF.
          </p>
        </div>

        <Link
          href="/dashboard/profile"
          className="px-4 py-2 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Edit Profile Data</span>
        </Link>
      </div>

      {profile ? <ResumeViewer profile={profile} /> : <div className="text-slate-400 text-center">No profile loaded</div>}
    </div>
  );
}
