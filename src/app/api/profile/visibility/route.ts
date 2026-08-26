import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/store';
import { ProfileVisibilitySchema } from '@/lib/validation';

export async function POST(req: Request) {
  try {
    const session = await requireAuth(['STUDENT']);
    const body = await req.json();
    const parsed = ProfileVisibilitySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Valid section_name and is_public boolean required' }, { status: 400 });
    }

    const { section_name, is_public } = parsed.data;
    const visibility = await db.updateVisibility(session.userId, section_name, is_public);

    return NextResponse.json({
      success: true,
      message: `Visibility for '${section_name}' updated to ${is_public ? 'Public' : 'Private'}`,
      visibility,
    });
  } catch (err: any) {
    const status = err.message.startsWith('UNAUTHORIZED') ? 401 : 500;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}
