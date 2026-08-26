export type Role = 'STUDENT' | 'TPO_ADMIN' | 'COLLEGE_ADMIN';
export type SkillCategory = 'LANGUAGE' | 'FRAMEWORK' | 'TOOL' | 'SOFT_SKILL';
export type Proficiency = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface User {
  id: string;
  role: Role;
  register_number: string;
  college_email: string;
  password_hash: string;
  email_verified: boolean;
  verification_token?: string | null;
  reset_token?: string | null;
  created_at: string;
}

export interface ProfileVisibility {
  id: string;
  student_id: string;
  section_name: string;
  is_public: boolean;
}

export interface Education {
  id: string;
  student_id: string;
  tenth_percentage: number;
  tenth_board: string;
  twelfth_percentage_or_diploma_details: string;
  twelfth_board: string;
  current_degree: string;
  specialization: string;
  expected_graduation_year: number;
}

export interface SemesterCGPA {
  id: string;
  student_id: string;
  semester_number: number;
  cgpa: number;
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
}

export interface StudentSkill {
  id: string;
  student_id: string;
  skill_id: string;
  skill?: Skill;
  proficiency: Proficiency;
}

export interface Project {
  id: string;
  student_id: string;
  title: string;
  description: string;
  role: string;
  tech_stack: string[];
  github_url?: string | null;
  live_url?: string | null;
  duration?: string | null;
  team_size?: number | null;
  key_outcomes?: string | null;
  ai_score?: number | null;
  ai_suggestions?: string | null;
  created_at?: string;
}

export interface Certification {
  id: string;
  student_id: string;
  name: string;
  issuer: string;
  date: string;
  credential_id?: string | null;
  credential_url?: string | null;
  expiry_date?: string | null;
}

export interface Experience {
  id: string;
  student_id: string;
  org: string;
  role: string;
  duration: string;
  location?: string | null;
  description: string;
  key_contributions?: string | null;
}

export interface Achievement {
  id: string;
  student_id: string;
  title: string;
  description: string;
  date?: string | null;
  issuing_body?: string | null;
}

export interface Extracurricular {
  id: string;
  student_id: string;
  activity: string;
  role: string;
  organization?: string | null;
  duration?: string | null;
  description?: string | null;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  full_name: string;
  register_number: string;
  department: string;
  year_or_batch: string;
  cgpa_overall?: number | null;
  phone?: string | null;
  personal_email?: string | null;
  linkedin_url?: string | null;
  github_url?: string | null;
  personal_website_url?: string | null;
  address?: string | null;
  profile_photo_url?: string | null;
  bio?: string | null;
  created_at: string;
  updated_at: string;

  education?: Education | null;
  semester_cgpas?: SemesterCGPA[];
  student_skills?: StudentSkill[];
  projects?: Project[];
  certifications?: Certification[];
  experiences?: Experience[];
  achievements?: Achievement[];
  extracurriculars?: Extracurricular[];
  visibilities?: ProfileVisibility[];
  user?: User; // enriched server-side by admin queries
}

export interface CompletenessResult {
  score: number; // 0 to 100
  totalFields: number;
  filledFields: number;
  gaps: string[];
}
