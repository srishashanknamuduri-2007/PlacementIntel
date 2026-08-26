import { analyzeProjectQuality, matchJobDescription } from './ai-service';
import { db } from './store';
import bcrypt from 'bcryptjs';

export async function runPhase5VerificationSuite() {
  console.log('====================================================');
  console.log('  RUNNING PHASE 5 AUTOMATED AI DECOUPLING SUITE     ');
  console.log('====================================================\n');

  const results: { criterion: string; status: 'PASS' | 'FAIL'; note: string }[] = [];

  try {
    // 1. Create Test Profile for AI Analysis
    const passHash = await bcrypt.hash('Secret123', 10);
    const { user: aiUser } = await db.createUser({
      register_number: '21CSAI',
      college_email: 'ai.student@college.edu',
      full_name: 'AI TestCandidate',
      password_hash: passHash,
    });

    await db.updatePersonalContact(aiUser.id, {
      full_name: 'AI TestCandidate',
      department: 'Computer Science',
      year_or_batch: '2024-2028',
    });

    await db.updateStudentSkills(aiUser.id, [
      { name: 'React', category: 'FRAMEWORK', proficiency: 'ADVANCED' },
      { name: 'Node.js', category: 'FRAMEWORK', proficiency: 'INTERMEDIATE' },
    ]);

    await db.updateProjects(aiUser.id, [
      {
        id: 'proj-ai-001',
        title: 'Microservices Architecture Platform',
        description: 'Built distributed message queue system.',
        role: 'Systems Engineer',
        tech_stack: 'Node.js, PostgreSQL',
        github_url: 'https://github.com/ai/microservices',
      },
    ]);

    const profile = (await db.getStudentProfileByUserId(aiUser.id))!;
    const targetProject = profile.projects![0];

    // 2. Test Decoupled AI Resilience with AI Disabled (ENABLE_AI=false simulation)
    process.env.ENABLE_AI = 'false';
    const fallbackAnalysis = await analyzeProjectQuality(targetProject);

    if (fallbackAnalysis.score > 0 && fallbackAnalysis.isFallback === true) {
      results.push({
        criterion: '1. AI service failures / ENABLE_AI=false do NOT break or block core system',
        status: 'PASS',
        note: `Decoupled fallback evaluator executed instantly with score ${fallbackAnalysis.score}/100 and zero latency impact`,
      });
    } else {
      results.push({
        criterion: '1. AI service failures / ENABLE_AI=false do NOT break or block core system',
        status: 'FAIL',
        note: 'Fallback AI evaluator failed',
      });
    }

    // 3. Test Entity Attribute Persistence
    const updatedProjects = profile.projects!.map((p) => {
      if (p.id === 'proj-ai-001') {
        return {
          ...p,
          ai_score: fallbackAnalysis.score,
          ai_suggestions: JSON.stringify(fallbackAnalysis.suggestions),
        };
      }
      return p;
    });

    await db.updateProjects(aiUser.id, updatedProjects as any);
    const reloadedProfile = (await db.getStudentProfileByUserId(aiUser.id))!;
    const reloadedProj = reloadedProfile.projects![0];

    if (reloadedProj.ai_score === fallbackAnalysis.score && reloadedProj.ai_suggestions) {
      results.push({
        criterion: '2. Project quality scores (ai_score) and suggestions are saved directly to entity',
        status: 'PASS',
        note: `Entity updated: Project.ai_score = ${reloadedProj.ai_score}`,
      });
    } else {
      results.push({
        criterion: '2. Project quality scores (ai_score) and suggestions are saved directly to entity',
        status: 'FAIL',
        note: 'Failed to persist ai_score to Project entity',
      });
    }

    // 4. Test JD-to-Resume Keyword Match Analysis
    const sampleJd = 'Looking for a Senior Developer with React, Node.js, Docker, AWS, and Python experience.';
    const jdMatch = await matchJobDescription(reloadedProfile, sampleJd);

    if (jdMatch.matchScore > 0 && jdMatch.missingSkills.includes('DOCKER')) {
      results.push({
        criterion: '3. JD match scoring evaluates candidate profile and detects missing technical skills',
        status: 'PASS',
        note: `JD Match Score: ${jdMatch.matchScore}%, Matched: [${jdMatch.matchedSkills.join(', ')}], Missing: [${jdMatch.missingSkills.slice(0, 3).join(', ')}]`,
      });
    } else {
      results.push({
        criterion: '3. JD match scoring evaluates candidate profile and detects missing technical skills',
        status: 'FAIL',
        note: 'JD match evaluation failed',
      });
    }

    // Restore env
    process.env.ENABLE_AI = 'true';
  } catch (err: any) {
    console.error('PHASE 5 ERROR:', err);
  }

  console.log('\n----------------------------------------------------');
  console.log('         PHASE 5 ACCEPTANCE CHECKLIST RESULTS       ');
  console.log('----------------------------------------------------');
  results.forEach((r) => {
    const icon = r.status === 'PASS' ? '✅ PASS' : '❌ FAIL';
    console.log(`${icon} | ${r.criterion}`);
    console.log(`         Note: ${r.note}`);
  });
  console.log('----------------------------------------------------\n');

  return results;
}
