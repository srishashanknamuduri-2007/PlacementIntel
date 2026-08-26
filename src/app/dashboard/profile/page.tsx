'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { calculateCompleteness } from '@/lib/completeness';
import { StudentProfile, ProfileVisibility, Skill } from '@/lib/types';
import {
  User,
  GraduationCap,
  Wrench,
  FolderGit2,
  Award,
  Briefcase,
  Trophy,
  Activity,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Save,
  Loader2,
  Sparkles,
  ChevronRight,
  LogOut,
} from 'lucide-react';

export default function ProfileDashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('personal');
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);

  // Local Form Draft State for smooth editing
  const [personalForm, setPersonalForm] = useState({
    full_name: '',
    department: 'Computer Science',
    year_or_batch: '2024-2028',
    phone: '',
    personal_email: '',
    linkedin_url: '',
    github_url: '',
    personal_website_url: '',
    address: '',
    bio: '',
    cgpa_overall: '',
  });

  const [educationForm, setEducationForm] = useState({
    tenth_percentage: '90',
    tenth_board: 'CBSE',
    twelfth_percentage_or_diploma_details: '92',
    twelfth_board: 'CBSE',
    current_degree: 'B.Tech',
    specialization: 'Computer Science & Engineering',
    expected_graduation_year: '2028',
  });

  const [semesterCgpas, setSemesterCgpas] = useState<
    { semester_number: number; cgpa: number }[]
  >([]);

  const [skillsList, setSkillsList] = useState<
    { name: string; category: 'LANGUAGE' | 'FRAMEWORK' | 'TOOL' | 'SOFT_SKILL'; proficiency: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' }[]
  >([]);

  const [newSkillInput, setNewSkillInput] = useState({
    name: '',
    category: 'LANGUAGE' as const,
    proficiency: 'INTERMEDIATE' as const,
  });

  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [certificationsList, setCertificationsList] = useState<any[]>([]);
  const [experiencesList, setExperiencesList] = useState<any[]>([]);
  const [achievementsList, setAchievementsList] = useState<any[]>([]);
  const [extracurricularsList, setExtracurricularsList] = useState<any[]>([]);

  const [visibilities, setVisibilities] = useState<Record<string, boolean>>({});

  // 1. Fetch Profile Data & Skill Registry
  const fetchProfile = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const res = await fetch('/api/profile');
      const data = await res.json();

      if (res.status === 401) {
        router.push('/login');
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to load profile');
      }

      const p: StudentProfile = data.profile;
      setProfile(p);

      // Populate Form Draft States ONLY on initial load to preserve unsaved changes during typing & tab switching
      if (isInitial) {
        setPersonalForm({
          full_name: p.full_name || '',
          department: p.department || 'Computer Science',
          year_or_batch: p.year_or_batch || '2024-2028',
          phone: p.phone || '',
          personal_email: p.personal_email || '',
          linkedin_url: p.linkedin_url || '',
          github_url: p.github_url || '',
          personal_website_url: p.personal_website_url || '',
          address: p.address || '',
          bio: p.bio || '',
          cgpa_overall: p.cgpa_overall !== null && p.cgpa_overall !== undefined ? String(p.cgpa_overall) : '',
        });

        if (p.education) {
          setEducationForm({
            tenth_percentage: String(p.education.tenth_percentage),
            tenth_board: p.education.tenth_board,
            twelfth_percentage_or_diploma_details: p.education.twelfth_percentage_or_diploma_details,
            twelfth_board: p.education.twelfth_board,
            current_degree: p.education.current_degree,
            specialization: p.education.specialization,
            expected_graduation_year: String(p.education.expected_graduation_year),
          });
        }

        setSemesterCgpas(p.semester_cgpas || []);

        if (p.student_skills) {
          setSkillsList(
            p.student_skills.map((sk) => ({
              name: sk.skill?.name || '',
              category: sk.skill?.category || 'LANGUAGE',
              proficiency: sk.proficiency,
            }))
          );
        }

        setProjectsList(p.projects || []);
        setCertificationsList(p.certifications || []);
        setExperiencesList(p.experiences || []);
        setAchievementsList(p.achievements || []);
        setExtracurricularsList(p.extracurriculars || []);
      }

      // Parse Visibilities Map
      const visMap: Record<string, boolean> = {};
      (p.visibilities || []).forEach((v) => {
        visMap[v.section_name] = v.is_public;
      });
      setVisibilities(visMap);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  const fetchSkillsRegistry = async () => {
    try {
      const res = await fetch('/api/skills');
      const data = await res.json();
      if (data.success) {
        setAvailableSkills(data.skills);
      }
    } catch (err) {
      // Non-blocking
    }
  };

  useEffect(() => {
    fetchProfile(true);
    fetchSkillsRegistry();
  }, []);

  // Live Field-Level Completeness Score Calculation
  const currentDraftProfile: Partial<StudentProfile> = {
    ...(profile || {}),
    full_name: personalForm.full_name,
    department: personalForm.department,
    year_or_batch: personalForm.year_or_batch,
    phone: personalForm.phone,
    personal_email: personalForm.personal_email,
    linkedin_url: personalForm.linkedin_url,
    github_url: personalForm.github_url,
    personal_website_url: personalForm.personal_website_url,
    address: personalForm.address,
    bio: personalForm.bio,
    cgpa_overall: personalForm.cgpa_overall !== '' ? parseFloat(personalForm.cgpa_overall) : null,
    education: {
      id: profile?.education?.id || 'temp',
      student_id: profile?.id || 'temp',
      tenth_percentage: parseFloat(educationForm.tenth_percentage) || 0,
      tenth_board: educationForm.tenth_board,
      twelfth_percentage_or_diploma_details: educationForm.twelfth_percentage_or_diploma_details,
      twelfth_board: educationForm.twelfth_board,
      current_degree: educationForm.current_degree,
      specialization: educationForm.specialization,
      expected_graduation_year: parseInt(educationForm.expected_graduation_year) || 2028,
    },
    semester_cgpas: semesterCgpas as any,
    student_skills: skillsList.map((s) => ({
      id: s.name,
      student_id: 'temp',
      skill_id: s.name,
      skill: { id: s.name, name: s.name, category: s.category },
      proficiency: s.proficiency,
    })),
    projects: projectsList,
    certifications: certificationsList,
    experiences: experiencesList,
    achievements: achievementsList,
    extracurriculars: extracurricularsList,
  };

  const completeness = calculateCompleteness(currentDraftProfile);

  // Section Save Handler
  const handleSaveSection = async (sectionName: string, payload: any) => {
    setSavingSection(sectionName);
    setErrorMessage(null);
    setSuccessMessage(null);

    let cleanPayload = payload;
    if (sectionName === 'projects' && Array.isArray(payload)) {
      cleanPayload = payload.map((p) => ({
        ...p,
        title: p.title || 'Untitled Project',
        role: p.role || 'Contributor',
        description: p.description || 'Project description',
        tech_stack: Array.isArray(p.tech_stack)
          ? p.tech_stack.map((t: any) => String(t).trim()).filter(Boolean)
          : String(p.tech_stack || '').split(',').map((t) => t.trim()).filter(Boolean),
        github_url: p.github_url?.trim() || null,
        live_url: p.live_url?.trim() || null,
        team_size: p.team_size ? Number(p.team_size) : null,
      }));
    }

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: sectionName, data: cleanPayload }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const detailMsg = data.details ? ' — ' + JSON.stringify(data.details) : '';
        throw new Error((data.error || `Failed to save ${sectionName}`) + detailMsg);
      }

      setSuccessMessage(`${sectionName.toUpperCase()} saved successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);

      // Update profile state and re-populate all form states from server response
      // This guarantees the UI always reflects what's stored on the server
      if (data.profile) {
        const p = data.profile;
        setProfile(p);

        // Always re-sync ALL form states from the saved server profile
        setPersonalForm({
          full_name: p.full_name || '',
          department: p.department || 'Computer Science',
          year_or_batch: p.year_or_batch || '2024-2028',
          phone: p.phone || '',
          personal_email: p.personal_email || '',
          linkedin_url: p.linkedin_url || '',
          github_url: p.github_url || '',
          personal_website_url: p.personal_website_url || '',
          address: p.address || '',
          bio: p.bio || '',
          cgpa_overall: p.cgpa_overall !== null && p.cgpa_overall !== undefined ? String(p.cgpa_overall) : '',
        });

        if (p.education) {
          setEducationForm({
            tenth_percentage: String(p.education.tenth_percentage ?? ''),
            tenth_board: p.education.tenth_board ?? '',
            twelfth_percentage_or_diploma_details: p.education.twelfth_percentage_or_diploma_details ?? '',
            twelfth_board: p.education.twelfth_board ?? '',
            current_degree: p.education.current_degree ?? '',
            specialization: p.education.specialization ?? '',
            expected_graduation_year: String(p.education.expected_graduation_year ?? '2028'),
          });
        }

        if (p.semester_cgpas) setSemesterCgpas(p.semester_cgpas);

        if (p.student_skills) {
          setSkillsList(
            p.student_skills.map((sk: any) => ({
              name: sk.skill?.name || '',
              category: sk.skill?.category || 'LANGUAGE',
              proficiency: sk.proficiency,
            }))
          );
        }

        if (p.projects) setProjectsList(p.projects);
        if (p.certifications) setCertificationsList(p.certifications);
        if (p.experiences) setExperiencesList(p.experiences);
        if (p.achievements) setAchievementsList(p.achievements);
        if (p.extracurriculars) setExtracurricularsList(p.extracurriculars);

        const visMap: Record<string, boolean> = {};
        (p.visibilities || []).forEach((v: any) => { visMap[v.section_name] = v.is_public; });
        setVisibilities(visMap);
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setSavingSection(null);
    }
  };

  // Visibility Toggle Handler
  const handleToggleVisibility = async (section_name: string) => {
    const current = !!visibilities[section_name];
    const nextVal = !current;
    setVisibilities((prev) => ({ ...prev, [section_name]: nextVal }));

    try {
      const res = await fetch('/api/profile/visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section_name, is_public: nextVal }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error);
      }
    } catch (err: any) {
      // Revert on error
      setVisibilities((prev) => ({ ...prev, [section_name]: current }));
      setErrorMessage(`Failed to update visibility for ${section_name}: ${err.message}`);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
        <p className="text-sm text-slate-300 font-medium">Loading your profile & skill graph...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Header & Live Profile Completeness Score Dashboard */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                {personalForm.full_name || 'Student Profile'}
              </h1>
              <span className="px-2.5 py-1 rounded-md bg-indigo-950 border border-indigo-700/60 text-indigo-300 font-mono text-xs uppercase font-bold">
                {profile?.register_number}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
              <span>{personalForm.department}</span> • <span>{personalForm.year_or_batch}</span> •{' '}
              <span className="text-slate-300 font-mono">{profile?.user?.college_email}</span>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition flex items-center space-x-1.5"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Live Field-Level Completeness Meter */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                Profile Completeness Score
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">
                {completeness.filledFields} / {completeness.totalFields} Fields Complete
              </span>
              <span className="text-lg font-extrabold text-indigo-400 font-mono">
                {completeness.score}%
              </span>
            </div>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500"
              style={{ width: `${completeness.score}%` }}
            />
          </div>

          {/* Actionable Field-Level Gap List */}
          {completeness.gaps.length > 0 && (
            <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-amber-400 uppercase tracking-wider">
                <span>Actionable Profile Gaps ({completeness.gaps.length})</span>
                <span>Rule-Based Feedback</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                {completeness.gaps.slice(0, 6).map((gap, idx) => (
                  <div key={idx} className="flex items-center space-x-2 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                    <span className="truncate">{gap}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Status Notifications */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-sm flex items-start space-x-3 shadow-lg">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">{errorMessage}</div>
        </div>
      )}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-sm flex items-center space-x-3 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div className="flex-1">{successMessage}</div>
        </div>
      )}

      {/* 2. Multi-Section Tab Stepper Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          {[
            { id: 'personal', label: '1. Personal & Contact', icon: User },
            { id: 'education', label: '2. Education & CGPA', icon: GraduationCap },
            { id: 'skills', label: '3. Skills & Proficiency', icon: Wrench },
            { id: 'projects', label: '4. Technical Projects', icon: FolderGit2 },
            { id: 'certifications', label: '5. Certifications', icon: Award },
            { id: 'experiences', label: '6. Work Experience', icon: Briefcase },
            { id: 'achievements', label: '7. Achievements', icon: Trophy },
            { id: 'extracurriculars', label: '8. Extracurriculars', icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'glass-card text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </div>
                <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-600'}`} />
              </button>
            );
          })}
        </div>

        {/* Form Content Area */}
        <div className="lg:col-span-3">
          {/* TAB 1: PERSONAL & CONTACT */}
          {activeTab === 'personal' && (
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-lg font-bold text-white">Personal & Contact Details</h2>
                </div>
                {/* Per-Section Visibility Toggle */}
                <button
                  type="button"
                  onClick={() => handleToggleVisibility('personal')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center space-x-1.5 transition ${
                    visibilities['personal']
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                      : 'bg-slate-900 text-slate-400 border-slate-700'
                  }`}
                >
                  {visibilities['personal'] ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{visibilities['personal'] ? 'Public View Enabled' : 'Private Section'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={personalForm.full_name}
                    onChange={(e) => setPersonalForm({ ...personalForm, full_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                    Register Number <span className="text-slate-500">(Read-Only)</span>
                  </label>
                  <input
                    type="text"
                    disabled
                    value={profile?.register_number || ''}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 text-sm font-mono cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                    Department <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={personalForm.department}
                    onChange={(e) => setPersonalForm({ ...personalForm, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Computer Science">Computer Science & Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Data Science & AI">Data Science & AI</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                    Year / Batch <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={personalForm.year_or_batch}
                    onChange={(e) => setPersonalForm({ ...personalForm, year_or_batch: e.target.value })}
                    placeholder="e.g. 2024-2028"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={personalForm.phone}
                    onChange={(e) => setPersonalForm({ ...personalForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Personal Email</label>
                  <input
                    type="email"
                    value={personalForm.personal_email}
                    onChange={(e) => setPersonalForm({ ...personalForm, personal_email: e.target.value })}
                    placeholder="alex.rivera@gmail.com"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    value={personalForm.linkedin_url}
                    onChange={(e) => setPersonalForm({ ...personalForm, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/alexrivera"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">GitHub URL</label>
                  <input
                    type="url"
                    value={personalForm.github_url}
                    onChange={(e) => setPersonalForm({ ...personalForm, github_url: e.target.value })}
                    placeholder="https://github.com/alexrivera"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Portfolio / Website URL</label>
                  <input
                    type="url"
                    value={personalForm.personal_website_url}
                    onChange={(e) => setPersonalForm({ ...personalForm, personal_website_url: e.target.value })}
                    placeholder="https://alexrivera.dev"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Overall CGPA (0.0 - 10.0)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={personalForm.cgpa_overall}
                    onChange={(e) => setPersonalForm({ ...personalForm, cgpa_overall: e.target.value })}
                    placeholder="e.g. 8.75"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Contact Address</label>
                <textarea
                  rows={2}
                  value={personalForm.address}
                  onChange={(e) => setPersonalForm({ ...personalForm, address: e.target.value })}
                  placeholder="Street address, city, state, postal code"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Short Professional Bio</label>
                <textarea
                  rows={3}
                  value={personalForm.bio}
                  onChange={(e) => setPersonalForm({ ...personalForm, bio: e.target.value })}
                  placeholder="Summarize your technical passion, engineering skills, and career objective..."
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  disabled={savingSection === 'personal'}
                  onClick={() =>
                    handleSaveSection('personal', {
                      ...personalForm,
                      cgpa_overall: personalForm.cgpa_overall !== '' ? parseFloat(personalForm.cgpa_overall) : null,
                    })
                  }
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm shadow-md transition flex items-center space-x-2 disabled:opacity-50"
                >
                  {savingSection === 'personal' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Personal Details</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: EDUCATION & SEMESTER CGPA */}
          {activeTab === 'education' && (
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-lg font-bold text-white">Education & Academic Record</h2>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleVisibility('education')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center space-x-1.5 transition ${
                    visibilities['education']
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                      : 'bg-slate-900 text-slate-400 border-slate-700'
                  }`}
                >
                  {visibilities['education'] ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{visibilities['education'] ? 'Public View Enabled' : 'Private Section'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">10th Percentage</label>
                  <input
                    type="number"
                    step="0.01"
                    value={educationForm.tenth_percentage}
                    onChange={(e) => setEducationForm({ ...educationForm, tenth_percentage: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">10th Board</label>
                  <input
                    type="text"
                    value={educationForm.tenth_board}
                    onChange={(e) => setEducationForm({ ...educationForm, tenth_board: e.target.value })}
                    placeholder="CBSE / ICSE / State Board"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">12th % / Diploma Details</label>
                  <input
                    type="text"
                    value={educationForm.twelfth_percentage_or_diploma_details}
                    onChange={(e) => setEducationForm({ ...educationForm, twelfth_percentage_or_diploma_details: e.target.value })}
                    placeholder="e.g. 92% or Diploma in Computer Engg"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">12th Board / Institution</label>
                  <input
                    type="text"
                    value={educationForm.twelfth_board}
                    onChange={(e) => setEducationForm({ ...educationForm, twelfth_board: e.target.value })}
                    placeholder="CBSE / State Board / Technical Board"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Current Degree</label>
                  <input
                    type="text"
                    value={educationForm.current_degree}
                    onChange={(e) => setEducationForm({ ...educationForm, current_degree: e.target.value })}
                    placeholder="B.Tech / B.E. / B.Sc"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Specialization</label>
                  <input
                    type="text"
                    value={educationForm.specialization}
                    onChange={(e) => setEducationForm({ ...educationForm, specialization: e.target.value })}
                    placeholder="Computer Science & Engineering"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Expected Graduation Year</label>
                  <input
                    type="number"
                    value={educationForm.expected_graduation_year}
                    onChange={(e) => setEducationForm({ ...educationForm, expected_graduation_year: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Semester CGPA Manager */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase text-slate-300">Semester-Wise CGPA Breakdown</h3>
                  <button
                    type="button"
                    onClick={() =>
                      setSemesterCgpas([
                        ...semesterCgpas,
                        { semester_number: semesterCgpas.length + 1, cgpa: 8.0 },
                      ])
                    }
                    className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Semester</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {semesterCgpas.map((sem, idx) => (
                    <div key={idx} className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="block text-[11px] text-slate-400 font-mono">Sem {sem.semester_number}</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="10"
                          value={sem.cgpa}
                          onChange={(e) => {
                            const updated = [...semesterCgpas];
                            updated[idx].cgpa = parseFloat(e.target.value) || 0;
                            setSemesterCgpas(updated);
                          }}
                          className="w-20 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-sm text-white font-mono"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setSemesterCgpas(semesterCgpas.filter((_, i) => i !== idx))}
                        className="text-slate-500 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  disabled={savingSection === 'education'}
                  onClick={() =>
                    handleSaveSection('education', {
                      education: {
                        tenth_percentage: parseFloat(educationForm.tenth_percentage) || 0,
                        tenth_board: educationForm.tenth_board,
                        twelfth_percentage_or_diploma_details: educationForm.twelfth_percentage_or_diploma_details,
                        twelfth_board: educationForm.twelfth_board,
                        current_degree: educationForm.current_degree,
                        specialization: educationForm.specialization,
                        expected_graduation_year: parseInt(educationForm.expected_graduation_year) || 2028,
                      },
                      semester_cgpas: semesterCgpas,
                    })
                  }
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm shadow-md transition flex items-center space-x-2 disabled:opacity-50"
                >
                  {savingSection === 'education' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Education Details</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SKILLS & PROFICIENCY */}
          {activeTab === 'skills' && (
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Wrench className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-lg font-bold text-white">Skills & Self-Rated Proficiency</h2>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleVisibility('skills')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center space-x-1.5 transition ${
                    visibilities['skills']
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                      : 'bg-slate-900 text-slate-400 border-slate-700'
                  }`}
                >
                  {visibilities['skills'] ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{visibilities['skills'] ? 'Public View Enabled' : 'Private Section'}</span>
                </button>
              </div>

              {/* Add Skill Input Form */}
              <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-semibold uppercase text-slate-300">Add New Technical or Soft Skill</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <input
                      type="text"
                      list="skill-autocomplete"
                      value={newSkillInput.name}
                      onChange={(e) => setNewSkillInput({ ...newSkillInput, name: e.target.value })}
                      placeholder="Skill name (e.g. React.js, Python)"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <datalist id="skill-autocomplete">
                      {availableSkills.map((sk) => (
                        <option key={sk.id} value={sk.name} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <select
                      value={newSkillInput.category}
                      onChange={(e) =>
                        setNewSkillInput({ ...newSkillInput, category: e.target.value as any })
                      }
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="LANGUAGE">Language</option>
                      <option value="FRAMEWORK">Framework</option>
                      <option value="TOOL">Tool / DB</option>
                      <option value="SOFT_SKILL">Soft Skill</option>
                    </select>
                  </div>

                  <div>
                    <select
                      value={newSkillInput.proficiency}
                      onChange={(e) =>
                        setNewSkillInput({ ...newSkillInput, proficiency: e.target.value as any })
                      }
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (!newSkillInput.name.trim()) return;
                      setSkillsList([...skillsList, { ...newSkillInput }]);
                      setNewSkillInput({ name: '', category: 'LANGUAGE', proficiency: 'INTERMEDIATE' });
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition flex items-center space-x-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Skill to Profile</span>
                  </button>
                </div>
              </div>

              {/* Skills Tags List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {skillsList.map((sk, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-white text-sm">{sk.name}</div>
                      <div className="flex items-center space-x-2 text-[11px] mt-0.5">
                        <span className="px-1.5 py-0.5 rounded bg-slate-950 text-indigo-400 font-mono">
                          {sk.category}
                        </span>
                        <span className="text-slate-400 font-medium">{sk.proficiency}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSkillsList(skillsList.filter((_, i) => i !== idx))}
                      className="text-slate-500 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  disabled={savingSection === 'skills'}
                  onClick={() => handleSaveSection('skills', skillsList)}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm shadow-md transition flex items-center space-x-2 disabled:opacity-50"
                >
                  {savingSection === 'skills' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Skills Collection</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: TECHNICAL PROJECTS */}
          {activeTab === 'projects' && (
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <FolderGit2 className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-lg font-bold text-white">Technical Projects ({projectsList.length})</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() =>
                      setProjectsList([
                        ...projectsList,
                        {
                          title: 'New Technical Project',
                          description: 'Description of key architecture and functionality.',
                          role: 'Lead Full-Stack Developer',
                          tech_stack: ['Next.js', 'PostgreSQL'],
                          github_url: 'https://github.com',
                          live_url: 'https://demo.com',
                          duration: '3 Months',
                          team_size: 2,
                          key_outcomes: 'Achieved 99.9% uptime and handled 10k requests.',
                        },
                      ])
                    }
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Project</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleVisibility('projects')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center space-x-1.5 transition ${
                      visibilities['projects']
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                        : 'bg-slate-900 text-slate-400 border-slate-700'
                    }`}
                  >
                    {visibilities['projects'] ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{visibilities['projects'] ? 'Public View' : 'Private'}</span>
                  </button>
                </div>
              </div>

              {/* Projects List */}
              <div className="space-y-6">
                {projectsList.map((proj, idx) => (
                  <div key={idx} className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono">
                        Project #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => setProjectsList(projectsList.filter((_, i) => i !== idx))}
                        className="text-slate-500 hover:text-rose-400 text-xs flex items-center space-x-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Project</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Project Title</label>
                        <input
                          type="text"
                          value={proj.title}
                          onChange={(e) => {
                            const updated = [...projectsList];
                            updated[idx].title = e.target.value;
                            setProjectsList(updated);
                          }}
                          className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Your Specific Role</label>
                        <input
                          type="text"
                          value={proj.role}
                          onChange={(e) => {
                            const updated = [...projectsList];
                            updated[idx].role = e.target.value;
                            setProjectsList(updated);
                          }}
                          placeholder="e.g. Frontend Architect / Backend Engineer"
                          className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">GitHub Link</label>
                        <input
                          type="url"
                          value={proj.github_url || ''}
                          onChange={(e) => {
                            const updated = [...projectsList];
                            updated[idx].github_url = e.target.value;
                            setProjectsList(updated);
                          }}
                          placeholder="https://github.com/org/repo"
                          className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Live Demo URL</label>
                        <input
                          type="url"
                          value={proj.live_url || ''}
                          onChange={(e) => {
                            const updated = [...projectsList];
                            updated[idx].live_url = e.target.value;
                            setProjectsList(updated);
                          }}
                          placeholder="https://my-app.vercel.app"
                          className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Duration</label>
                        <input
                          type="text"
                          value={proj.duration || ''}
                          onChange={(e) => {
                            const updated = [...projectsList];
                            updated[idx].duration = e.target.value;
                            setProjectsList(updated);
                          }}
                          placeholder="e.g. 2 Months"
                          className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Technologies Used (Comma-Separated)</label>
                        <input
                          type="text"
                          value={Array.isArray(proj.tech_stack) ? proj.tech_stack.join(', ') : proj.tech_stack}
                          onChange={(e) => {
                            const updated = [...projectsList];
                            updated[idx].tech_stack = e.target.value.split(',').map((t: string) => t.trim());
                            setProjectsList(updated);
                          }}
                          placeholder="React, Node.js, PostgreSQL"
                          className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Project Description</label>
                      <textarea
                        rows={2}
                        value={proj.description}
                        onChange={(e) => {
                          const updated = [...projectsList];
                          updated[idx].description = e.target.value;
                          setProjectsList(updated);
                        }}
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Key Outcomes & Metrics</label>
                      <textarea
                        rows={2}
                        value={proj.key_outcomes || ''}
                        onChange={(e) => {
                          const updated = [...projectsList];
                          updated[idx].key_outcomes = e.target.value;
                          setProjectsList(updated);
                        }}
                        placeholder="e.g. Reduced database latency by 40% and served 5,000 active monthly users."
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  disabled={savingSection === 'projects'}
                  onClick={() => handleSaveSection('projects', projectsList)}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm shadow-md transition flex items-center space-x-2 disabled:opacity-50"
                >
                  {savingSection === 'projects' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Technical Projects</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: CERTIFICATIONS */}
          {activeTab === 'certifications' && (
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-lg font-bold text-white">Certifications ({certificationsList.length})</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCertificationsList([
                        ...certificationsList,
                        {
                          name: 'AWS Certified Solutions Architect',
                          issuer: 'Amazon Web Services',
                          date: '2024-05',
                          credential_id: 'AWS-123456',
                          credential_url: 'https://aws.amazon.com/verify',
                        },
                      ])
                    }
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Certification</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleVisibility('certifications')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center space-x-1.5 transition ${
                      visibilities['certifications']
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                        : 'bg-slate-900 text-slate-400 border-slate-700'
                    }`}
                  >
                    {visibilities['certifications'] ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{visibilities['certifications'] ? 'Public View' : 'Private'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {certificationsList.map((cert, idx) => (
                  <div key={idx} className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-400 font-mono">Certification #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => setCertificationsList(certificationsList.filter((_, i) => i !== idx))}
                        className="text-slate-500 hover:text-rose-400 text-xs"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Certification Name</label>
                        <input
                          type="text"
                          value={cert.name}
                          onChange={(e) => {
                            const updated = [...certificationsList];
                            updated[idx].name = e.target.value;
                            setCertificationsList(updated);
                          }}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Issuer Organization</label>
                        <input
                          type="text"
                          value={cert.issuer}
                          onChange={(e) => {
                            const updated = [...certificationsList];
                            updated[idx].issuer = e.target.value;
                            setCertificationsList(updated);
                          }}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Issue Date</label>
                        <input
                          type="text"
                          value={cert.date}
                          onChange={(e) => {
                            const updated = [...certificationsList];
                            updated[idx].date = e.target.value;
                            setCertificationsList(updated);
                          }}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Credential URL</label>
                        <input
                          type="url"
                          value={cert.credential_url || ''}
                          onChange={(e) => {
                            const updated = [...certificationsList];
                            updated[idx].credential_url = e.target.value;
                            setCertificationsList(updated);
                          }}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  disabled={savingSection === 'certifications'}
                  onClick={() => handleSaveSection('certifications', certificationsList)}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm shadow-md transition flex items-center space-x-2 disabled:opacity-50"
                >
                  {savingSection === 'certifications' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Certifications</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: WORK EXPERIENCE */}
          {activeTab === 'experiences' && (
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-lg font-bold text-white">Work & Internship Experience ({experiencesList.length})</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() =>
                      setExperiencesList([
                        ...experiencesList,
                        {
                          org: 'Tech Corp',
                          role: 'Software Engineering Intern',
                          duration: 'Jun 2024 - Aug 2024',
                          location: 'Remote',
                          description: 'Developed REST microservices and optimized API throughput.',
                          key_contributions: 'Improved response times by 35%.',
                        },
                      ])
                    }
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Experience</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleVisibility('experience')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center space-x-1.5 transition ${
                      visibilities['experience']
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                        : 'bg-slate-900 text-slate-400 border-slate-700'
                    }`}
                  >
                    {visibilities['experience'] ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{visibilities['experience'] ? 'Public View' : 'Private'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {experiencesList.map((exp, idx) => (
                  <div key={idx} className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-400 font-mono">Experience #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => setExperiencesList(experiencesList.filter((_, i) => i !== idx))}
                        className="text-slate-500 hover:text-rose-400 text-xs"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Organization</label>
                        <input
                          type="text"
                          value={exp.org}
                          onChange={(e) => {
                            const updated = [...experiencesList];
                            updated[idx].org = e.target.value;
                            setExperiencesList(updated);
                          }}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Role Title</label>
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => {
                            const updated = [...experiencesList];
                            updated[idx].role = e.target.value;
                            setExperiencesList(updated);
                          }}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Duration</label>
                        <input
                          type="text"
                          value={exp.duration}
                          onChange={(e) => {
                            const updated = [...experiencesList];
                            updated[idx].duration = e.target.value;
                            setExperiencesList(updated);
                          }}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Location</label>
                        <input
                          type="text"
                          value={exp.location || ''}
                          onChange={(e) => {
                            const updated = [...experiencesList];
                            updated[idx].location = e.target.value;
                            setExperiencesList(updated);
                          }}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Role Description</label>
                      <textarea
                        rows={2}
                        value={exp.description}
                        onChange={(e) => {
                          const updated = [...experiencesList];
                          updated[idx].description = e.target.value;
                          setExperiencesList(updated);
                        }}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  disabled={savingSection === 'experiences'}
                  onClick={() => handleSaveSection('experiences', experiencesList)}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm shadow-md transition flex items-center space-x-2 disabled:opacity-50"
                >
                  {savingSection === 'experiences' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Experience Entries</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 7: ACHIEVEMENTS */}
          {activeTab === 'achievements' && (
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-lg font-bold text-white">Achievements & Awards ({achievementsList.length})</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() =>
                      setAchievementsList([
                        ...achievementsList,
                        {
                          title: '1st Place Hackathon Winner',
                          description: 'Built an AI-assisted smart grid application.',
                          date: '2024-03',
                          issuing_body: 'National Tech Summit',
                        },
                      ])
                    }
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Achievement</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleVisibility('achievements')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center space-x-1.5 transition ${
                      visibilities['achievements']
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                        : 'bg-slate-900 text-slate-400 border-slate-700'
                    }`}
                  >
                    {visibilities['achievements'] ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{visibilities['achievements'] ? 'Public View' : 'Private'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {achievementsList.map((ach, idx) => (
                  <div key={idx} className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-400 font-mono">Achievement #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => setAchievementsList(achievementsList.filter((_, i) => i !== idx))}
                        className="text-slate-500 hover:text-rose-400 text-xs"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
                        <input
                          type="text"
                          value={ach.title}
                          onChange={(e) => {
                            const updated = [...achievementsList];
                            updated[idx].title = e.target.value;
                            setAchievementsList(updated);
                          }}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Issuing Body / Organization</label>
                        <input
                          type="text"
                          value={ach.issuing_body || ''}
                          onChange={(e) => {
                            const updated = [...achievementsList];
                            updated[idx].issuing_body = e.target.value;
                            setAchievementsList(updated);
                          }}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={ach.description}
                        onChange={(e) => {
                          const updated = [...achievementsList];
                          updated[idx].description = e.target.value;
                          setAchievementsList(updated);
                        }}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  disabled={savingSection === 'achievements'}
                  onClick={() => handleSaveSection('achievements', achievementsList)}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm shadow-md transition flex items-center space-x-2 disabled:opacity-50"
                >
                  {savingSection === 'achievements' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Achievements</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 8: EXTRACURRICULARS */}
          {activeTab === 'extracurriculars' && (
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-lg font-bold text-white">Extracurricular Activities ({extracurricularsList.length})</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() =>
                      setExtracurricularsList([
                        ...extracurricularsList,
                        {
                          activity: 'Coding Club Lead',
                          role: 'President',
                          organization: 'University Tech Society',
                          duration: '2023 - 2024',
                          description: 'Organized competitive programming workshops for 200+ students.',
                        },
                      ])
                    }
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Activity</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleVisibility('extracurricular')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center space-x-1.5 transition ${
                      visibilities['extracurricular']
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                        : 'bg-slate-900 text-slate-400 border-slate-700'
                    }`}
                  >
                    {visibilities['extracurricular'] ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{visibilities['extracurricular'] ? 'Public View' : 'Private'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {extracurricularsList.map((extra, idx) => (
                  <div key={idx} className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-400 font-mono">Activity #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => setExtracurricularsList(extracurricularsList.filter((_, i) => i !== idx))}
                        className="text-slate-500 hover:text-rose-400 text-xs"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Activity Name</label>
                        <input
                          type="text"
                          value={extra.activity}
                          onChange={(e) => {
                            const updated = [...extracurricularsList];
                            updated[idx].activity = e.target.value;
                            setExtracurricularsList(updated);
                          }}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Role Title</label>
                        <input
                          type="text"
                          value={extra.role}
                          onChange={(e) => {
                            const updated = [...extracurricularsList];
                            updated[idx].role = e.target.value;
                            setExtracurricularsList(updated);
                          }}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Activity Description</label>
                      <textarea
                        rows={2}
                        value={extra.description || ''}
                        onChange={(e) => {
                          const updated = [...extracurricularsList];
                          updated[idx].description = e.target.value;
                          setExtracurricularsList(updated);
                        }}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  disabled={savingSection === 'extracurriculars'}
                  onClick={() => handleSaveSection('extracurriculars', extracurricularsList)}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm shadow-md transition flex items-center space-x-2 disabled:opacity-50"
                >
                  {savingSection === 'extracurriculars' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Extracurriculars</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
