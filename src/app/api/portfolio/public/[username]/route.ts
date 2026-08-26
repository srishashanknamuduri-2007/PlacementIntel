import { NextResponse } from 'next/server';
import { getPublicStudentProfile } from '@/lib/portfolio';

export async function GET(req: Request, { params }: { params: { username: string } }) {
  try {
    const { username } = params;
    const publicProfile = await getPublicStudentProfile(username);

    if (!publicProfile) {
      return NextResponse.json({ success: false, error: 'Student public profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      profile: publicProfile,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
