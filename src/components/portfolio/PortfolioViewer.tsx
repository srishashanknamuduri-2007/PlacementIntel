'use client';

import React, { useState } from 'react';
import { ModernDark } from './ModernMinimal';
import { AcademicClean } from './AcademicClean';
import { TechGlass } from './TechDarkGlass';
import { Layout } from 'lucide-react';

export type TemplateType = 'modern-dark' | 'academic-clean' | 'tech-glass' | 'dark' | 'light' | 'tech';

interface Props {
  profile: any;
  template?: TemplateType;
  initialTemplate?: TemplateType;
  showControls?: boolean;
}

export function PortfolioViewer({ profile, template, initialTemplate = 'modern-dark', showControls = false }: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>(() => {
    if (template) return template;
    if (initialTemplate === 'dark') return 'modern-dark';
    if (initialTemplate === 'light') return 'academic-clean';
    if (initialTemplate === 'tech') return 'tech-glass';
    return initialTemplate;
  });

  if (!profile) return null;

  const currentTpl = template || selectedTemplate;

  const renderTemplate = () => {
    switch (currentTpl) {
      case 'academic-clean':
      case 'light':
        return <AcademicClean profile={profile} />;
      case 'tech-glass':
      case 'tech':
        return <TechGlass profile={profile} />;
      case 'modern-dark':
      case 'dark':
      default:
        return <ModernDark profile={profile} />;
    }
  };

  return (
    <div className="w-full">
      {showControls && (
        <div className="sticky top-4 z-50 max-w-xl mx-auto mb-6 px-4">
          <div className="glass-panel p-2.5 rounded-2xl border border-slate-700 bg-slate-900/90 backdrop-blur-md shadow-2xl flex items-center justify-center gap-2">
            {[
              { id: 'modern-dark', label: '🌑 Modern Dark' },
              { id: 'academic-clean', label: '📄 Academic Clean' },
              { id: 'tech-glass', label: '🔮 Tech Glass' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTemplate(t.id as TemplateType)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
                  currentTpl === t.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Layout className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {renderTemplate()}
    </div>
  );
}
