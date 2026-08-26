import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/store';
import { analyzeProjectQuality } from '@/lib/ai-service';

export async function POST(req: Request) {
  try {
    const session = await requireAuth(['STUDENT']);
    const body = await req.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json({ success: false, error: 'Project ID is required' }, { status: 400 });
    }

    const profile = await db.getStudentProfileByUserId(session.userId, session.registerNumber);
    if (!profile) {
      return NextResponse.json({ success: false, error: 'Student profile not found' }, { status: 404 });
    }

    const project = (profile.projects || []).find((p: any) => p.id === projectId);
    if (!project) {
      return NextResponse.json({ success: false, error: `Project '${projectId}' not found on profile` }, { status: 404 });
    }

    // Run Decoupled AI / Fallback Analysis
    const analysis = await analyzeProjectQuality(project);

    // Save AI Feedback directly to entity attributes
    const updatedProjects = (profile.projects || []).map((p: any) => {
      if (p.id === projectId) {
        return {
          ...p,
          ai_score: analysis.score,
          ai_suggestions: JSON.stringify(analysis.suggestions),
        };
      }
      return p;
    });

    await db.updateProjects(session.userId, updatedProjects as any);

    return NextResponse.json({
      success: true,
      projectId,
      analysis,
      message: 'Project quality analyzed and persisted to database entity.',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
