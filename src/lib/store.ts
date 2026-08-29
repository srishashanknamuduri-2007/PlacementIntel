// ============================================================
// DATABASE STORE — PostgreSQL via Prisma ORM
// Replaces in-memory Map<> store with real persistent queries
// Falls back to in-memory seeded store when DATABASE_URL is not set
// ============================================================

import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import {
  User,
  StudentProfile,
  Education,
  SemesterCGPA,
  Skill,
  StudentSkill,
  Project,
  Certification,
  Experience,
  Achievement,
  Extracurricular,
  ProfileVisibility,
} from './types';

const USE_DATABASE = !!process.env.DATABASE_URL;

// ─────────────────────────────────────────────────────────
// IN-MEMORY FALLBACK STORE (used when DATABASE_URL is absent)
// Data is persisted to a local JSON file so it survives server restarts
// ─────────────────────────────────────────────────────────
import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), '.dev-db.json');

function readDb(): Record<string, any> {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    }
  } catch { /* ignore */ }
  return {};
}

function writeDb(data: Record<string, any>) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch { /* ignore */ }
}

class InMemoryStore {
  private users: Map<string, User> = new Map();
  private profiles: Map<string, StudentProfile> = new Map();
  private educations: Map<string, Education> = new Map();
  private semesterCgpas: Map<string, SemesterCGPA[]> = new Map();
  private skills: Map<string, Skill> = new Map();
  private studentSkills: Map<string, StudentSkill[]> = new Map();
  private projects: Map<string, Project[]> = new Map();
  private certifications: Map<string, Certification[]> = new Map();
  private experiences: Map<string, Experience[]> = new Map();
  private achievements: Map<string, Achievement[]> = new Map();
  private extracurriculars: Map<string, Extracurricular[]> = new Map();
  private visibilities: Map<string, Map<string, ProfileVisibility>> = new Map();

  constructor() {
    this.seedDefaultSkills();
    this.seedDemoAdmin();
    this.loadFromFile(); // Load persisted real student data from file
  }

  private loadFromFile() {
    const db = readDb();
    if (db.users) {
      for (const [k, v] of Object.entries(db.users)) this.users.set(k, v as User);
    }
    if (db.profiles) {
      for (const [k, v] of Object.entries(db.profiles)) this.profiles.set(k, v as StudentProfile);
    }
    if (db.educations) {
      for (const [k, v] of Object.entries(db.educations)) this.educations.set(k, v as Education);
    }
    if (db.semesterCgpas) {
      for (const [k, v] of Object.entries(db.semesterCgpas)) this.semesterCgpas.set(k, v as SemesterCGPA[]);
    }
    if (db.skills) {
      for (const [k, v] of Object.entries(db.skills)) this.skills.set(k, v as Skill);
    }
    if (db.studentSkills) {
      for (const [k, v] of Object.entries(db.studentSkills)) this.studentSkills.set(k, v as StudentSkill[]);
    }
    if (db.projects) {
      for (const [k, v] of Object.entries(db.projects)) this.projects.set(k, v as Project[]);
    }
    if (db.certifications) {
      for (const [k, v] of Object.entries(db.certifications)) this.certifications.set(k, v as Certification[]);
    }
    if (db.experiences) {
      for (const [k, v] of Object.entries(db.experiences)) this.experiences.set(k, v as Experience[]);
    }
    if (db.achievements) {
      for (const [k, v] of Object.entries(db.achievements)) this.achievements.set(k, v as Achievement[]);
    }
    if (db.extracurriculars) {
      for (const [k, v] of Object.entries(db.extracurriculars)) this.extracurriculars.set(k, v as Extracurricular[]);
    }
    if (db.visibilities) {
      for (const [k, v] of Object.entries(db.visibilities as Record<string, Record<string, ProfileVisibility>>)) {
        const inner = new Map<string, ProfileVisibility>();
        for (const [sk, sv] of Object.entries(v)) inner.set(sk, sv);
        this.visibilities.set(k, inner);
      }
    }
    this.seedDemoAdmin(); // Guarantee T&P SRKR admin is always active
  }

  private persist() {
    const visObj: Record<string, Record<string, ProfileVisibility>> = {};
    for (const [k, v] of this.visibilities.entries()) {
      visObj[k] = Object.fromEntries(v.entries());
    }
    writeDb({
      users: Object.fromEntries(this.users.entries()),
      profiles: Object.fromEntries(this.profiles.entries()),
      educations: Object.fromEntries(this.educations.entries()),
      semesterCgpas: Object.fromEntries(this.semesterCgpas.entries()),
      skills: Object.fromEntries(this.skills.entries()),
      studentSkills: Object.fromEntries(this.studentSkills.entries()),
      projects: Object.fromEntries(this.projects.entries()),
      certifications: Object.fromEntries(this.certifications.entries()),
      experiences: Object.fromEntries(this.experiences.entries()),
      achievements: Object.fromEntries(this.achievements.entries()),
      extracurriculars: Object.fromEntries(this.extracurriculars.entries()),
      visibilities: visObj,
    });
  }

  private seedDefaultSkills() {
    const defaults = [
      { name: 'Python', category: 'LANGUAGE' as const },
      { name: 'JavaScript', category: 'LANGUAGE' as const },
      { name: 'TypeScript', category: 'LANGUAGE' as const },
      { name: 'Java', category: 'LANGUAGE' as const },
      { name: 'C++', category: 'LANGUAGE' as const },
      { name: 'React.js', category: 'FRAMEWORK' as const },
      { name: 'Next.js', category: 'FRAMEWORK' as const },
      { name: 'Node.js', category: 'FRAMEWORK' as const },
      { name: 'Express.js', category: 'FRAMEWORK' as const },
      { name: 'PostgreSQL', category: 'TOOL' as const },
      { name: 'Git & GitHub', category: 'TOOL' as const },
      { name: 'Docker', category: 'TOOL' as const },
      { name: 'Communication', category: 'SOFT_SKILL' as const },
      { name: 'Problem Solving', category: 'SOFT_SKILL' as const },
      { name: 'Team Leadership', category: 'SOFT_SKILL' as const },
    ];
    defaults.forEach((s) => {
      const id = crypto.randomUUID();
      this.skills.set(s.name.toLowerCase(), { id, name: s.name, category: s.category });
    });
  }

  private seedDemoAdmin() {
    const adminPass = bcrypt.hashSync('tp@srkrec', 10);
    const adminUser: User = {
      id: 'admin-user-tpsrkrec',
      role: 'TPO_ADMIN',
      register_number: 'T&P SRKR',
      college_email: 'tp@srkrec.edu.in',
      password_hash: adminPass,
      email_verified: true,
      created_at: new Date().toISOString(),
    };
    this.users.set(adminUser.id, adminUser);
    this.users.set('admin-user-001', {
      ...adminUser,
      id: 'admin-user-001',
      register_number: 'ADMIN001',
    });
  }

  private seedDemoStudent() {
    const studentPass = bcrypt.hashSync('Student@123', 10);
    const userId = 'demo-student-21cs045';
    const profileId = 'demo-profile-21cs045';

    const studentUser: User = {
      id: userId,
      role: 'STUDENT',
      register_number: '21CS045',
      college_email: 'alex.rivera@college.edu',
      password_hash: studentPass,
      email_verified: true,
      created_at: new Date().toISOString(),
    };
    this.users.set(userId, studentUser);

    const profile: StudentProfile = {
      id: profileId,
      user_id: userId,
      full_name: 'Alex Rivera',
      register_number: '21CS045',
      department: 'Computer Science',
      year_or_batch: '2024-2028',
      cgpa_overall: 8.95,
      phone: '+91 98765 43210',
      personal_email: 'alex.rivera@gmail.com',
      linkedin_url: 'https://linkedin.com/in/alexrivera',
      github_url: 'https://github.com/alexrivera',
      personal_website_url: 'https://alexrivera.dev',
      address: '123 Tech Campus, Innovation Drive, Silicon City',
      bio: 'Passionate computer science engineer specializing in full-stack web applications, database architecture, and AI-driven platforms.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.profiles.set(userId, profile);

    this.educations.set(profileId, {
      id: crypto.randomUUID(),
      student_id: profileId,
      tenth_percentage: 95.2,
      tenth_board: 'CBSE',
      twelfth_percentage_or_diploma_details: '96.4%',
      twelfth_board: 'CBSE',
      current_degree: 'B.Tech',
      specialization: 'Computer Science & Engineering',
      expected_graduation_year: 2028,
    });

    this.semesterCgpas.set(profileId, [
      { id: crypto.randomUUID(), student_id: profileId, semester_number: 1, cgpa: 8.8 },
      { id: crypto.randomUUID(), student_id: profileId, semester_number: 2, cgpa: 9.1 },
    ]);

    const pythonSkill = this.skills.get('python') || { id: 's1', name: 'Python', category: 'LANGUAGE' };
    const reactSkill = this.skills.get('react.js') || { id: 's2', name: 'React.js', category: 'FRAMEWORK' };
    const postgresSkill = this.skills.get('postgresql') || { id: 's3', name: 'PostgreSQL', category: 'TOOL' };

    this.studentSkills.set(profileId, [
      { id: crypto.randomUUID(), student_id: profileId, skill_id: pythonSkill.id, skill: pythonSkill, proficiency: 'ADVANCED' },
      { id: crypto.randomUUID(), student_id: profileId, skill_id: reactSkill.id, skill: reactSkill, proficiency: 'ADVANCED' },
      { id: crypto.randomUUID(), student_id: profileId, skill_id: postgresSkill.id, skill: postgresSkill, proficiency: 'INTERMEDIATE' },
    ]);

    this.projects.set(profileId, [
      {
        id: 'demo-proj-1',
        student_id: profileId,
        title: 'Placement Intelligence Platform',
        description: 'Single structured profile platform generating ATS resumes, portfolios, and T&P analytics.',
        role: 'Lead Architect',
        tech_stack: ['Next.js', 'Tailwind', 'PostgreSQL', 'Prisma'],
        github_url: 'https://github.com/alexrivera/placement-intel',
        live_url: 'https://placement-intel.vercel.app',
        duration: '2 Months',
        team_size: 1,
        key_outcomes: 'Engineered multi-section profile manager with 100% field-level completeness engine.',
        ai_score: 92,
        ai_suggestions: '["Quantified performance metrics added","Verified GitHub repository linked"]',
      },
    ]);

    this.certifications.set(profileId, [
      {
        id: 'demo-cert-1',
        student_id: profileId,
        name: 'AWS Certified Solutions Architect',
        issuer: 'Amazon Web Services',
        date: '2024-05',
        credential_id: 'AWS-998877',
        credential_url: 'https://aws.amazon.com/verify',
      },
    ]);

    this.experiences.set(profileId, [
      {
        id: 'demo-exp-1',
        student_id: profileId,
        org: 'TechCorp Innovations',
        role: 'Full Stack Developer Intern',
        duration: 'May 2024 – July 2024',
        location: 'Remote',
        description: 'Built REST APIs and React dashboards for internal analytics tool.',
        key_contributions: 'Reduced API response time by 40% via query optimizations.',
      },
    ]);

    this.achievements.set(profileId, [
      {
        id: 'demo-ach-1',
        student_id: profileId,
        title: 'Smart India Hackathon 2024 Winner',
        description: 'Built an AI-powered disaster management system for NDRF in 36 hours.',
        date: '2024-09',
        issuing_body: 'Ministry of Education, India',
      },
    ]);

    const sections = ['personal','education','skills','projects','certifications','experience','achievements','extracurricular','cgpa','address','phone'];
    const visMap = new Map<string, ProfileVisibility>();
    sections.forEach((sec) => {
      visMap.set(sec, { id: crypto.randomUUID(), student_id: profileId, section_name: sec, is_public: true });
    });
    this.visibilities.set(profileId, visMap);
  }

  async findUserByRegisterNumber(regNo: string): Promise<User | null> {
    if (!regNo) return null;
    const clean = regNo.trim().toUpperCase();
    const compact = clean.replace(/[^A-Z0-9]/g, '');

    for (const u of this.users.values()) {
      const uClean = u.register_number.toUpperCase();
      const uCompact = uClean.replace(/[^A-Z0-9]/g, '');
      if (uClean === clean || (compact.length >= 3 && uCompact === compact)) {
        return u;
      }
    }
    return null;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    if (!email) return null;
    const normalized = email.trim().toLowerCase();
    for (const u of this.users.values()) {
      if (u.college_email.toLowerCase() === normalized) return u;
    }
    return null;
  }

  async createUser(data: {
    register_number: string;
    college_email: string;
    full_name: string;
    password_hash: string;
    role?: 'STUDENT' | 'TPO_ADMIN' | 'COLLEGE_ADMIN';
  }): Promise<{ user: User; verificationToken: string }> {
    const existingReg = await this.findUserByRegisterNumber(data.register_number);
    if (existingReg) throw new Error(`Register number '${data.register_number.toUpperCase()}' is already registered.`);
    const existingEmail = await this.findUserByEmail(data.college_email);
    if (existingEmail) throw new Error(`College email '${data.college_email.toLowerCase()}' is already registered.`);

    const userId = crypto.randomUUID();
    const token = crypto.randomBytes(24).toString('hex');
    const newUser: User = {
      id: userId,
      role: data.role || 'STUDENT',
      register_number: data.register_number.toUpperCase(),
      college_email: data.college_email.toLowerCase(),
      password_hash: data.password_hash,
      email_verified: false,
      verification_token: token,
      created_at: new Date().toISOString(),
    };
    this.users.set(userId, newUser);

    const profileId = crypto.randomUUID();
    const newProfile: StudentProfile = {
      id: profileId, user_id: userId,
      full_name: data.full_name,
      register_number: data.register_number.toUpperCase(),
      department: 'Computer Science', year_or_batch: '2024-2028',
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    this.profiles.set(userId, newProfile);

    const sections = ['personal','education','skills','projects','certifications','experience','achievements','extracurricular','cgpa','address','phone'];
    const visMap = new Map<string, ProfileVisibility>();
    sections.forEach((sec) => visMap.set(sec, { id: crypto.randomUUID(), student_id: profileId, section_name: sec, is_public: false }));
    this.visibilities.set(profileId, visMap);
    this.persist();

    return { user: newUser, verificationToken: token };
  }

  async verifyEmailToken(token: string): Promise<User | null> {
    for (const u of this.users.values()) {
      if (u.verification_token === token) {
        u.email_verified = true; u.verification_token = null;
        this.users.set(u.id, u); this.persist(); return u;
      }
    }
    return null;
  }

  async verifyUserByRegisterNumber(regNo: string): Promise<User | null> {
    const user = await this.findUserByRegisterNumber(regNo);
    if (user) { user.email_verified = true; user.verification_token = null; this.users.set(user.id, user); this.persist(); }
    return user;
  }

  async createPasswordResetToken(collegeEmail: string): Promise<string | null> {
    const user = await this.findUserByEmail(collegeEmail);
    if (!user) return null;
    const resetToken = crypto.randomBytes(24).toString('hex');
    user.reset_token = resetToken; this.users.set(user.id, user); this.persist();
    return resetToken;
  }

  async resetPasswordWithToken(token: string, newPasswordHash: string): Promise<boolean> {
    for (const u of this.users.values()) {
      if (u.reset_token === token) {
        u.password_hash = newPasswordHash; u.reset_token = null;
        this.users.set(u.id, u); this.persist(); return true;
      }
    }
    return false;
  }

  async getStudentProfileByUserId(userId: string, registerNumber?: string): Promise<StudentProfile | null> {
    let profile = this.profiles.get(userId);
    if (!profile && registerNumber) {
      const normReg = registerNumber.trim().toUpperCase();
      for (const p of this.profiles.values()) {
        if (p.register_number.toUpperCase() === normReg) {
          profile = p;
          break;
        }
      }
    }

    if (!profile) {
      let user = this.users.get(userId);
      if (!user && registerNumber) {
        user = await this.findUserByRegisterNumber(registerNumber);
      }

      if (!user) {
        const regNo = registerNumber || userId;
        const regUpper = regNo.trim().toUpperCase();
        const passHash = bcrypt.hashSync('Student@123', 10);
        const newUser: User = {
          id: userId,
          role: 'STUDENT',
          register_number: regUpper,
          college_email: `${regUpper.toLowerCase()}@college.edu`,
          password_hash: passHash,
          email_verified: true,
          created_at: new Date().toISOString(),
        };
        this.users.set(userId, newUser);
        user = newUser;
      }

      const profileId = crypto.randomUUID();
      profile = {
        id: profileId,
        user_id: user.id,
        full_name: user.register_number,
        register_number: user.register_number,
        department: 'Computer Science',
        year_or_batch: '2024-2028',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.profiles.set(user.id, profile);
      this.profiles.set(userId, profile);

      const sections = ['personal','education','skills','projects','certifications','experience','achievements','extracurricular','cgpa','address','phone'];
      const visMap = new Map<string, ProfileVisibility>();
      sections.forEach((sec) => visMap.set(sec, { id: crypto.randomUUID(), student_id: profileId, section_name: sec, is_public: false }));
      this.visibilities.set(profileId, visMap);
      this.persist();
    }

    const pId = profile.id;
    return {
      ...profile,
      education: this.educations.get(pId) || null,
      semester_cgpas: this.semesterCgpas.get(pId) || [],
      student_skills: this.studentSkills.get(pId) || [],
      projects: this.projects.get(pId) || [],
      certifications: this.certifications.get(pId) || [],
      experiences: this.experiences.get(pId) || [],
      achievements: this.achievements.get(pId) || [],
      extracurriculars: this.extracurriculars.get(pId) || [],
      visibilities: Array.from(this.visibilities.get(pId)?.values() || []),
    };
  }

  async updatePersonalContact(userId: string, data: Partial<StudentProfile>): Promise<StudentProfile> {
    const profile = await this.getStudentProfileByUserId(userId);
    if (!profile) throw new Error('Student profile not found');
    // Strip nested arrays from spread — we only want base fields
    const { education, semester_cgpas, student_skills, projects, certifications, experiences, achievements, extracurriculars, visibilities, ...baseData } = data as any;
    const updated = { ...profile, ...baseData, updated_at: new Date().toISOString() };
    this.profiles.set(userId, updated);
    this.profiles.set(profile.user_id, updated);
    this.profiles.set(profile.id, updated);
    this.persist();
    return (await this.getStudentProfileByUserId(profile.user_id, profile.register_number))!;
  }

  async updateEducation(
    userId: string,
    data: Partial<Omit<Education, 'id' | 'student_id'>>
  ): Promise<Education> {
    const profile = await this.getStudentProfileByUserId(userId);
    if (!profile) throw new Error('Student profile not found');

    const existing = this.educations.get(profile.id);
    const merged = { ...(existing || {}), ...data } as Partial<Education>;

    const edu: Education = {
      id: existing?.id || crypto.randomUUID(),
      student_id: profile.id,
      tenth_percentage: Number(merged.tenth_percentage ?? 0),
      tenth_board: merged.tenth_board ?? '',
      twelfth_percentage_or_diploma_details: merged.twelfth_percentage_or_diploma_details ?? '',
      twelfth_board: merged.twelfth_board ?? '',
      current_degree: merged.current_degree ?? '',
      specialization: merged.specialization ?? '',
      expected_graduation_year: Number(merged.expected_graduation_year ?? 0),
    };

    this.educations.set(profile.id, edu);
    this.persist();

    return edu;
  }

  async updateSemesterCGPAs(userId: string, semesters: Partial<Omit<SemesterCGPA, 'id' | 'student_id'>>[]): Promise<SemesterCGPA[]> {
    const profile = await this.getStudentProfileByUserId(userId);
    if (!profile) throw new Error('Student profile not found');
    const items = semesters.map((s) => ({
      id: crypto.randomUUID(),
      student_id: profile.id,
      semester_number: Number(s.semester_number),
      cgpa: Number(s.cgpa),
    }));
    this.semesterCgpas.set(profile.id, items);
    this.persist();
    return items;
  }

  async getAllSkills(): Promise<Skill[]> { return Array.from(this.skills.values()); }

  async addOrGetSkill(name: string, category: Skill['category']): Promise<Skill> {
    const key = name.trim().toLowerCase();
    const existing = this.skills.get(key);
    if (existing) return existing;
    const newSkill: Skill = { id: crypto.randomUUID(), name: name.trim(), category };
    this.skills.set(key, newSkill);
    return newSkill;
  }

  async updateStudentSkills(userId: string, skillInputs: { name?: string; category?: Skill['category']; proficiency?: StudentSkill['proficiency'] }[]): Promise<StudentSkill[]> {
    const profile = await this.getStudentProfileByUserId(userId);
    if (!profile) throw new Error('Student profile not found');
    const list: StudentSkill[] = [];
    for (const item of skillInputs) {
      if (!item.name || !item.category || !item.proficiency) continue;
      const skill = await this.addOrGetSkill(item.name, item.category);
      list.push({ id: crypto.randomUUID(), student_id: profile.id, skill_id: skill.id, skill, proficiency: item.proficiency });
    }
    this.studentSkills.set(profile.id, list);
    this.persist();
    return list;
  }

  async updateProjects(userId: string, projectInputs: Partial<Omit<Project, 'student_id'>>[]): Promise<Project[]> {
    const profile = await this.getStudentProfileByUserId(userId);
    if (!profile) throw new Error('Student profile not found');
    const list: Project[] = [];
    for (const p of projectInputs) {
      if (!p.title || !p.description || !p.role || !p.tech_stack) continue;
      list.push({
        id: p.id || crypto.randomUUID(),
        student_id: profile.id,
        title: p.title,
        description: p.description,
        role: p.role,
        tech_stack: p.tech_stack,
        github_url: p.github_url ?? null,
        live_url: p.live_url ?? null,
        duration: p.duration ?? null,
        team_size: p.team_size ?? null,
        key_outcomes: p.key_outcomes ?? null,
        ai_score: p.ai_score ?? null,
        ai_suggestions: p.ai_suggestions ?? null,
        created_at: p.created_at || new Date().toISOString(),
      });
    }
    this.projects.set(profile.id, list);
    this.persist();
    return list;
  }

  async updateCertifications(userId: string, certInputs: Partial<Omit<Certification, 'student_id'>>[]): Promise<Certification[]> {
    const profile = await this.getStudentProfileByUserId(userId);
    if (!profile) throw new Error('Student profile not found');
    const list: Certification[] = [];
    for (const c of certInputs) {
      if (!c.name || !c.issuer || !c.date) continue;
      list.push({
        id: c.id || crypto.randomUUID(),
        student_id: profile.id,
        name: c.name,
        issuer: c.issuer,
        date: c.date,
        credential_id: c.credential_id ?? null,
        credential_url: c.credential_url ?? null,
        expiry_date: c.expiry_date ?? null,
      });
    }
    this.certifications.set(profile.id, list);
    this.persist();
    return list;
  }

  async updateExperiences(userId: string, expInputs: Partial<Omit<Experience, 'student_id'>>[]): Promise<Experience[]> {
    const profile = await this.getStudentProfileByUserId(userId);
    if (!profile) throw new Error('Student profile not found');
    const list: Experience[] = [];
    for (const e of expInputs) {
      if (!e.org || !e.role || !e.duration || !e.description) continue;
      list.push({
        id: e.id || crypto.randomUUID(),
        student_id: profile.id,
        org: e.org,
        role: e.role,
        duration: e.duration,
        location: e.location ?? null,
        description: e.description,
        key_contributions: e.key_contributions ?? null,
      });
    }
    this.experiences.set(profile.id, list);
    this.persist();
    return list;
  }

  async updateAchievements(userId: string, achInputs: Partial<Omit<Achievement, 'student_id'>>[]): Promise<Achievement[]> {
    const profile = await this.getStudentProfileByUserId(userId);
    if (!profile) throw new Error('Student profile not found');
    const list: Achievement[] = [];
    for (const a of achInputs) {
      if (!a.title || !a.description) continue;
      list.push({
        id: a.id || crypto.randomUUID(),
        student_id: profile.id,
        title: a.title,
        description: a.description,
        date: a.date ?? null,
        issuing_body: a.issuing_body ?? null,
      });
    }
    this.achievements.set(profile.id, list);
    this.persist();
    return list;
  }

  async updateExtracurriculars(userId: string, extraInputs: Omit<Extracurricular, 'student_id'>[]): Promise<Extracurricular[]> {
    const profile = await this.getStudentProfileByUserId(userId);
    if (!profile) throw new Error('Student profile not found');
    const list = extraInputs.map((ex) => ({ ...ex, id: ex.id || crypto.randomUUID(), student_id: profile.id }));
    this.extracurriculars.set(profile.id, list);
    this.persist();
    return list;
  }

  async updateVisibility(userId: string, section_name: string, is_public: boolean): Promise<ProfileVisibility> {
    const profile = await this.getStudentProfileByUserId(userId);
    if (!profile) throw new Error('Student profile not found');
    const pId = profile.id;
    let visMap = this.visibilities.get(pId);
    if (!visMap) { visMap = new Map(); this.visibilities.set(pId, visMap); }
    const item: ProfileVisibility = { id: visMap.get(section_name)?.id || crypto.randomUUID(), student_id: pId, section_name, is_public };
    visMap.set(section_name, item);
    this.persist();
    return item;
  }
}

// ─────────────────────────────────────────────────────────
// PRISMA DATABASE STORE (used when DATABASE_URL is set)
// ─────────────────────────────────────────────────────────
class PrismaDBStore {
  private mapUser(u: any): User {
    return {
      id: u.id, role: u.role, register_number: u.register_number,
      college_email: u.college_email, password_hash: u.password_hash,
      email_verified: u.email_verified, verification_token: u.verification_token ?? null,
      reset_token: u.reset_token ?? null, created_at: u.created_at?.toISOString?.() ?? new Date().toISOString(),
    };
  }

  private mapProfile(p: any): StudentProfile {
    const techStackArr = (proj: any) => {
      if (!proj.tech_stack) return [];
      return typeof proj.tech_stack === 'string' ? proj.tech_stack.split(',').map((t: string) => t.trim()).filter(Boolean) : proj.tech_stack;
    };

    return {
      id: p.id, user_id: p.user_id,
      full_name: p.full_name, register_number: p.register_number,
      department: p.department, year_or_batch: p.year_or_batch,
      cgpa_overall: p.cgpa_overall ?? null,
      phone: p.phone ?? null, personal_email: p.personal_email ?? null,
      linkedin_url: p.linkedin_url ?? null, github_url: p.github_url ?? null,
      personal_website_url: p.personal_website_url ?? null,
      address: p.address ?? null, profile_photo_url: p.profile_photo_url ?? null,
      bio: p.bio ?? null,
      created_at: p.created_at?.toISOString?.() ?? new Date().toISOString(),
      updated_at: p.updated_at?.toISOString?.() ?? new Date().toISOString(),
      education: p.education ? {
        id: p.education.id, student_id: p.education.student_id,
        tenth_percentage: p.education.tenth_percentage,
        tenth_board: p.education.tenth_board,
        twelfth_percentage_or_diploma_details: p.education.twelfth_percentage_or_diploma_details,
        twelfth_board: p.education.twelfth_board,
        current_degree: p.education.current_degree,
        specialization: p.education.specialization,
        expected_graduation_year: p.education.expected_graduation_year,
      } : null,
      semester_cgpas: (p.semester_cgpas ?? []).map((s: any) => ({ id: s.id, student_id: s.student_id, semester_number: s.semester_number, cgpa: s.cgpa })),
      student_skills: (p.student_skills ?? []).map((ss: any) => ({
        id: ss.id, student_id: ss.student_id, skill_id: ss.skill_id,
        skill: { id: ss.skill.id, name: ss.skill.name, category: ss.skill.category },
        proficiency: ss.proficiency,
      })),
      projects: (p.projects ?? []).map((proj: any) => ({
        id: proj.id, student_id: proj.student_id,
        title: proj.title, description: proj.description, role: proj.role,
        tech_stack: techStackArr(proj),
        github_url: proj.github_url ?? null, live_url: proj.live_url ?? null,
        duration: proj.duration ?? null, team_size: proj.team_size ?? null,
        key_outcomes: proj.key_outcomes ?? null,
        ai_score: proj.ai_score ?? null, ai_suggestions: proj.ai_suggestions ?? null,
        created_at: proj.created_at?.toISOString?.() ?? new Date().toISOString(),
      })),
      certifications: (p.certifications ?? []).map((c: any) => ({
        id: c.id, student_id: c.student_id, name: c.name, issuer: c.issuer,
        date: c.date, credential_id: c.credential_id ?? null,
        credential_url: c.credential_url ?? null, expiry_date: c.expiry_date ?? null,
      })),
      experiences: (p.experiences ?? []).map((e: any) => ({
        id: e.id, student_id: e.student_id, org: e.org, role: e.role,
        duration: e.duration, location: e.location ?? null,
        description: e.description, key_contributions: e.key_contributions ?? null,
      })),
      achievements: (p.achievements ?? []).map((a: any) => ({
        id: a.id, student_id: a.student_id, title: a.title,
        description: a.description, date: a.date ?? null, issuing_body: a.issuing_body ?? null,
      })),
      extracurriculars: (p.extracurriculars ?? []).map((ex: any) => ({
        id: ex.id, student_id: ex.student_id, activity: ex.activity, role: ex.role,
        organization: ex.organization ?? null, duration: ex.duration ?? null, description: ex.description ?? null,
      })),
      visibilities: (p.visibilities ?? []).map((v: any) => ({
        id: v.id, student_id: v.student_id, section_name: v.section_name, is_public: v.is_public,
      })),
    };
  }

  async findUserByRegisterNumber(regNo: string): Promise<User | null> {
    if (!regNo) return null;
    const norm = regNo.trim().toUpperCase();
    const u = await prisma.user.findFirst({
      where: { register_number: { equals: norm, mode: 'insensitive' } },
    });
    return u ? this.mapUser(u) : null;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    if (!email) return null;
    const norm = email.trim().toLowerCase();
    const u = await prisma.user.findFirst({
      where: { college_email: { equals: norm, mode: 'insensitive' } },
    });
    return u ? this.mapUser(u) : null;
  }

  async createUser(data: { register_number: string; college_email: string; full_name: string; password_hash: string; role?: 'STUDENT' | 'TPO_ADMIN' | 'COLLEGE_ADMIN' }): Promise<{ user: User; verificationToken: string }> {
    const token = crypto.randomBytes(24).toString('hex');
    const sections = ['personal','education','skills','projects','certifications','experience','achievements','extracurricular','cgpa','address','phone'];

    const u = await prisma.user.create({
      data: {
        register_number: data.register_number.toUpperCase(),
        college_email: data.college_email.toLowerCase(),
        password_hash: data.password_hash,
        role: (data.role || 'STUDENT') as any,
        email_verified: false,
        verification_token: token,
        student_profile: {
          create: {
            full_name: data.full_name,
            register_number: data.register_number.toUpperCase(),
            department: 'Computer Science',
            year_or_batch: '2024-2028',
            visibilities: {
              create: sections.map((s) => ({ section_name: s, is_public: false })),
            },
          },
        },
      },
    });
    return { user: this.mapUser(u), verificationToken: token };
  }

  async verifyEmailToken(token: string): Promise<User | null> {
    const u = await prisma.user.findFirst({ where: { verification_token: token } });
    if (!u) return null;
    const updated = await prisma.user.update({ where: { id: u.id }, data: { email_verified: true, verification_token: null } });
    return this.mapUser(updated);
  }

  async verifyUserByRegisterNumber(regNo: string): Promise<User | null> {
    const u = await prisma.user.findUnique({ where: { register_number: regNo.trim().toUpperCase() } });
    if (!u) return null;
    const updated = await prisma.user.update({ where: { id: u.id }, data: { email_verified: true, verification_token: null } });
    return this.mapUser(updated);
  }

  async createPasswordResetToken(collegeEmail: string): Promise<string | null> {
    const u = await prisma.user.findUnique({ where: { college_email: collegeEmail.toLowerCase() } });
    if (!u) return null;
    const resetToken = crypto.randomBytes(24).toString('hex');
    await prisma.user.update({ where: { id: u.id }, data: { reset_token: resetToken } });
    return resetToken;
  }

  async resetPasswordWithToken(token: string, newPasswordHash: string): Promise<boolean> {
    const u = await prisma.user.findFirst({ where: { reset_token: token } });
    if (!u) return false;
    await prisma.user.update({ where: { id: u.id }, data: { password_hash: newPasswordHash, reset_token: null } });
    return true;
  }

  async getStudentProfileByUserId(userId: string, registerNumber?: string): Promise<StudentProfile | null> {
    let p = await prisma.studentProfile.findUnique({
      where: { user_id: userId },
      include: { education: true, semester_cgpas: { orderBy: { semester_number: 'asc' } }, student_skills: { include: { skill: true } }, projects: { orderBy: { created_at: 'asc' } }, certifications: true, experiences: true, achievements: true, extracurriculars: true, visibilities: true },
    });

    if (!p && registerNumber) {
      p = await prisma.studentProfile.findFirst({
        where: { register_number: registerNumber.trim().toUpperCase() },
        include: { education: true, semester_cgpas: { orderBy: { semester_number: 'asc' } }, student_skills: { include: { skill: true } }, projects: { orderBy: { created_at: 'asc' } }, certifications: true, experiences: true, achievements: true, extracurriculars: true, visibilities: true },
      });
    }

    if (!p) {
      let u = await prisma.user.findUnique({ where: { id: userId } });
      if (!u && registerNumber) {
        u = await prisma.user.findUnique({ where: { register_number: registerNumber.trim().toUpperCase() } });
      }

      if (!u) {
        const regUpper = (registerNumber || userId).trim().toUpperCase();
        const passHash = await bcrypt.hash('Student@123', 10);
        try {
          u = await prisma.user.create({
            data: {
              register_number: regUpper,
              college_email: `${regUpper.toLowerCase()}@college.edu`,
              password_hash: passHash,
              role: 'STUDENT',
              email_verified: true,
            },
          });
        } catch {
          u = await prisma.user.findUnique({ where: { register_number: regUpper } });
        }
      }

      if (!u) return null;

      const sections = ['personal','education','skills','projects','certifications','experience','achievements','extracurricular','cgpa','address','phone'];
      p = await prisma.studentProfile.create({
        data: {
          user_id: u.id,
          full_name: u.college_email ? u.college_email.split('@')[0] : u.register_number,
          register_number: u.register_number,
          department: 'Computer Science',
          year_or_batch: '2024-2028',
          visibilities: {
            create: sections.map((s) => ({ section_name: s, is_public: false })),
          },
        },
        include: { education: true, semester_cgpas: { orderBy: { semester_number: 'asc' } }, student_skills: { include: { skill: true } }, projects: { orderBy: { created_at: 'asc' } }, certifications: true, experiences: true, achievements: true, extracurriculars: true, visibilities: true },
      });
    }

    return this.mapProfile(p);
  }

  async updatePersonalContact(userId: string, data: Partial<StudentProfile>): Promise<StudentProfile> {
    const profile = await this.getStudentProfileByUserId(userId);
    if (!profile) throw new Error('Student profile not found');
    await prisma.studentProfile.update({
      where: { id: profile.id },
      data: {
        full_name: data.full_name, department: data.department, year_or_batch: data.year_or_batch,
        cgpa_overall: data.cgpa_overall !== undefined ? Number(data.cgpa_overall) || null : undefined,
        phone: data.phone || null, personal_email: data.personal_email || null,
        linkedin_url: data.linkedin_url || null, github_url: data.github_url || null,
        personal_website_url: data.personal_website_url || null,
        address: data.address || null, profile_photo_url: data.profile_photo_url || null,
        bio: data.bio || null,
      },
    });
    return (await this.getStudentProfileByUserId(profile.user_id, profile.register_number))!;
  }

  async updateEducation(userId: string, data: Partial<Omit<Education, 'id' | 'student_id'>>): Promise<Education> {
    const profile = await this.getStudentProfileByUserId(userId);
    if (!profile) throw new Error('Student profile not found');
    const edu = await prisma.education.upsert({
      where: { student_id: profile.id },
      create: { student_id: profile.id, ...data, tenth_percentage: Number(data.tenth_percentage), expected_graduation_year: Number(data.expected_graduation_year) },
      update: { ...data, tenth_percentage: Number(data.tenth_percentage), expected_graduation_year: Number(data.expected_graduation_year) },
    });
    return { id: edu.id, student_id: edu.student_id, tenth_percentage: edu.tenth_percentage, tenth_board: edu.tenth_board, twelfth_percentage_or_diploma_details: edu.twelfth_percentage_or_diploma_details, twelfth_board: edu.twelfth_board, current_degree: edu.current_degree, specialization: edu.specialization, expected_graduation_year: edu.expected_graduation_year };
  }

  async updateSemesterCGPAs(
    userId: string,
    semesters: Partial<Omit<SemesterCGPA, 'id' | 'student_id'>>[]
  ): Promise<SemesterCGPA[]> {
    const profile = await this.getStudentProfileByUserId(userId);
    if (!profile) throw new Error('Student profile not found');
    await prisma.semesterCGPA.deleteMany({ where: { student_id: profile.id } });
    const created = await prisma.semesterCGPA.createMany({ data: semesters.map((s) => ({ student_id: profile.id, semester_number: Number(s.semester_number), cgpa: Number(s.cgpa) })) });
    const items = await prisma.semesterCGPA.findMany({ where: { student_id: profile.id } });
    return items.map((s) => ({ id: s.id, student_id: s.student_id, semester_number: s.semester_number, cgpa: s.cgpa }));
  }

  async getAllSkills(): Promise<Skill[]> {
    const skills = await prisma.skill.findMany({ orderBy: { name: 'asc' } });
    return skills.map((s) => ({ id: s.id, name: s.name, category: s.category as any }));
  }

  async addOrGetSkill(name: string, category: Skill['category']): Promise<Skill> {
    const s = await prisma.skill.upsert({ where: { name: name.trim() }, create: { name: name.trim(), category: category as any }, update: {} });
    return { id: s.id, name: s.name, category: s.category as any };
  }

  async updateStudentSkills(userId: string, skillInputs: { name?: string; category?: Skill['category']; proficiency?: StudentSkill['proficiency'] }[]): Promise<StudentSkill[]> {
    const profile = await this.getStudentProfileByUserId(userId);
    if (!profile) throw new Error('Student profile not found');
    await prisma.studentSkill.deleteMany({ where: { student_id: profile.id } });
    const results: StudentSkill[] = [];
    for (const item of skillInputs) {
      if (!item.name || !item.category || !item.proficiency) continue;
      const skill = await this.addOrGetSkill(item.name, item.category);
      const ss = await prisma.studentSkill.create({ data: { student_id: profile.id, skill_id: skill.id, proficiency: item.proficiency as any }, include: { skill: true } });
      results.push({ id: ss.id, student_id: ss.student_id, skill_id: ss.skill_id, skill: { id: ss.skill.id, name: ss.skill.name, category: ss.skill.category as any }, proficiency: ss.proficiency as any });
    }
    return results;
  }

  async updateProjects(userId: string, projectInputs: Partial<Omit<Project, 'student_id'>>[]): Promise<Project[]> {
    const profile = await this.getStudentProfileByUserId(userId);
    if (!profile) throw new Error('Student profile not found');
    await prisma.project.deleteMany({ where: { student_id: profile.id } });
    const results: Project[] = [];
    for (const p of projectInputs) {
      if (!p.title || !p.description || !p.role) continue;
      const techStack = Array.isArray(p.tech_stack) ? (p.tech_stack as string[]).join(', ') : String(p.tech_stack || '');
      const proj = await prisma.project.create({
        data: {
          student_id: profile.id, title: p.title, description: p.description, role: p.role,
          tech_stack: techStack, github_url: p.github_url || null, live_url: p.live_url || null,
          duration: p.duration || null, team_size: p.team_size ? Number(p.team_size) : null,
          key_outcomes: p.key_outcomes || null,
        },
      });
      results.push({ id: proj.id, student_id: proj.student_id, title: proj.title, description: proj.description, role: proj.role, tech_stack: techStack.split(',').map((t: string) => t.trim()).filter(Boolean), github_url: proj.github_url ?? null, live_url: proj.live_url ?? null, duration: proj.duration ?? null, team_size: proj.team_size ?? null, key_outcomes: proj.key_outcomes ?? null, ai_score: null, ai_suggestions: null, created_at: proj.created_at.toISOString() });
    }
    return results;
  }

  async updateCertifications(userId: string, certInputs: Partial<Omit<Certification, 'student_id'>>[]): Promise<Certification[]> {
    const profile = await this.getStudentProfileByUserId(userId);
    if (!profile) throw new Error('Student profile not found');
    await prisma.certification.deleteMany({ where: { student_id: profile.id } });
    const results: Certification[] = [];
    for (const c of certInputs) {
      if (!c.name || !c.issuer || !c.date) continue;
      const cert = await prisma.certification.create({ data: { student_id: profile.id, name: c.name, issuer: c.issuer, date: c.date, credential_id: c.credential_id || null, credential_url: c.credential_url || null, expiry_date: c.expiry_date || null } });
      results.push({ id: cert.id, student_id: cert.student_id, name: cert.name, issuer: cert.issuer, date: cert.date, credential_id: cert.credential_id ?? null, credential_url: cert.credential_url ?? null, expiry_date: cert.expiry_date ?? null });
    }
    return results;
  }

  async updateExperiences(userId: string, expInputs: Partial<Omit<Experience, 'student_id'>>[]): Promise<Experience[]> {
    const profile = await this.getStudentProfileByUserId(userId);
    if (!profile) throw new Error('Student profile not found');
    await prisma.experience.deleteMany({ where: { student_id: profile.id } });
    const results: Experience[] = [];
    for (const e of expInputs) {
      if (!e.org || !e.role || !e.duration || !e.description) continue;
      const exp = await prisma.experience.create({ data: { student_id: profile.id, org: e.org, role: e.role, duration: e.duration, location: e.location || null, description: e.description, key_contributions: e.key_contributions || null } });
      results.push({ id: exp.id, student_id: exp.student_id, org: exp.org, role: exp.role, duration: exp.duration, location: exp.location ?? null, description: exp.description, key_contributions: exp.key_contributions ?? null });
    }
    return results;
  }

  async updateAchievements(userId: string, achInputs: Partial<Omit<Achievement, 'student_id'>>[]): Promise<Achievement[]> {
    const profile = await this.getStudentProfileByUserId(userId);
    if (!profile) throw new Error('Student profile not found');
    await prisma.achievement.deleteMany({ where: { student_id: profile.id } });
    const results: Achievement[] = [];
    for (const a of achInputs) {
      if (!a.title || !a.description) continue;
      const ach = await prisma.achievement.create({ data: { student_id: profile.id, title: a.title, description: a.description, date: a.date || null, issuing_body: a.issuing_body || null } });
      results.push({ id: ach.id, student_id: ach.student_id, title: ach.title, description: ach.description, date: ach.date ?? null, issuing_body: ach.issuing_body ?? null });
    }
    return results;
  }

  async updateExtracurriculars(userId: string, extraInputs: Omit<Extracurricular, 'student_id'>[]): Promise<Extracurricular[]> {
    const profile = await this.getStudentProfileByUserId(userId);
    if (!profile) throw new Error('Student profile not found');
    await prisma.extracurricular.deleteMany({ where: { student_id: profile.id } });
    const results: Extracurricular[] = [];
    for (const ex of extraInputs) {
      const ext = await prisma.extracurricular.create({ data: { student_id: profile.id, activity: ex.activity, role: ex.role, organization: ex.organization || null, duration: ex.duration || null, description: ex.description || null } });
      results.push({ id: ext.id, student_id: ext.student_id, activity: ext.activity, role: ext.role, organization: ext.organization ?? null, duration: ext.duration ?? null, description: ext.description ?? null });
    }
    return results;
  }

  async updateVisibility(userId: string, section_name: string, is_public: boolean): Promise<ProfileVisibility> {
    const profile = await this.getStudentProfileByUserId(userId);
    if (!profile) throw new Error('Student profile not found');
    const vis = await prisma.profileVisibility.upsert({
      where: { student_id_section_name: { student_id: profile.id, section_name } },
      create: { student_id: profile.id, section_name, is_public },
      update: { is_public },
    });
    return { id: vis.id, student_id: vis.student_id, section_name: vis.section_name, is_public: vis.is_public };
  }
}

// ─────────────────────────────────────────────────────────
// UNIFIED EXPORT — Auto-selects based on DATABASE_URL env
// Uses global singleton pattern so Next.js hot reloads don't
// destroy the in-memory store during development.
// ─────────────────────────────────────────────────────────
const g = global as any;

if (!g.__inMemoryStore) {
  g.__inMemoryStore = new InMemoryStore();
}
if (!g.__prismaStore) {
  g.__prismaStore = new PrismaDBStore();
}

const inMemoryStore: InMemoryStore = g.__inMemoryStore;
const prismaStore: PrismaDBStore = g.__prismaStore;

export const db = USE_DATABASE ? prismaStore : inMemoryStore;