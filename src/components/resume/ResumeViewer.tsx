'use client';

import React, { useState } from 'react';
import { StudentProfile } from '@/lib/types';
import { ClassicATSTemplate } from './ClassicATS';
import { ModernTwoColumnTemplate } from './ModernTwoColumn';
import { CompactEngineeringTemplate } from './CompactEngineering';
import { Download, FileText, Check, Loader2, Sparkles } from 'lucide-react';

export type ResumeTemplateType = 'classic' | 'modern' | 'compact';

export function ResumeViewer({ profile }: { profile: StudentProfile }) {
  const [template, setTemplate] = useState<ResumeTemplateType>('classic');
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/resume/download?t=${template}`);
      if (!res.ok) throw new Error('PDF compilation failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${profile.full_name.replace(/\s+/g, '_')}_Resume_${template.toUpperCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Failed to download PDF. Generating fallback text-selectable PDF.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Template Control Bar */}
      <div className="sticky top-16 z-40 max-w-3xl mx-auto px-4">
        <div className="glass-panel p-4 rounded-2xl border border-slate-700/80 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/90 backdrop-blur-md">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Select ATS Resume Template</span>
          </div>

          <div className="flex items-center space-x-2">
            {[
              { id: 'classic', name: 'Classic ATS (Single-Column)' },
              { id: 'modern', name: 'Modern Tech (Two-Column)' },
              { id: 'compact', name: 'Compact Engineering' },
            ].map((t) => {
              const isActive = template === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id as ResumeTemplateType)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center space-x-1.5 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {isActive && <Check className="w-3.5 h-3.5 text-white" />}
                  <span>{t.name}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/30 transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>{downloading ? 'Compiling PDF...' : 'Download ATS PDF'}</span>
          </button>
        </div>
      </div>

      {/* Live Preview Screen */}
      <div className="max-w-3xl mx-auto">
        {template === 'classic' && <ClassicATSTemplate profile={profile} />}
        {template === 'modern' && <ModernTwoColumnTemplate profile={profile} />}
        {template === 'compact' && <CompactEngineeringTemplate profile={profile} />}
      </div>
    </div>
  );
}
