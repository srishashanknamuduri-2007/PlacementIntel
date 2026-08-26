'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PortfolioViewer, TemplateType } from '@/components/portfolio/PortfolioViewer';
import { Copy, Check, Loader2, Sparkles, Eye, Layout, Globe } from 'lucide-react';
import Link from 'next/link';

const TEMPLATES: { id: TemplateType; label: string; desc: string }[] = [
  { id: 'modern-dark', label: '🌑 Modern Dark', desc: 'Sleek dark-mode with gradient accents' },
  { id: 'academic-clean', label: '📄 Academic Clean', desc: 'Professional light-mode, print-ready' },
  { id: 'tech-glass', label: '🔮 Tech Glass', desc: 'Futuristic glassmorphism design' },
];

export default function PortfolioPreviewDashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [publicUrl, setPublicUrl] = useState('');
  const [activeTemplate, setActiveTemplate] = useState<TemplateType>('modern-dark');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/profile');
        const data = await res.json();

        if (res.status === 401) { router.push('/login'); return; }

        if (data.success && data.profile) {
          const p = data.profile;
          const origin = window.location.origin;
          setPublicUrl(`${origin}/p/${p.register_number}`);

          // Build full preview profile — show ALL saved data regardless of visibility
          const visMap: Record<string, boolean> = {};
          (p.visibilities || []).forEach((v: any) => { visMap[v.section_name] = v.is_public; });

          setProfile({
            full_name: p.full_name,
            register_number: p.register_number,
            department: p.department,
            year_or_batch: p.year_or_batch,
            bio: p.bio,
            profile_photo_url: p.profile_photo_url,
            cgpa_overall: p.cgpa_overall,
            phone: p.phone,
            personal_email: p.personal_email,
            linkedin_url: p.linkedin_url,
            github_url: p.github_url,
            personal_website_url: p.personal_website_url,
            address: p.address,
            education: p.education,
            semester_cgpas: p.semester_cgpas || [],
            student_skills: p.student_skills || [],
            projects: p.projects || [],
            certifications: p.certifications || [],
            experiences: p.experiences || [],
            achievements: p.achievements || [],
            extracurriculars: p.extracurriculars || [],
            visibilities: visMap,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [router]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
        <p className="text-slate-400 text-sm">Loading your portfolio...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4 text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center">
          <Eye className="w-8 h-8 text-slate-500" />
        </div>
        <h2 className="text-xl font-bold text-white">No Profile Found</h2>
        <p className="text-slate-400 text-sm max-w-xs">Complete your profile first to preview your portfolio.</p>
        <Link href="/dashboard/profile" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition">
          Build Your Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            <span>Portfolio Preview</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">This is how employers see your portfolio. Sections marked private won&apos;t appear on your public URL.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300 font-mono max-w-[260px] truncate">
            <Globe className="w-3.5 h-3.5 text-indigo-400 mr-2 flex-shrink-0" />
            <span className="truncate">{publicUrl}</span>
          </div>
          <button
            onClick={handleCopyLink}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium transition flex items-center space-x-1.5"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>

      {/* Template Switcher */}
      <div className="flex flex-wrap gap-3">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTemplate(t.id)}
            className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition flex items-center space-x-2 ${
              activeTemplate === t.id
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/40'
                : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-700/60'
            }`}
          >
            <Layout className="w-4 h-4" />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Portfolio Viewer */}
      <div className="rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
        <PortfolioViewer profile={profile} template={activeTemplate} />
      </div>
    </div>
  );
}
