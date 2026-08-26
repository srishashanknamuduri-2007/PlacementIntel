import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/store';
import { matchJobDescription } from '@/lib/ai-service';

export async function POST(req: Request) {
  try {
    const session = await requireAuth(['STUDENT', 'TPO_ADMIN']);
    const body = await req.json();
    const { jd_text } = body;

    if (!jd_text || typeof jd_text !== 'string' || !jd_text.trim()) {
      return NextResponse.json({ success: false, error: 'Job description text is required' }, { status: 400 });
    }

    const profile = await db.getStudentProfileByUserId(session.userId, session.registerNumber);
    if (!profile) {
      return NextResponse.json({ success: false, error: 'Student profile not found' }, { status: 404 });
    }

    const matchResult = await matchJobDescription(profile, jd_text);

    return NextResponse.json({
      success: true,
      jdMatch: matchResult,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
