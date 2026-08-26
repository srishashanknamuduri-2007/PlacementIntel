import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getFilteredStudents, getPlacementStats, PlacementFilterParams } from '@/lib/admin';

export async function GET(req: Request) {
  try {
    // RBAC: Block STUDENT role access
    const session = await requireAuth(['TPO_ADMIN', 'COLLEGE_ADMIN']);
    const { searchParams } = new URL(req.url);

    const params: PlacementFilterParams = {
      department: searchParams.get('dept') || undefined,
      skill: searchParams.get('skill') || undefined,
      certification: searchParams.get('cert') || undefined,
      minCgpa: searchParams.get('minCgpa') ? parseFloat(searchParams.get('minCgpa')!) : undefined,
      hasProjects: searchParams.get('hasProjects') === 'true',
      hasInternships: searchParams.get('hasInternships') === 'true',
      searchQuery: searchParams.get('q') || undefined,
    };

    const students = await getFilteredStudents(params);
    const stats = await getPlacementStats();

    return NextResponse.json({
      success: true,
      count: students.length,
      stats,
      students,
    });
  } catch (err: any) {
    const status = err.message.startsWith('UNAUTHORIZED')
      ? 401
      : err.message.startsWith('FORBIDDEN')
      ? 403
      : 500;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}
