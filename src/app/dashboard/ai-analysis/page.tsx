'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StudentProfile, Project } from '@/lib/types';
import { ProjectAnalysisResult, JDMatchResult } from '@/lib/ai-service';
import {
  Sparkles,
  Bot,
  CheckCircle2,
  AlertCircle,
  FolderGit2,
  Briefcase,
  Loader2,
  ArrowRight,
  Zap,
  Target,
  FileText,
} from 'lucide-react';

export default function AIAnalysisPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Project Analysis State
  const [analyzingProjId, setAnalyzingProjId] = useState<string | null>(null);
  const [projectResults, setProjectResults] = useState<Record<string, ProjectAnalysisResult>>({});

  // JD Match State
  const [jdText, setJdText] = useState('');
  const [matchingJd, setMatchingJd] = useState(false);
  const [jdResult, setJdResult] = useState<JDMatchResult | null>(null);

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

  const handleAnalyzeProject = async (projectId: string) => {
    setAnalyzingProjId(projectId);
    try {
      const res = await fetch('/api/ai/analyze-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });
      const data = await res.json();
      if (data.success) {
        setProjectResults((prev) => ({ ...prev, [projectId]: data.analysis }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzingProjId(null);
    }
  };

  const handleMatchJd = async () => {
    if (!jdText.trim()) return;
    setMatchingJd(true);
    setJdResult(null);

    try {
      const res = await fetch('/api/ai/match-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jd_text: jdText }),
      });
      const data = await res.json();
      if (data.success) {
        setJdResult(data.jdMatch);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMatchingJd(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
        <p className="text-sm text-slate-300 font-medium">Initializing AI Analysis & Project Evaluator...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-purple-400 uppercase tracking-wider">
            <Bot className="w-4 h-4" />
            <span>Decoupled AI Engine • Project Scoring & JD Matcher</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">AI Placement Copilot</h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated project quality scoring, improvement suggestions, and target Job Description keyword gap analysis.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-emerald-400 font-mono flex items-center space-x-2">
          <Zap className="w-3.5 h-3.5" />
          <span>Decoupled AI Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* SECTION 1: Technical Project Quality Scoring */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <FolderGit2 className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">Project Quality Evaluator</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {(profile?.projects || []).length} Projects Available
            </span>
          </div>

          {(profile?.projects || []).length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No technical projects added to your profile yet. Add a project in your profile manager first.
            </div>
          ) : (
            <div className="space-y-6">
              {(profile?.projects || []).map((proj: any, idx: number) => {
                const analysis = projectResults[proj.id];
                const savedScore = proj.ai_score;
                const isAnalyzing = analyzingProjId === proj.id;

                return (
                  <div key={idx} className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-white text-sm">{proj.title}</h3>
                        <p className="text-xs text-slate-400">{proj.role}</p>
                      </div>

                      <button
                        onClick={() => handleAnalyzeProject(proj.id)}
                        disabled={isAnalyzing}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow transition flex items-center space-x-1.5 disabled:opacity-50"
                      >
                        {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-purple-300" />}
                        <span>{isAnalyzing ? 'Scoring...' : 'Score Project'}</span>
                      </button>
                    </div>

                    {/* Analysis Output */}
                    {(analysis || savedScore) && (
                      <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-300 uppercase font-mono">AI Quality Score</span>
                          <span className="font-mono font-extrabold text-indigo-400 text-sm">
                            {analysis ? `${analysis.score} / 100` : `${savedScore} / 100`}
                          </span>
                        </div>

                        {analysis?.suggestions && analysis.suggestions.length > 0 && (
                          <div className="space-y-1 text-xs pt-1 border-t border-slate-800">
                            <span className="font-semibold text-purple-300">Actionable Suggestions:</span>
                            <ul className="list-disc list-inside text-slate-400 space-y-0.5">
                              {analysis.suggestions.map((s, i) => (
                                <li key={i}>{s}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 2: Job Description (JD) to Profile Matcher */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-bold text-white">JD Match & Missing Skills Detector</h2>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase text-slate-300">
              Paste Target Placement Job Description (JD)
            </label>
            <textarea
              rows={5}
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste full job description text here (e.g. 'Looking for a Full-Stack Engineer with React, Python, PostgreSQL, Docker experience...')"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleMatchJd}
              disabled={matchingJd || !jdText.trim()}
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {matchingJd ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
              <span>{matchingJd ? 'Analyzing Skill Alignment...' : 'Analyze JD Match & Find Skill Gaps'}</span>
            </button>
          </div>

          {/* JD Match Analysis Output */}
          {jdResult && (
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">JD Profile Match Score</span>
                <span className="text-2xl font-black font-mono text-emerald-400">{jdResult.matchScore}%</span>
              </div>

              {/* Matched Keywords */}
              {jdResult.matchedSkills.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Matched Tech Stack ({jdResult.matchedSkills.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {jdResult.matchedSkills.map((sk, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 text-[11px] font-mono">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Skills */}
              {jdResult.missingSkills.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Missing Skills for JD ({jdResult.missingSkills.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {jdResult.missingSkills.map((sk, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300 text-[11px] font-mono">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {jdResult.recommendations.length > 0 && (
                <div className="pt-2 border-t border-slate-800 text-xs text-slate-300">
                  <span className="font-semibold text-indigo-300 block mb-1">Placement Preparation Advice:</span>
                  <ul className="list-disc list-inside text-slate-400 space-y-1">
                    {jdResult.recommendations.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
