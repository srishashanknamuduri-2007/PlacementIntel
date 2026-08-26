import { db } from './store';
import { StudentProfile } from './types';

export interface FilteredPublicProfile {
  full_name: string;
  register_number: string;
  department: string;
  year_or_batch: string;
  bio?: string | null;
  profile_photo_url?: string | null;
  cgpa_overall?: number | null;
  phone?: string | null;
  personal_email?: string | null;
  linkedin_url?: string | null;
  github_url?: string | null;
  personal_website_url?: string | null;
  address?: string | null;

  education?: any | null;
  semester_cgpas?: any[];
  student_skills?: any[];
  projects?: any[];
  certifications?: any[];
  experiences?: any[];
  achievements?: any[];
  extracurriculars?: any[];
  visibilities: Record<string, boolean>;
}

export async function getPublicStudentProfile(identifier: string): Promise<FilteredPublicProfile | null> {
  const normId = identifier.trim().toUpperCase();

  // Find User by register number
  const user = await db.findUserByRegisterNumber(normId);
  let rawProfile: StudentProfile | null = null;

  if (user) {
    rawProfile = await db.getStudentProfileByUserId(user.id, normId);
  } else {
    rawProfile = await db.getStudentProfileByUserId(identifier, normId);
  }

  if (!rawProfile) return null;

  // Build Visibility Map — default ALL sections to TRUE so data shows up
  const visMap: Record<string, boolean> = {
    personal: true,
    education: true,
    skills: true,
    projects: true,
    certifications: true,
    experience: true,
    achievements: true,
    extracurricular: true,
    cgpa: true,
    address: true,
    phone: true,
  };

  // Override with any explicit user-set visibilities
  (rawProfile.visibilities || []).forEach((v) => {
    visMap[v.section_name] = v.is_public;
  });

  const publicData: FilteredPublicProfile = {
    full_name: rawProfile.full_name,
    register_number: rawProfile.register_number,
    department: rawProfile.department,
    year_or_batch: rawProfile.year_or_batch,
    bio: rawProfile.bio,
    profile_photo_url: rawProfile.profile_photo_url,
    linkedin_url: rawProfile.linkedin_url,
    github_url: rawProfile.github_url,
    personal_website_url: rawProfile.personal_website_url,
    personal_email: visMap['personal'] ? rawProfile.personal_email : null,

    // Conditionally include sensitive fields
    cgpa_overall: visMap['cgpa'] ? rawProfile.cgpa_overall : null,
    phone: visMap['phone'] ? rawProfile.phone : null,
    address: visMap['address'] ? rawProfile.address : null,

    // Include section data based on visibility
    education: visMap['education'] ? rawProfile.education : null,
    semester_cgpas: visMap['education'] && visMap['cgpa'] ? (rawProfile.semester_cgpas || []) : [],
    student_skills: visMap['skills'] ? (rawProfile.student_skills || []) : [],
    projects: visMap['projects'] ? (rawProfile.projects || []) : [],
    certifications: visMap['certifications'] ? (rawProfile.certifications || []) : [],
    experiences: visMap['experience'] ? (rawProfile.experiences || []) : [],
    achievements: visMap['achievements'] ? (rawProfile.achievements || []) : [],
    extracurriculars: visMap['extracurricular'] ? (rawProfile.extracurriculars || []) : [],
    visibilities: visMap,
  };

  return publicData;
}

/** Build a full (no visibility filtering) profile view for dashboard preview */
export function buildFullPreviewProfile(rawProfile: StudentProfile): FilteredPublicProfile {
  const visMap: Record<string, boolean> = {};
  (rawProfile.visibilities || []).forEach((v) => {
    visMap[v.section_name] = v.is_public;
  });

  return {
    full_name: rawProfile.full_name,
    register_number: rawProfile.register_number,
    department: rawProfile.department,
    year_or_batch: rawProfile.year_or_batch,
    bio: rawProfile.bio,
    profile_photo_url: rawProfile.profile_photo_url,
    cgpa_overall: rawProfile.cgpa_overall,
    phone: rawProfile.phone,
    personal_email: rawProfile.personal_email,
    linkedin_url: rawProfile.linkedin_url,
    github_url: rawProfile.github_url,
    personal_website_url: rawProfile.personal_website_url,
    address: rawProfile.address,
    education: rawProfile.education,
    semester_cgpas: rawProfile.semester_cgpas || [],
    student_skills: rawProfile.student_skills || [],
    projects: rawProfile.projects || [],
    certifications: rawProfile.certifications || [],
    experiences: rawProfile.experiences || [],
    achievements: rawProfile.achievements || [],
    extracurriculars: rawProfile.extracurriculars || [],
    visibilities: visMap,
  };
}
