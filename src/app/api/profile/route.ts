import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/store';
import { calculateCompleteness } from '@/lib/completeness';
import {
  PersonalContactSchema,
  EducationSchema,
  SemesterCGPASchema,
  SkillSchema,
  ProjectSchema,
  CertificationSchema,
  ExperienceSchema,
  AchievementSchema,
  ExtracurricularSchema,
} from '@/lib/validation';
import { z } from 'zod';

export async function GET() {
  try {
    const session = await requireAuth(['STUDENT', 'TPO_ADMIN', 'COLLEGE_ADMIN']);
    const profile = await db.getStudentProfileByUserId(session.userId, session.registerNumber);

    if (!profile) {
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
    }

    const completeness = calculateCompleteness(profile);

    return NextResponse.json({
      success: true,
      profile,
      completeness,
    });
  } catch (err: any) {
    const status = err.message.startsWith('UNAUTHORIZED')
      ? 401
      : err.message.startsWith('EMAIL_NOT_VERIFIED')
      ? 403
      : 500;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await requireAuth(['STUDENT']);
    const body = await req.json();
    const { section, data } = body;

    if (!section || !data) {
      return NextResponse.json({ success: false, error: 'Section and data payload required' }, { status: 400 });
    }

    let resultMessage = 'Profile updated successfully';

    switch (section) {
      case 'personal': {
        const parsed = PersonalContactSchema.safeParse(data);
        if (!parsed.success) {
          return NextResponse.json({ success: false, error: 'Validation failed for Personal Contact section', details: parsed.error.format() }, { status: 400 });
        }
        await db.updatePersonalContact(session.userId, parsed.data);
        break;
      }
      case 'education': {
        const parsedEdu = EducationSchema.safeParse(data.education);
        if (!parsedEdu.success) {
          return NextResponse.json({ success: false, error: 'Validation failed for Education details', details: parsedEdu.error.format() }, { status: 400 });
        }
        await db.updateEducation(session.userId, parsedEdu.data);

        if (Array.isArray(data.semester_cgpas)) {
          const parsedSems = z.array(SemesterCGPASchema).safeParse(data.semester_cgpas);
          if (!parsedSems.success) {
            return NextResponse.json({ success: false, error: 'Validation failed for Semester CGPAs', details: parsedSems.error.format() }, { status: 400 });
          }
          await db.updateSemesterCGPAs(session.userId, parsedSems.data);
        }
        break;
      }
      case 'skills': {
        if (!Array.isArray(data)) {
          return NextResponse.json({ success: false, error: 'Skills payload must be an array' }, { status: 400 });
        }
        const parsedSkills = z.array(SkillSchema).safeParse(data);
        if (!parsedSkills.success) {
          return NextResponse.json({ success: false, error: 'Validation failed for Skills', details: parsedSkills.error.format() }, { status: 400 });
        }
        await db.updateStudentSkills(session.userId, parsedSkills.data);
        break;
      }
      case 'projects': {
        if (!Array.isArray(data)) {
          return NextResponse.json({ success: false, error: 'Projects payload must be an array' }, { status: 400 });
        }
        const parsedProjects = z.array(ProjectSchema).safeParse(data);
        if (!parsedProjects.success) {
          return NextResponse.json({ success: false, error: 'Validation failed for Projects', details: parsedProjects.error.format() }, { status: 400 });
        }
        await db.updateProjects(session.userId, parsedProjects.data as any);
        break;
      }
      case 'certifications': {
        if (!Array.isArray(data)) {
          return NextResponse.json({ success: false, error: 'Certifications payload must be an array' }, { status: 400 });
        }
        const parsedCerts = z.array(CertificationSchema).safeParse(data);
        if (!parsedCerts.success) {
          return NextResponse.json({ success: false, error: 'Validation failed for Certifications', details: parsedCerts.error.format() }, { status: 400 });
        }
        await db.updateCertifications(session.userId, parsedCerts.data as any);
        break;
      }
      case 'experiences': {
        if (!Array.isArray(data)) {
          return NextResponse.json({ success: false, error: 'Experiences payload must be an array' }, { status: 400 });
        }
        const parsedExps = z.array(ExperienceSchema).safeParse(data);
        if (!parsedExps.success) {
          return NextResponse.json({ success: false, error: 'Validation failed for Experiences', details: parsedExps.error.format() }, { status: 400 });
        }
        await db.updateExperiences(session.userId, parsedExps.data as any);
        break;
      }
      case 'achievements': {
        if (!Array.isArray(data)) {
          return NextResponse.json({ success: false, error: 'Achievements payload must be an array' }, { status: 400 });
        }
        const parsedAchs = z.array(AchievementSchema).safeParse(data);
        if (!parsedAchs.success) {
          return NextResponse.json({ success: false, error: 'Validation failed for Achievements', details: parsedAchs.error.format() }, { status: 400 });
        }
        await db.updateAchievements(session.userId, parsedAchs.data as any);
        break;
      }
      case 'extracurriculars': {
        if (!Array.isArray(data)) {
          return NextResponse.json({ success: false, error: 'Extracurriculars payload must be an array' }, { status: 400 });
        }
        const parsedExtras = z.array(ExtracurricularSchema).safeParse(data);
        if (!parsedExtras.success) {
          return NextResponse.json({ success: false, error: 'Validation failed for Extracurriculars', details: parsedExtras.error.format() }, { status: 400 });
        }
        await db.updateExtracurriculars(session.userId, parsedExtras.data as any);
        break;
      }
      default:
        return NextResponse.json({ success: false, error: `Unknown section type '${section}'` }, { status: 400 });
    }

    const updatedProfile = await db.getStudentProfileByUserId(session.userId, session.registerNumber);
    const completeness = calculateCompleteness(updatedProfile);

    return NextResponse.json({
      success: true,
      message: resultMessage,
      profile: updatedProfile,
      completeness,
    });
  } catch (err: any) {
    const status = err.message.startsWith('UNAUTHORIZED') ? 401 : 500;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}
