import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // --- Demo Admin Account ---
  const adminHash = await bcrypt.hash('Admin@12345', 10);
  const adminUser = await prisma.user.upsert({
    where: { register_number: 'ADMIN001' },
    update: {},
    create: {
      register_number: 'ADMIN001',
      college_email: 'tpo@college.edu',
      password_hash: adminHash,
      role: 'TPO_ADMIN',
      email_verified: true,
    },
  });
  console.log('✅ Admin user seeded:', adminUser.register_number);

  // --- Demo Student Account ---
  const studentHash = await bcrypt.hash('Student@123', 10);
  const existingStudent = await prisma.user.findUnique({ where: { register_number: '21CS045' } });

  if (!existingStudent) {
    const sections = [
      'personal', 'education', 'skills', 'projects', 'certifications',
      'experience', 'achievements', 'extracurricular', 'cgpa', 'address', 'phone',
    ];

    const studentUser = await prisma.user.create({
      data: {
        register_number: '21CS045',
        college_email: 'alex.rivera@college.edu',
        password_hash: studentHash,
        role: 'STUDENT',
        email_verified: true,
        student_profile: {
          create: {
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
            bio: 'Passionate computer science engineer specializing in full-stack web applications and AI-driven platforms.',
            visibilities: {
              create: sections.map((s) => ({ section_name: s, is_public: true })),
            },
            education: {
              create: {
                tenth_percentage: 95.2,
                tenth_board: 'CBSE',
                twelfth_percentage_or_diploma_details: '96.4%',
                twelfth_board: 'CBSE',
                current_degree: 'B.Tech',
                specialization: 'Computer Science & Engineering',
                expected_graduation_year: 2028,
              },
            },
            semester_cgpas: {
              create: [
                { semester_number: 1, cgpa: 8.8 },
                { semester_number: 2, cgpa: 9.1 },
              ],
            },
            certifications: {
              create: [
                {
                  name: 'AWS Certified Solutions Architect',
                  issuer: 'Amazon Web Services',
                  date: '2024-05',
                  credential_id: 'AWS-998877',
                  credential_url: 'https://aws.amazon.com/verify',
                },
              ],
            },
            experiences: {
              create: [
                {
                  org: 'TechCorp Innovations',
                  role: 'Full Stack Developer Intern',
                  duration: 'May 2024 – July 2024',
                  location: 'Remote',
                  description: 'Built REST APIs and React dashboards for internal analytics tool.',
                  key_contributions: 'Reduced API response time by 40% through query optimizations.',
                },
              ],
            },
            achievements: {
              create: [
                {
                  title: 'Smart India Hackathon 2024 Winner',
                  description: 'Built an AI-powered disaster management system for NDRF in 36 hours.',
                  date: '2024-09',
                  issuing_body: 'Ministry of Education, India',
                },
              ],
            },
            projects: {
              create: [
                {
                  title: 'Placement Intelligence Platform',
                  description: 'Single structured profile platform generating ATS resumes, portfolios, and T&P analytics.',
                  role: 'Lead Architect',
                  tech_stack: 'Next.js, Tailwind, PostgreSQL, Prisma',
                  github_url: 'https://github.com/alexrivera/placement-intel',
                  live_url: 'https://placement-intel.vercel.app',
                  duration: '2 Months',
                  team_size: 1,
                  key_outcomes: 'Engineered multi-section profile manager with 100% field-level completeness engine and 3 ATS resume templates.',
                  ai_score: 92,
                },
              ],
            },
          },
        },
      },
    });

    // Add skills separately (upsert skill catalog first)
    const studentProfile = await prisma.studentProfile.findUnique({ where: { user_id: studentUser.id } });
    if (studentProfile) {
      const skillData = [
        { name: 'Python', category: 'LANGUAGE' as const, proficiency: 'ADVANCED' as const },
        { name: 'JavaScript', category: 'LANGUAGE' as const, proficiency: 'ADVANCED' as const },
        { name: 'TypeScript', category: 'LANGUAGE' as const, proficiency: 'INTERMEDIATE' as const },
        { name: 'React.js', category: 'FRAMEWORK' as const, proficiency: 'ADVANCED' as const },
        { name: 'Next.js', category: 'FRAMEWORK' as const, proficiency: 'ADVANCED' as const },
        { name: 'Node.js', category: 'FRAMEWORK' as const, proficiency: 'INTERMEDIATE' as const },
        { name: 'PostgreSQL', category: 'TOOL' as const, proficiency: 'INTERMEDIATE' as const },
        { name: 'Docker', category: 'TOOL' as const, proficiency: 'BEGINNER' as const },
        { name: 'Problem Solving', category: 'SOFT_SKILL' as const, proficiency: 'ADVANCED' as const },
      ];
      for (const sd of skillData) {
        const skill = await prisma.skill.upsert({ where: { name: sd.name }, create: { name: sd.name, category: sd.category }, update: {} });
        await prisma.studentSkill.upsert({
          where: { student_id_skill_id: { student_id: studentProfile.id, skill_id: skill.id } },
          create: { student_id: studentProfile.id, skill_id: skill.id, proficiency: sd.proficiency },
          update: { proficiency: sd.proficiency },
        });
      }
    }

    console.log('✅ Demo student seeded: 21CS045');
  } else {
    console.log('ℹ️  Demo student already exists, skipping seed.');
  }

  console.log('✅ Seed complete!');
}

main()
  .catch((e) => { console.error('❌ Seed error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
