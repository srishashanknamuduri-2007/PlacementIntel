import { NextResponse } from 'next/server';
import { runPhase1VerificationSuite } from '@/lib/test-phase1';
import { runPhase2VerificationSuite } from '@/lib/test-phase2';
import { runPhase3VerificationSuite } from '@/lib/test-phase3';
import { runPhase4VerificationSuite } from '@/lib/test-phase4';
import { runPhase5VerificationSuite } from '@/lib/test-phase5';

export async function GET() {
  try {
    const p1 = await runPhase1VerificationSuite();
    const p2 = await runPhase2VerificationSuite();
    const p3 = await runPhase3VerificationSuite();
    const p4 = await runPhase4VerificationSuite();
    const p5 = await runPhase5VerificationSuite();

    const allResults = [...p1, ...p2, ...p3, ...p4, ...p5];
    const allPassed = allResults.every((r) => r.status === 'PASS');

    return NextResponse.json({
      success: allPassed,
      totalCriteria: allResults.length,
      passedCriteria: allResults.filter((r) => r.status === 'PASS').length,
      failedCriteria: allResults.filter((r) => r.status === 'FAIL').length,
      checklist: allResults,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
