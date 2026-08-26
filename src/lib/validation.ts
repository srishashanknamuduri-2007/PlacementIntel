import { z } from 'zod';

// College Email Regex Check (Matches @*.edu, @*.ac.in, or university domain)
export const collegeEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(edu|ac\.in|edu\.in|college\.edu|[a-zA-Z0-9.-]+)$/i;

// Auth Schemas
export const SignupSchema = z.object({
  register_number: z
    .string()
    .min(3, 'Register number must be at least 3 characters')
    .max(30, 'Register number too long')
    .regex(/^[A-Za-z0-9_-]+$/, 'Register number must be alphanumeric'),
  college_email: z
    .string()
    .email('Invalid email address')
    .refine((val) => collegeEmailRegex.test(val), {
      message: 'College email must be a valid institutional domain (.edu, .ac.in, etc.)',
    }),
  full_name: z.string().min(2, 'Full name is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const LoginSchema = z.object({
  register_number: z.string().min(1, 'Register number is required'),
  password: z.string().min(1, 'Password is required'),
});

export const ForgotPasswordSchema = z.object({
  college_email: z.string().email('Invalid email format'),
});

export const ResetPasswordSchema = z.object({
  reset_token: z.string().min(1, 'Reset token required'),
  new_password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Robust Optional URL validator (handles valid URLs, empty strings, null, and undefined)
export const optionalUrl = z
  .union([
    z.string().url('Invalid URL format'),
    z.literal(''),
    z.null(),
    z.undefined(),
  ])
  .transform((val) => (val === '' || val === undefined ? null : val));

// Profile Validation Schemas
export const PersonalContactSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  department: z.string().min(1, 'Department is required'),
  year_or_batch: z.string().min(1, 'Year/Batch is required'),
  phone: z.string().nullable().optional().or(z.literal('')).transform(v => v === '' ? null : v),
  personal_email: z
    .union([
      z.string().email('Invalid personal email format'),
      z.literal(''),
      z.null(),
      z.undefined(),
    ])
    .transform((val) => (val === '' || val === undefined ? null : val))
    .optional(),
  linkedin_url: optionalUrl,
  github_url: optionalUrl,
  personal_website_url: optionalUrl,
  address: z.string().max(500, 'Address is too long').nullable().optional(),
  profile_photo_url: optionalUrl,
  bio: z.string().max(1000, 'Bio must be under 1000 characters').nullable().optional(),
  cgpa_overall: z
    .union([
      z.number().min(0, 'CGPA >= 0').max(10, 'CGPA <= 10'),
      z.string().transform((val) => (val === '' ? null : parseFloat(val))),
      z.null(),
      z.undefined(),
    ])
    .nullable()
    .optional(),
});

export const EducationSchema = z.object({
  tenth_percentage: z
    .union([
      z.number().min(0).max(100),
      z.string().transform((val) => parseFloat(val) || 0),
    ]),
  tenth_board: z.string().min(1, '10th Board is required'),
  twelfth_percentage_or_diploma_details: z
    .string()
    .min(1, '12th percentage or diploma details required'),
  twelfth_board: z.string().min(1, '12th Board is required'),
  current_degree: z.string().min(1, 'Current degree is required'),
  specialization: z.string().min(1, 'Specialization is required'),
  expected_graduation_year: z
    .union([
      z.number().int(),
      z.string().transform((val) => parseInt(val, 10) || 2028),
    ]),
});

export const SemesterCGPASchema = z.object({
  semester_number: z.union([z.number(), z.string().transform((v) => parseInt(v, 10))]),
  cgpa: z.union([z.number(), z.string().transform((v) => parseFloat(v))]),
});

export const SkillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  category: z.enum(['LANGUAGE', 'FRAMEWORK', 'TOOL', 'SOFT_SKILL']),
  proficiency: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
});

export const ProjectSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Project title is required'),
  description: z.string().min(1, 'Project description is required'),
  role: z.string().min(1, 'Role in project is required'),
  tech_stack: z
    .union([
      z.array(z.string()),
      z.string().transform((str) => str.split(',').map((s) => s.trim()).filter(Boolean)),
    ])
    .transform((val) => (Array.isArray(val) ? val : []))
    .refine((arr) => arr.length > 0, 'Specify at least one technology'),
  github_url: optionalUrl,
  live_url: optionalUrl,
  duration: z.string().nullable().optional(),
  team_size: z
    .union([
      z.number(),
      z.string().transform((val) => (val === '' ? null : parseInt(val, 10))),
      z.null(),
      z.undefined(),
    ])
    .nullable()
    .optional(),
  key_outcomes: z.string().nullable().optional(),
  ai_score: z.number().nullable().optional(),
  ai_suggestions: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
});

export const CertificationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Certification name is required'),
  issuer: z.string().min(1, 'Issuer is required'),
  date: z.string().min(1, 'Date is required'),
  credential_id: z.string().nullable().optional(),
  credential_url: optionalUrl,
  expiry_date: z.string().nullable().optional(),
});

export const ExperienceSchema = z.object({
  id: z.string().optional(),
  org: z.string().min(1, 'Organization is required'),
  role: z.string().min(1, 'Role is required'),
  duration: z.string().min(1, 'Duration is required'),
  location: z.string().nullable().optional(),
  description: z.string().min(1, 'Description is required'),
  key_contributions: z.string().nullable().optional(),
});

export const AchievementSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Achievement title is required'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().nullable().optional(),
  issuing_body: z.string().nullable().optional(),
});

export const ExtracurricularSchema = z.object({
  id: z.string().optional(),
  activity: z.string().min(1, 'Activity name is required'),
  role: z.string().min(1, 'Role is required'),
  organization: z.string().nullable().optional(),
  duration: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

export const ProfileVisibilitySchema = z.object({
  section_name: z.string().min(1),
  is_public: z.boolean(),
});
