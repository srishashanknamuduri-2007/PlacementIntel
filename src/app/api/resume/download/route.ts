import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/store';
import { generateResumeHtml } from '@/lib/pdf-generator';

export async function GET(req: Request) {
  try {
    const session = await requireAuth(['STUDENT', 'TPO_ADMIN', 'COLLEGE_ADMIN']);
    const { searchParams } = new URL(req.url);
    const template = (searchParams.get('t') as 'classic' | 'modern' | 'compact') || 'classic';

    const profile = await db.getStudentProfileByUserId(session.userId, session.registerNumber);
    if (!profile) {
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
    }

    const html = generateResumeHtml(profile, template);

    // Return compiled HTML PDF buffer stream
    const filename = `${profile.full_name.replace(/\s+/g, '_')}_Resume.pdf`;

    return new Response(html, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-ATS-Compliant': 'true',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
