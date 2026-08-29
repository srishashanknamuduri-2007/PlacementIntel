import { db } from './store';
import { StudentProfile } from './types';
import { calculateCompleteness } from './completeness';

export interface PlacementFilterParams {
  department?: string;
  skill?: string;
  certification?: string;
  minCgpa?: number;
  hasProjects?: boolean;
  hasInternships?: boolean;
  searchQuery?: string;
}

export interface DepartmentStat {
  department: string;
  count: number;
  avgCgpa: number;
  withProjects: number;
}

export interface SkillStat {
  name: string;
  count: number;
  percentage: number;
}

export interface CgpaRangeStat {
  label: string;
  range: string;
  count: number;
  percentage: number;
}

export interface AggregateStats {
  totalStudents: number;
  completedProfilesCount: number;
  completedProfilesPercentage: number;
  studentsWithProjectsCount: number;
  studentsWithInternshipsCount: number;
  studentsWithCertificationsCount: number;
  averageCgpa: number;
  placementReadyCount: number;
  placementReadyPercentage: number;
  departmentBreakdown: DepartmentStat[];
  topSkills: SkillStat[];
  topCertifications: { name: string; count: number }[];
  cgpaRanges: CgpaRangeStat[];
}

// Filter out internal automated test suite artifact accounts
function isTestOrDemoArtifact(regNo: string, email: string): boolean {
  const r = (regNo || '').toUpperCase();
  const e = (email || '').toLowerCase();
  const testRegs = ['21CSMIN', '21CSMAX', '21CSTPO', '21CSAI', '21CS777', '21CS999'];
  if (testRegs.includes(r)) return true;
  if (e.includes('.test@') || e.includes('min.student@') || e.includes('max.student@') || e.includes('tpo.candidate@') || e.includes('ai.student@')) {
    return true;
  }
  return false;
}

export async function getFilteredStudents(params: PlacementFilterParams): Promise<StudentProfile[]> {
  const users = Array.from<any>((db as any).users.values()).filter((u: any) => u.role === 'STUDENT');
  const seenRegs = new Set<string>();
  const matchingProfiles: StudentProfile[] = [];

  for (const user of users) {
    const regUpper = (user.register_number || '').trim().toUpperCase();
    if (!regUpper || seenRegs.has(regUpper)) continue;

    // Ignore automated test-runner runner artifacts
    if (isTestOrDemoArtifact(regUpper, user.college_email || '')) continue;
    seenRegs.add(regUpper);

    // Retrieve genuine profile from store
    const profile = await db.getStudentProfileByUserId(user.id, regUpper);
    if (!profile) continue;

    // Attach user email & details
    (profile as any).user = user;

    // 1. Department Filter
    if (params.department && params.department !== 'ALL') {
      if ((profile.department || '').toLowerCase() !== params.department.toLowerCase()) {
        continue;
      }
    }

    // 2. Minimum CGPA Filter
    if (params.minCgpa !== undefined && params.minCgpa > 0) {
      const cgpa = profile.cgpa_overall || 0;
      if (cgpa < params.minCgpa) continue;
    }

    // 3. Skill Graph Filter
    if (params.skill && params.skill.trim() !== '') {
      const targetSkill = params.skill.trim().toLowerCase();
      const hasSkill = (profile.student_skills || []).some(
        (s: any) => (s.skill?.name || s.name || '').toLowerCase().includes(targetSkill)
      );
      if (!hasSkill) continue;
    }

    // 4. Certification Filter
    if (params.certification && params.certification.trim() !== '') {
      const targetCert = params.certification.trim().toLowerCase();
      const hasCert = (profile.certifications || []).some(
        (c: any) => (c.name || '').toLowerCase().includes(targetCert) || (c.issuer || '').toLowerCase().includes(targetCert)
      );
      if (!hasCert) continue;
    }

    // 5. Has Deployed Projects Filter
    if (params.hasProjects) {
      if (!profile.projects || profile.projects.length === 0) continue;
    }

    // 6. Has Internships Filter
    if (params.hasInternships) {
      if (!profile.experiences || profile.experiences.length === 0) continue;
    }

    // 7. General Text Search (Name / Reg No / Department)
    if (params.searchQuery && params.searchQuery.trim() !== '') {
      const q = params.searchQuery.trim().toLowerCase();
      const matchName = (profile.full_name || '').toLowerCase().includes(q);
      const matchReg = (profile.register_number || '').toLowerCase().includes(q);
      const matchDept = (profile.department || '').toLowerCase().includes(q);
      if (!matchName && !matchReg && !matchDept) continue;
    }

    matchingProfiles.push(profile);
  }

  return matchingProfiles;
}

export async function getPlacementStats(): Promise<AggregateStats> {
  const users = Array.from<any>((db as any).users.values()).filter((u: any) => u.role === 'STUDENT');
  const seenRegs = new Set<string>();
  const validProfiles: StudentProfile[] = [];

  for (const user of users) {
    const regUpper = (user.register_number || '').trim().toUpperCase();
    if (!regUpper || seenRegs.has(regUpper)) continue;
    if (isTestOrDemoArtifact(regUpper, user.college_email || '')) continue;
    seenRegs.add(regUpper);

    const profile = await db.getStudentProfileByUserId(user.id, regUpper);
    if (profile) validProfiles.push(profile);
  }

  const totalStudents = validProfiles.length;

  if (totalStudents === 0) {
    return {
      totalStudents: 0,
      completedProfilesCount: 0,
      completedProfilesPercentage: 0,
      studentsWithProjectsCount: 0,
      studentsWithInternshipsCount: 0,
      studentsWithCertificationsCount: 0,
      averageCgpa: 0,
      placementReadyCount: 0,
      placementReadyPercentage: 0,
      departmentBreakdown: [],
      topSkills: [],
      topCertifications: [],
      cgpaRanges: [],
    };
  }

  let completedCount = 0;
  let withProjects = 0;
  let withInternships = 0;
  let withCerts = 0;
  let totalCgpaSum = 0;
  let cgpaCount = 0;
  let placementReadyCount = 0;

  const deptMap: Record<string, { count: number; cgpaSum: number; cgpaCount: number; withProjects: number }> = {};
  const skillFreq: Record<string, number> = {};
  const certFreq: Record<string, number> = {};
  const cgpaBuckets = {
    top: 0, // >= 9.0
    high: 0, // 8.0 - 8.99
    med: 0, // 7.0 - 7.99
    low: 0, // < 7.0
  };

  for (const profile of validProfiles) {
    const comp = calculateCompleteness(profile);
    const isCompleted = comp.score >= 80;
    if (isCompleted) completedCount++;

    const hasProj = profile.projects && profile.projects.length > 0;
    const hasExp = profile.experiences && profile.experiences.length > 0;
    const hasCert = profile.certifications && profile.certifications.length > 0;

    if (hasProj) withProjects++;
    if (hasExp) withInternships++;
    if (hasCert) withCerts++;

    const cgpa = profile.cgpa_overall || 0;
    if (cgpa > 0) {
      totalCgpaSum += cgpa;
      cgpaCount++;

      if (cgpa >= 9.0) cgpaBuckets.top++;
      else if (cgpa >= 8.0) cgpaBuckets.high++;
      else if (cgpa >= 7.0) cgpaBuckets.med++;
      else cgpaBuckets.low++;
    } else {
      cgpaBuckets.low++;
    }

    // Placement Ready: Completed profile + CGPA >= 7.0 + at least 1 project
    if (isCompleted && cgpa >= 7.0 && hasProj) {
      placementReadyCount++;
    }

    // Department Stats
    const dept = profile.department || 'Other';
    if (!deptMap[dept]) {
      deptMap[dept] = { count: 0, cgpaSum: 0, cgpaCount: 0, withProjects: 0 };
    }
    deptMap[dept].count++;
    if (cgpa > 0) {
      deptMap[dept].cgpaSum += cgpa;
      deptMap[dept].cgpaCount++;
    }
    if (hasProj) deptMap[dept].withProjects++;

    // Skills frequency
    (profile.student_skills || []).forEach((s: any) => {
      const sName = (s.skill?.name || s.name || '').trim();
      if (sName) {
        skillFreq[sName] = (skillFreq[sName] || 0) + 1;
      }
    });

    // Certifications frequency
    (profile.certifications || []).forEach((c: any) => {
      const cName = (c.name || '').trim();
      if (cName) {
        certFreq[cName] = (certFreq[cName] || 0) + 1;
      }
    });
  }

  const departmentBreakdown: DepartmentStat[] = Object.entries(deptMap).map(([dept, data]) => ({
    department: dept,
    count: data.count,
    avgCgpa: data.cgpaCount > 0 ? parseFloat((data.cgpaSum / data.cgpaCount).toFixed(2)) : 0,
    withProjects: data.withProjects,
  }));

  const topSkills: SkillStat[] = Object.entries(skillFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / totalStudents) * 100),
    }));

  const topCertifications = Object.entries(certFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));

  const cgpaRanges: CgpaRangeStat[] = [
    { label: 'Distinction (≥ 9.0)', range: '>= 9.0', count: cgpaBuckets.top, percentage: Math.round((cgpaBuckets.top / totalStudents) * 100) },
    { label: 'First Class High (8.0 - 8.99)', range: '8.0 - 8.99', count: cgpaBuckets.high, percentage: Math.round((cgpaBuckets.high / totalStudents) * 100) },
    { label: 'First Class (7.0 - 7.99)', range: '7.0 - 7.99', count: cgpaBuckets.med, percentage: Math.round((cgpaBuckets.med / totalStudents) * 100) },
    { label: 'Second Class / Entry (< 7.0)', range: '< 7.0', count: cgpaBuckets.low, percentage: Math.round((cgpaBuckets.low / totalStudents) * 100) },
  ];

  return {
    totalStudents,
    completedProfilesCount: completedCount,
    completedProfilesPercentage: Math.round((completedCount / totalStudents) * 100),
    studentsWithProjectsCount: withProjects,
    studentsWithInternshipsCount: withInternships,
    studentsWithCertificationsCount: withCerts,
    averageCgpa: cgpaCount > 0 ? parseFloat((totalCgpaSum / cgpaCount).toFixed(2)) : 0,
    placementReadyCount,
    placementReadyPercentage: Math.round((placementReadyCount / totalStudents) * 100),
    departmentBreakdown,
    topSkills,
    topCertifications,
    cgpaRanges,
  };
}

export function generateShortlistCsv(profiles: StudentProfile[]): string {
  const headers = [
    'Register Number',
    'Full Name',
    'Department',
    'Batch',
    'CGPA Overall',
    '10th Percentage',
    '10th Board',
    '12th Percentage / Diploma',
    '12th Board',
    'Degree & Specialization',
    'Graduation Year',
    'College Email',
    'Personal Email',
    'Phone',
    'Skills List',
    'Project Titles',
    'Internships / Experience',
    'Certifications',
    'Achievements',
    'Extracurriculars',
  ];

  const rows = profiles.map((p) => {
    const skillsStr = (p.student_skills || []).map((s: any) => `${s.skill?.name || s.name} (${s.proficiency})`).join('; ');
    const projStr = (p.projects || []).map((proj: any) => `${proj.title} [${proj.role}]`).join('; ');
    const expStr = (p.experiences || []).map((e: any) => `${e.role} @ ${e.org} (${e.duration})`).join('; ');
    const certStr = (p.certifications || []).map((c: any) => `${c.name} (${c.issuer})`).join('; ');
    const achStr = (p.achievements || []).map((a: any) => a.title).join('; ');
    const extraStr = (p.extracurriculars || []).map((ex: any) => `${ex.activity} (${ex.role})`).join('; ');

    return [
      `"${p.register_number}"`,
      `"${p.full_name}"`,
      `"${p.department}"`,
      `"${p.year_or_batch}"`,
      p.cgpa_overall !== null && p.cgpa_overall !== undefined ? p.cgpa_overall : 'N/A',
      p.education?.tenth_percentage || 'N/A',
      `"${p.education?.tenth_board || 'N/A'}"`,
      `"${p.education?.twelfth_percentage_or_diploma_details || 'N/A'}"`,
      `"${p.education?.twelfth_board || 'N/A'}"`,
      `"${p.education?.current_degree || ''} in ${p.education?.specialization || ''}"`,
      p.education?.expected_graduation_year || 'N/A',
      `"${(p as any).user?.college_email || ''}"`,
      `"${p.personal_email || ''}"`,
      `"${p.phone || ''}"`,
      `"${skillsStr}"`,
      `"${projStr}"`,
      `"${expStr}"`,
      `"${certStr}"`,
      `"${achStr}"`,
      `"${extraStr}"`,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}