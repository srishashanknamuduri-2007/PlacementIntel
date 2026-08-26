'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { StudentProfile } from '@/lib/types';
import { AggregateStats } from '@/lib/admin';
import { LogoutButton } from '@/components/LogoutButton';
import {
  Users,
  Search,
  Download,
  Filter,
  GraduationCap,
  Briefcase,
  FolderGit2,
  Award,
  BarChart3,
  ShieldAlert,
  Loader2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Building2,
  Layers,
  ArrowUpDown,
  Mail,
  Copy,
  Check,
  Zap,
  TrendingUp,
  Cpu,
  Target,
  FileSpreadsheet,
  BadgeCheck,
  Send,
} from 'lucide-react';

type AdminTab = 'candidates' | 'drive-simulator' | 'analytics' | 'broadcast';

interface DrivePreset {
  name: string;
  company: string;
  minCgpa: number;
  departments: string[];
  requiredSkills: string[];
  minProjects: number;
}

const DRIVE_PRESETS: DrivePreset[] = [
  {
    name: 'Google SWE Intern / Graduate',
    company: 'Google',
    minCgpa: 8.5,
    departments: ['Computer Science', 'Information Technology'],
    requiredSkills: ['Data Structures', 'Python', 'C++'],
    minProjects: 2,
  },
  {
    name: 'Amazon SDE-1 Campus Drive',
    company: 'Amazon',
    minCgpa: 7.5,
    departments: ['Computer Science', 'Information Technology', 'Electronics & Communication'],
    requiredSkills: ['Java', 'React', 'AWS'],
    minProjects: 1,
  },
  {
    name: 'Microsoft Software Engineer',
    company: 'Microsoft',
    minCgpa: 8.0,
    departments: ['Computer Science', 'Information Technology'],
    requiredSkills: ['TypeScript', 'Cloud', 'System Design'],
    minProjects: 2,
  },
  {
    name: 'TCS Digital Engineering Drive',
    company: 'TCS Digital',
    minCgpa: 7.0,
    departments: ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Electrical Engineering', 'Mechanical Engineering'],
    requiredSkills: ['Python', 'SQL'],
    minProjects: 1,
  },
];

export default function PlacementAdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>('candidates');
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [stats, setStats] = useState<AggregateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbiddenError, setForbiddenError] = useState<string | null>(null);

  // Candidate Filters State
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [skillFilter, setSkillFilter] = useState('');
  const [certFilter, setCertFilter] = useState('');
  const [minCgpa, setMinCgpa] = useState('');
  const [hasProjects, setHasProjects] = useState(false);
  const [hasInternships, setHasInternships] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Table sorting
  const [sortBy, setSortBy] = useState<'cgpa' | 'projects' | 'name' | 'reg'>('cgpa');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Multi-selection for batch operations
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [copiedEmails, setCopiedEmails] = useState(false);
  const [copiedRegs, setCopiedRegs] = useState(false);

  // Candidate Inspector Drawer
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);

  // Drive Simulator State
  const [selectedPreset, setSelectedPreset] = useState<DrivePreset>(DRIVE_PRESETS[0]);
  const [customDrive, setCustomDrive] = useState({
    companyName: DRIVE_PRESETS[0].company,
    roleTitle: DRIVE_PRESETS[0].name,
    minCgpa: DRIVE_PRESETS[0].minCgpa,
    departments: DRIVE_PRESETS[0].departments,
    requiredSkills: DRIVE_PRESETS[0].requiredSkills.join(', '),
    minProjects: DRIVE_PRESETS[0].minProjects,
  });

  // Broadcast Message State
  const [broadcastMessage, setBroadcastMessage] = useState({
    subject: '',
    body: '',
    targetDept: 'ALL',
  });
  const [broadcastSent, setBroadcastSent] = useState(false);

  const fetchCandidates = async () => {
    setLoading(true);
    setForbiddenError(null);

    try {
      const query = new URLSearchParams();
      if (deptFilter !== 'ALL') query.set('dept', deptFilter);
      if (skillFilter) query.set('skill', skillFilter);
      if (certFilter) query.set('cert', certFilter);
      if (minCgpa) query.set('minCgpa', minCgpa);
      if (hasProjects) query.set('hasProjects', 'true');
      if (hasInternships) query.set('hasInternships', 'true');
      if (searchQuery) query.set('q', searchQuery);

      const res = await fetch(`/api/admin/students?${query.toString()}`);
      const data = await res.json();

      if (res.status === 403) {
        setForbiddenError('Access Denied: T&P Admin or College Admin role required to access placement intelligence.');
        return;
      }

      if (res.status === 401) {
        router.push('/login');
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to query student database');
      }

      setStudents(data.students);
      setStats(data.stats);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [deptFilter, hasProjects, hasInternships]);

  // Sorted candidates
  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'cgpa') {
        const cgpaA = a.cgpa_overall || 0;
        const cgpaB = b.cgpa_overall || 0;
        comparison = cgpaA - cgpaB;
      } else if (sortBy === 'projects') {
        const projA = a.projects?.length || 0;
        const projB = b.projects?.length || 0;
        comparison = projA - projB;
      } else if (sortBy === 'name') {
        comparison = a.full_name.localeCompare(b.full_name);
      } else if (sortBy === 'reg') {
        comparison = a.register_number.localeCompare(b.register_number);
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [students, sortBy, sortOrder]);

  // Drive Simulator Filtering Logic
  const eligibleDriveStudents = useMemo(() => {
    const requiredSkillsList = customDrive.requiredSkills
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    return students.filter((s) => {
      // 1. CGPA Cutoff
      const cgpa = s.cgpa_overall || 0;
      if (cgpa < customDrive.minCgpa) return false;

      // 2. Department match
      if (customDrive.departments.length > 0 && !customDrive.departments.includes('ALL')) {
        const matchDept = customDrive.departments.some(
          (d) => d.toLowerCase() === s.department.toLowerCase()
        );
        if (!matchDept) return false;
      }

      // 3. Minimum Projects
      if ((s.projects?.length || 0) < customDrive.minProjects) return false;

      // 4. Skills match (if any)
      if (requiredSkillsList.length > 0) {
        const studentSkillNames = (s.student_skills || []).map((sk: any) =>
          (sk.skill?.name || sk.name || '').toLowerCase()
        );
        const hasAnySkill = requiredSkillsList.some((req) =>
          studentSkillNames.some((skName) => skName.includes(req))
        );
        if (!hasAnySkill) return false;
      }

      return true;
    });
  }, [students, customDrive]);

  const handleExportCsv = () => {
    const query = new URLSearchParams();
    if (deptFilter !== 'ALL') query.set('dept', deptFilter);
    if (skillFilter) query.set('skill', skillFilter);
    if (certFilter) query.set('cert', certFilter);
    if (minCgpa) query.set('minCgpa', minCgpa);
    if (hasProjects) query.set('hasProjects', 'true');
    if (hasInternships) query.set('hasInternships', 'true');
    if (searchQuery) query.set('q', searchQuery);

    window.open(`/api/admin/export-csv?${query.toString()}`, '_blank');
  };

  const handleSelectAll = () => {
    if (selectedStudentIds.size === sortedStudents.length) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(sortedStudents.map((s) => s.id)));
    }
  };

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedStudentIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedStudentIds(next);
  };

  const handleCopySelectedEmails = () => {
    const targets = selectedStudentIds.size > 0
      ? sortedStudents.filter((s) => selectedStudentIds.has(s.id))
      : sortedStudents;
    const emails = targets
      .map((s) => s.user?.college_email || s.personal_email || `${s.register_number.toLowerCase()}@college.edu`)
      .filter(Boolean)
      .join(', ');
    navigator.clipboard.writeText(emails);
    setCopiedEmails(true);
    setTimeout(() => setCopiedEmails(false), 2500);
  };

  const handleCopySelectedRegs = () => {
    const targets = selectedStudentIds.size > 0
      ? sortedStudents.filter((s) => selectedStudentIds.has(s.id))
      : sortedStudents;
    const regs = targets.map((s) => s.register_number).join(', ');
    navigator.clipboard.writeText(regs);
    setCopiedRegs(true);
    setTimeout(() => setCopiedRegs(false), 2500);
  };

  const handleApplyPreset = (preset: DrivePreset) => {
    setSelectedPreset(preset);
    setCustomDrive({
      companyName: preset.company,
      roleTitle: preset.name,
      minCgpa: preset.minCgpa,
      departments: preset.departments,
      requiredSkills: preset.requiredSkills.join(', '),
      minProjects: preset.minProjects,
    });
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastSent(false);
      setBroadcastMessage({ subject: '', body: '', targetDept: 'ALL' });
    }, 3000);
  };

  if (forbiddenError) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-rose-800 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-400 mx-auto flex items-center justify-center">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">403 Forbidden Access</h2>
          <p className="text-sm text-rose-300 leading-relaxed">{forbiddenError}</p>
          <div className="pt-2">
            <button
              onClick={() => router.push('/login')}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Officer Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>Training & Placement (T&P) Officer Command Center</span>
          </div>
          <h1 className="text-3xl font-black text-white mt-1 tracking-tight">
            Placement Intelligence & Candidate Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time candidate discovery, drive eligibility simulator, and recruiter shortlist exporter.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={handleExportCsv}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Roster (CSV)</span>
          </button>
          <LogoutButton variant="full" />
        </div>
      </div>

      {/* Aggregate Metric Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Total Body</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1 font-mono">{stats.totalStudents}</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Avg CGPA</span>
              <GraduationCap className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-cyan-300 mt-1 font-mono">
              {stats.averageCgpa}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Placement Ready</span>
              <Target className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">
              {stats.placementReadyCount} <span className="text-xs font-normal text-slate-400">({stats.placementReadyPercentage}%)</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>With Projects</span>
              <FolderGit2 className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-blue-400 mt-1 font-mono">
              {stats.studentsWithProjectsCount}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>With Internships</span>
              <Briefcase className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-purple-400 mt-1 font-mono">
              {stats.studentsWithInternshipsCount}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Certifications</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 mt-1 font-mono">
              {stats.studentsWithCertificationsCount}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Workspace Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800 w-fit">
        {[
          { id: 'candidates', label: '🎯 Candidate Discovery', desc: 'Search & Shortlist' },
          { id: 'drive-simulator', label: '🏢 Drive Eligibility Simulator', desc: 'Mock Cutoffs' },
          { id: 'analytics', label: '📊 Skill & Dept Analytics', desc: 'Heatmaps & Charts' },
          { id: 'broadcast', label: '📢 Placement Broadcast', desc: 'Student Outreach' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as AdminTab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: CANDIDATE DISCOVERY & SEARCH */}
      {activeTab === 'candidates' && (
        <div className="space-y-6">
          {/* Compound Filter Panel */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                <Filter className="w-4 h-4 text-indigo-400" />
                <span>Compound Placement Filters</span>
              </div>
              <button
                onClick={fetchCandidates}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
              >
                Apply Filters
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Department</label>
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                >
                  <option value="ALL">All Departments</option>
                  <option value="Computer Science">Computer Science & Engg</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Communication">Electronics & Comm</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Skill Filter</label>
                <input
                  type="text"
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                  placeholder="e.g. Python, React, AWS"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Certification Filter</label>
                <input
                  type="text"
                  value={certFilter}
                  onChange={(e) => setCertFilter(e.target.value)}
                  placeholder="e.g. AWS, Kubernetes"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Min Overall CGPA</label>
                <input
                  type="number"
                  step="0.1"
                  value={minCgpa}
                  onChange={(e) => setMinCgpa(e.target.value)}
                  placeholder="e.g. 8.0"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800/80 text-xs">
              <div className="flex items-center space-x-6 text-slate-300 font-medium">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasProjects}
                    onChange={(e) => setHasProjects(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Has Technical Projects</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasInternships}
                    onChange={(e) => setHasInternships(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Has Work / Internship Experience</span>
                </label>
              </div>

              <div className="flex-1 max-w-xs">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search candidate name or reg no..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Batch Actions & Sorting Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center space-x-3 text-xs">
              <button
                onClick={handleSelectAll}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition font-medium"
              >
                {selectedStudentIds.size === sortedStudents.length && sortedStudents.length > 0
                  ? 'Deselect All'
                  : `Select All (${sortedStudents.length})`}
              </button>

              <button
                onClick={handleCopySelectedEmails}
                className="px-3 py-1.5 rounded-xl bg-indigo-950/80 border border-indigo-700/50 hover:bg-indigo-900 text-indigo-300 transition font-medium flex items-center space-x-1.5"
              >
                {copiedEmails ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Mail className="w-3.5 h-3.5" />}
                <span>{copiedEmails ? 'Copied Emails!' : `Copy Emails (${selectedStudentIds.size || sortedStudents.length})`}</span>
              </button>

              <button
                onClick={handleCopySelectedRegs}
                className="px-3 py-1.5 rounded-xl bg-purple-950/80 border border-purple-700/50 hover:bg-purple-900 text-purple-300 transition font-medium flex items-center space-x-1.5"
              >
                {copiedRegs ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedRegs ? 'Copied Reg Nos!' : 'Copy Reg Numbers'}</span>
              </button>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
              >
                <option value="cgpa">CGPA</option>
                <option value="projects">Projects Count</option>
                <option value="name">Candidate Name</option>
                <option value="reg">Register Number</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                title="Toggle sort direction"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Candidate Results Table */}
          <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
              <span>Candidate Search Results ({sortedStudents.length} Matching Profiles)</span>
              <span>Sorted by {sortBy.toUpperCase()} ({sortOrder.toUpperCase()})</span>
            </div>

            {loading ? (
              <div className="p-12 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Querying student candidate records...</p>
              </div>
            ) : sortedStudents.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                No student candidates match the specified compound filter criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900/80 text-slate-400 uppercase font-mono border-b border-slate-800">
                      <th className="p-4 w-10">
                        <input
                          type="checkbox"
                          checked={selectedStudentIds.size === sortedStudents.length && sortedStudents.length > 0}
                          onChange={handleSelectAll}
                          className="rounded bg-slate-900 border-slate-700 text-indigo-600"
                        />
                      </th>
                      <th className="p-4 font-semibold">Reg Number</th>
                      <th className="p-4 font-semibold">Student Name</th>
                      <th className="p-4 font-semibold">Department</th>
                      <th className="p-4 font-semibold">CGPA</th>
                      <th className="p-4 font-semibold">Top Skills</th>
                      <th className="p-4 font-semibold">Projects</th>
                      <th className="p-4 font-semibold">Readiness Badges</th>
                      <th className="p-4 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {sortedStudents.map((s) => {
                      const isSelected = selectedStudentIds.has(s.id);
                      const isTier1 = (s.cgpa_overall || 0) >= 8.5 && (s.projects?.length || 0) >= 1;
                      const hasExp = (s.experiences?.length || 0) > 0;
                      return (
                        <tr
                          key={s.id}
                          className={`hover:bg-slate-900/50 transition ${isSelected ? 'bg-indigo-950/30' : ''}`}
                        >
                          <td className="p-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelect(s.id)}
                              className="rounded bg-slate-900 border-slate-700 text-indigo-600"
                            />
                          </td>
                          <td className="p-4 font-mono font-bold text-indigo-400">{s.register_number}</td>
                          <td className="p-4 font-semibold text-white">{s.full_name}</td>
                          <td className="p-4 text-slate-300">{s.department}</td>
                          <td className="p-4 font-mono font-bold text-emerald-400">
                            {s.cgpa_overall ? `${Number(s.cgpa_overall).toFixed(2)}` : 'N/A'}
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {(s.student_skills || []).slice(0, 3).map((sk: any, idx: number) => (
                                <span
                                  key={idx}
                                  className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-indigo-300 font-mono text-[10px]"
                                >
                                  {sk.skill?.name || sk.name}
                                </span>
                              ))}
                              {(s.student_skills || []).length > 3 && (
                                <span className="text-slate-500 font-mono">+{s.student_skills!.length - 3}</span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 font-mono text-slate-300">{s.projects?.length || 0}</td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                              {isTier1 && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold">
                                  ⭐ Tier 1
                                </span>
                              )}
                              {hasExp && (
                                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[10px] font-bold">
                                  💼 Intern Exp
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => setSelectedStudent(s)}
                              className="px-3 py-1 bg-indigo-950 border border-indigo-700 text-indigo-300 hover:bg-indigo-900 rounded-xl font-medium transition flex items-center space-x-1"
                            >
                              <span>Inspect</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DRIVE ELIGIBILITY SIMULATOR */}
      {activeTab === 'drive-simulator' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono font-bold text-purple-400 uppercase tracking-widest">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Placement Drive Criteria Simulator</span>
              </div>
              <h2 className="text-2xl font-bold text-white mt-1">Company Eligibility Matcher</h2>
              <p className="text-xs text-slate-400 mt-1">
                Configure corporate placement criteria to instantly calculate the candidate funnel and generate recruiter shortlists.
              </p>
            </div>

            {/* Quick Presets */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                1-Click Corporate Presets:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {DRIVE_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className={`p-3 rounded-2xl border text-left transition ${
                      selectedPreset.name === p.name
                        ? 'bg-purple-950/80 border-purple-500 shadow-lg shadow-purple-950/50'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-white text-xs">{p.company}</div>
                    <div className="text-[11px] text-purple-300 truncate mt-0.5">{p.name}</div>
                    <div className="text-[10px] font-mono text-slate-400 mt-1">
                      Min CGPA: {p.minCgpa} • {p.minProjects}+ Proj
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Drive Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Company / Drive Name</label>
                <input
                  type="text"
                  value={customDrive.roleTitle}
                  onChange={(e) => setCustomDrive({ ...customDrive, roleTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Minimum CGPA Cutoff</label>
                <input
                  type="number"
                  step="0.1"
                  value={customDrive.minCgpa}
                  onChange={(e) => setCustomDrive({ ...customDrive, minCgpa: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Required Core Skills (CSV)</label>
                <input
                  type="text"
                  value={customDrive.requiredSkills}
                  onChange={(e) => setCustomDrive({ ...customDrive, requiredSkills: e.target.value })}
                  placeholder="e.g. Python, React, Java"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Min Required Projects</label>
                <input
                  type="number"
                  value={customDrive.minProjects}
                  onChange={(e) => setCustomDrive({ ...customDrive, minProjects: parseInt(e.target.value, 10) || 0 })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono"
                />
              </div>
            </div>

            {/* Eligibility Funnel Visualizer */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 text-center">
                <div className="text-3xl font-black text-white font-mono">{students.length}</div>
                <div className="text-xs font-mono text-indigo-300 uppercase mt-1">Total Candidate Pool</div>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 text-center">
                <div className="text-3xl font-black text-emerald-400 font-mono">{eligibleDriveStudents.length}</div>
                <div className="text-xs font-mono text-emerald-300 uppercase mt-1">Eligible Candidates</div>
              </div>

              <div className="p-5 rounded-2xl bg-purple-950/40 border border-purple-800/40 text-center">
                <div className="text-3xl font-black text-purple-300 font-mono">
                  {students.length > 0 ? Math.round((eligibleDriveStudents.length / students.length) * 100) : 0}%
                </div>
                <div className="text-xs font-mono text-purple-300 uppercase mt-1">Shortlist Conversion Ratio</div>
              </div>
            </div>

            {/* Matching Roster Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Eligible Students for {customDrive.roleTitle} ({eligibleDriveStudents.length})
                </h3>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-slate-400 uppercase font-mono border-b border-slate-800">
                      <th className="p-3.5">Reg No</th>
                      <th className="p-3.5">Full Name</th>
                      <th className="p-3.5">Department</th>
                      <th className="p-3.5">CGPA</th>
                      <th className="p-3.5">Matched Skills</th>
                      <th className="p-3.5">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {eligibleDriveStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-900/60">
                        <td className="p-3.5 font-mono font-bold text-indigo-400">{s.register_number}</td>
                        <td className="p-3.5 font-semibold text-white">{s.full_name}</td>
                        <td className="p-3.5 text-slate-300">{s.department}</td>
                        <td className="p-3.5 font-mono font-bold text-emerald-400">
                          {s.cgpa_overall ? Number(s.cgpa_overall).toFixed(2) : 'N/A'}
                        </td>
                        <td className="p-3.5">
                          <div className="flex flex-wrap gap-1">
                            {(s.student_skills || []).slice(0, 3).map((sk: any, idx: number) => (
                              <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-indigo-300 font-mono text-[10px]">
                                {sk.skill?.name || sk.name}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <button
                            onClick={() => setSelectedStudent(s)}
                            className="px-2.5 py-1 bg-indigo-950 border border-indigo-700 text-indigo-300 rounded-lg text-[11px]"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REAL-TIME ANALYTICS & SKILL HEATMAPS */}
      {activeTab === 'analytics' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Department Breakdown */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" /> Department Distribution & Avg CGPA
              </h2>
              <div className="space-y-3">
                {stats.departmentBreakdown.map((d, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{d.department}</span>
                      <span className="font-mono text-cyan-300 font-bold">Avg CGPA: {d.avgCgpa}</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full"
                        style={{ width: `${Math.min(100, (d.count / stats.totalStudents) * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                      <span>{d.count} Students</span>
                      <span>{d.withProjects} With Projects</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top In-Demand Technical Skills */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" /> In-Demand Skills Frequency Stack
              </h2>
              <div className="space-y-2.5">
                {stats.topSkills.map((sk, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{sk.name}</span>
                      <span className="text-purple-300 font-mono">{sk.count} Students ({sk.percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full"
                        style={{ width: `${Math.min(100, sk.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CGPA Distribution Histogram */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> CGPA Distribution Brackets
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {stats.cgpaRanges.map((bracket, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-300">{bracket.label}</div>
                  <div className="text-2xl font-black text-emerald-400 font-mono">{bracket.count}</div>
                  <div className="text-[11px] font-mono text-slate-400">{bracket.percentage}% of student body</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BATCH COMMUNICATIONS & BROADCAST */}
      {activeTab === 'broadcast' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 max-w-2xl">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest">
              <Send className="w-4 h-4 text-indigo-400" />
              <span>Placement Officer Broadcast Center</span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-1">Broadcast Placement Alert</h2>
            <p className="text-xs text-slate-400 mt-1">
              Transmit corporate drive notices, resume completion reminders, or interview schedules.
            </p>
          </div>

          {broadcastSent && (
            <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>Broadcast dispatched successfully to registered candidate cohort!</span>
            </div>
          )}

          <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">Target Department</label>
              <select
                value={broadcastMessage.targetDept}
                onChange={(e) => setBroadcastMessage({ ...broadcastMessage, targetDept: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
              >
                <option value="ALL">All Departments (Entire Student Body)</option>
                <option value="Computer Science">Computer Science & Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">Subject Header</label>
              <input
                type="text"
                required
                value={broadcastMessage.subject}
                onChange={(e) => setBroadcastMessage({ ...broadcastMessage, subject: e.target.value })}
                placeholder="e.g. Mandatory: Complete ATS Profile for Amazon Campus Drive by Friday"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">Message Body</label>
              <textarea
                rows={4}
                required
                value={broadcastMessage.body}
                onChange={(e) => setBroadcastMessage({ ...broadcastMessage, body: e.target.value })}
                placeholder="Enter instructions, eligibility criteria, or test schedule..."
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs transition flex items-center space-x-2 shadow-lg shadow-indigo-600/30"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Dispatch Cohort Broadcast</span>
            </button>
          </form>
        </div>
      )}

      {/* Candidate Inspector Drawer Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex justify-end">
          <div className="w-full max-w-2xl bg-slate-950 border-l border-slate-800 p-6 sm:p-8 overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-2xl font-bold text-white">{selectedStudent.full_name}</h3>
                <p className="text-xs text-indigo-400 font-mono mt-0.5">
                  {selectedStudent.register_number} • {selectedStudent.department} • {selectedStudent.year_or_batch}
                </p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>

            <div className="space-y-6 text-xs text-slate-300">
              {/* Contact & Bio Info */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h4 className="font-bold text-amber-400 uppercase text-[11px] border-b border-slate-800 pb-1 flex items-center justify-between">
                  <span>Candidate Contact & Bio</span>
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>College Email: <span className="text-white font-mono">{selectedStudent.user?.college_email || `${selectedStudent.register_number.toLowerCase()}@college.edu`}</span></div>
                  <div>Personal Email: <span className="text-white font-mono">{selectedStudent.personal_email || 'N/A'}</span></div>
                  <div>Phone: <span className="text-white font-mono">{selectedStudent.phone || 'N/A'}</span></div>
                  <div>Address: <span className="text-white">{selectedStudent.address || 'N/A'}</span></div>
                  {selectedStudent.linkedin_url && (
                    <div>LinkedIn: <a href={selectedStudent.linkedin_url} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">Profile Link</a></div>
                  )}
                  {selectedStudent.github_url && (
                    <div>GitHub: <a href={selectedStudent.github_url} target="_blank" rel="noreferrer" className="text-purple-400 hover:underline">GitHub Link</a></div>
                  )}
                  {selectedStudent.personal_website_url && (
                    <div>Portfolio Site: <a href={selectedStudent.personal_website_url} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">Website</a></div>
                  )}
                </div>
                {selectedStudent.bio && (
                  <div className="pt-2 border-t border-slate-800 text-slate-300 italic">
                    "{selectedStudent.bio}"
                  </div>
                )}
              </div>

              {/* Academic Overview */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h4 className="font-bold text-indigo-400 uppercase text-[11px] border-b border-slate-800 pb-1 flex items-center justify-between">
                  <span>Academic Standing & Semester Performance</span>
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>Degree: <span className="text-white">{selectedStudent.education?.current_degree || 'B.Tech'} in {selectedStudent.education?.specialization || selectedStudent.department}</span></div>
                  <div>Graduation Year: <span className="text-white">{selectedStudent.education?.expected_graduation_year || selectedStudent.year_or_batch}</span></div>
                  <div>10th Grade: <span className="text-white">{selectedStudent.education?.tenth_percentage || 'N/A'}% ({selectedStudent.education?.tenth_board || 'N/A'})</span></div>
                  <div>12th / Diploma: <span className="text-white">{selectedStudent.education?.twelfth_percentage_or_diploma_details || 'N/A'} ({selectedStudent.education?.twelfth_board || 'N/A'})</span></div>
                  <div>Overall CGPA: <span className="text-emerald-400 font-bold font-mono text-sm">{selectedStudent.cgpa_overall !== null && selectedStudent.cgpa_overall !== undefined ? selectedStudent.cgpa_overall : 'N/A'}</span></div>
                </div>

                {/* Semester CGPAs */}
                {selectedStudent.semester_cgpas && selectedStudent.semester_cgpas.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-400">Semester-wise CGPA Breakdown:</span>
                    <div className="grid grid-cols-4 gap-2">
                      {selectedStudent.semester_cgpas.map((sc: any, idx: number) => (
                        <div key={idx} className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
                          <span className="text-[10px] text-slate-400 block font-mono">Sem {sc.semester_number}</span>
                          <span className="text-xs font-bold text-white font-mono">{sc.cgpa}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <h4 className="font-bold text-white uppercase text-[11px] border-b border-slate-800 pb-1">
                  Verified Skills Stack ({selectedStudent.student_skills?.length || 0})
                </h4>
                {selectedStudent.student_skills && selectedStudent.student_skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedStudent.student_skills.map((sk: any, idx: number) => (
                      <span key={idx} className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-indigo-300 font-mono text-[11px]">
                        {sk.skill?.name || sk.name} <span className="text-slate-500 font-sans text-[10px]">({sk.proficiency || 'SKILLED'})</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">No skills listed yet.</p>
                )}
              </div>

              {/* Technical Projects */}
              <div className="space-y-2">
                <h4 className="font-bold text-white uppercase text-[11px] border-b border-slate-800 pb-1">
                  Technical Projects ({selectedStudent.projects?.length || 0})
                </h4>
                {selectedStudent.projects && selectedStudent.projects.length > 0 ? (
                  selectedStudent.projects.map((p: any, idx: number) => {
                    const techArr = Array.isArray(p.tech_stack)
                      ? p.tech_stack
                      : String(p.tech_stack || '').split(',').map((t: string) => t.trim()).filter(Boolean);
                    return (
                      <div key={idx} className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                        <div className="flex justify-between items-start font-bold text-white">
                          <div>
                            <span className="text-indigo-300">{p.title}</span>
                            {p.role && <span className="text-slate-400 text-xs font-normal"> — {p.role}</span>}
                          </div>
                          {p.duration && <span className="font-mono text-slate-400 text-[10px]">{p.duration}</span>}
                        </div>
                        {p.description && <p className="text-slate-300 text-[11px] leading-relaxed">{p.description}</p>}
                        {techArr.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {techArr.map((t: string, tIdx: number) => (
                              <span key={tIdx} className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300 text-[10px] font-mono">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                        {p.key_outcomes && <p className="text-emerald-300 text-[11px]">✓ {p.key_outcomes}</p>}
                        <div className="flex items-center space-x-3 pt-1 text-[11px]">
                          {p.github_url && (
                            <a href={p.github_url} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">
                              GitHub Repo →
                            </a>
                          )}
                          {p.live_url && (
                            <a href={p.live_url} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">
                              Live Demo →
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-slate-500 italic">No projects added yet.</p>
                )}
              </div>

              {/* Work Experience */}
              {selectedStudent.experiences && selectedStudent.experiences.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-white uppercase text-[11px] border-b border-slate-800 pb-1">
                    Work / Internship Experience ({selectedStudent.experiences.length})
                  </h4>
                  {selectedStudent.experiences.map((e: any, idx: number) => (
                    <div key={idx} className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1">
                      <div className="flex justify-between font-bold text-white">
                        <span>{e.role} — {e.org}</span>
                        <span className="font-mono text-slate-400 text-[10px]">{e.duration}</span>
                      </div>
                      {e.location && <p className="text-[10px] text-slate-400">{e.location}</p>}
                      <p className="text-slate-300 text-[11px]">{e.description}</p>
                      {e.key_contributions && <p className="text-emerald-300 text-[11px]">★ {e.key_contributions}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Certifications */}
              {selectedStudent.certifications && selectedStudent.certifications.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-white uppercase text-[11px] border-b border-slate-800 pb-1">
                    Certifications & Licenses ({selectedStudent.certifications.length})
                  </h4>
                  {selectedStudent.certifications.map((c: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1">
                      <div className="flex justify-between font-bold text-white">
                        <span>{c.name}</span>
                        <span className="font-mono text-slate-400 text-[10px]">{c.date}</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">Issued by: {c.issuer}</p>
                      {c.credential_url && (
                        <a href={c.credential_url} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline text-[10px]">
                          Verify Credential →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Achievements */}
              {selectedStudent.achievements && selectedStudent.achievements.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-white uppercase text-[11px] border-b border-slate-800 pb-1">
                    Honors & Achievements ({selectedStudent.achievements.length})
                  </h4>
                  {selectedStudent.achievements.map((a: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1">
                      <div className="flex justify-between font-bold text-white">
                        <span>{a.title}</span>
                        <span className="font-mono text-slate-400 text-[10px]">{a.date}</span>
                      </div>
                      <p className="text-slate-400 text-[10px]">By: {a.issuing_body}</p>
                      {a.description && <p className="text-slate-300 text-[11px]">{a.description}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Extracurriculars */}
              {selectedStudent.extracurriculars && selectedStudent.extracurriculars.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-white uppercase text-[11px] border-b border-slate-800 pb-1">
                    Extracurricular Leadership ({selectedStudent.extracurriculars.length})
                  </h4>
                  {selectedStudent.extracurriculars.map((ex: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1">
                      <div className="flex justify-between font-bold text-white">
                        <span>{ex.activity} ({ex.role})</span>
                        <span className="font-mono text-slate-400 text-[10px]">{ex.duration}</span>
                      </div>
                      <p className="text-slate-400 text-[10px]">{ex.organization}</p>
                      {ex.description && <p className="text-slate-300 text-[11px]">{ex.description}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
                <a
                  href={`/p/${selectedStudent.register_number}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-lg shadow-indigo-600/30"
                >
                  <span>Open Public Portfolio</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
