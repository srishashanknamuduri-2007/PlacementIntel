import { StudentProfile, Project } from './types';

export interface ProjectAnalysisResult {
  score: number;
  suggestions: string[];
  strengths: string[];
  isFallback: boolean;
}

export interface JDMatchResult {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: string[];
  isFallback: boolean;
}

// ─────────────────────────────────────────────────────────
// Heuristic fallback (zero latency, works with ENABLE_AI=false)
// ─────────────────────────────────────────────────────────
function getFallbackAnalysis(project: Project): ProjectAnalysisResult {
  const suggestions: string[] = [];
  const strengths: string[] = [];
  let score = 60;

  if (project.title && project.title.length > 5) score += 5;
  if (project.description && project.description.length > 50) {
    score += 10; strengths.push('Detailed project description provided');
  } else {
    suggestions.push('Expand project description with technical architecture details.');
  }
  if (project.github_url) {
    score += 10; strengths.push('Public GitHub repository linked');
  } else {
    suggestions.push('Add a GitHub repository link for code visibility.');
  }
  if (project.live_url) {
    score += 10; strengths.push('Live deployed application available');
  } else {
    suggestions.push('Deploy the project live (Vercel/Render) and add a demo link.');
  }
  if (project.key_outcomes && project.key_outcomes.length > 10) {
    score += 10; strengths.push('Quantifiable outcomes specified');
  } else {
    suggestions.push('Add quantified metrics: "Reduced latency by 40%, 5k daily users".');
  }
  const techArr = Array.isArray(project.tech_stack)
    ? project.tech_stack
    : String(project.tech_stack || '').split(',').map((t) => t.trim()).filter(Boolean);
  if (techArr.length >= 3) {
    score += 5; strengths.push('Diverse tech stack demonstrated');
  }
  return { score: Math.min(100, score), suggestions, strengths, isFallback: true };
}

function getFallbackJdMatch(profile: StudentProfile, jdText: string): JDMatchResult {
  const textLower = jdText.toLowerCase();
  const profileSkills = (profile.student_skills || []).map((s: any) =>
    (s.skill?.name || s.name || '').toLowerCase()
  );
  const targetKeywords = [
    'python','java','javascript','typescript','react','next.js','node.js','express',
    'postgresql','sql','mongodb','docker','aws','git','c++','rest api','graphql',
    'html','css','tailwind','kubernetes','redis','fastapi','spring','django',
  ];
  const jdRequired = targetKeywords.filter((kw) => textLower.includes(kw));
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  jdRequired.forEach((kw) => {
    if (profileSkills.some((ps) => ps.includes(kw))) {
      matchedSkills.push(kw.toUpperCase());
    } else {
      missingSkills.push(kw.toUpperCase());
    }
  });

  const totalReq = jdRequired.length || 1;
  const matchScore = Math.min(100, Math.round((matchedSkills.length / totalReq) * 100));
  const recommendations: string[] = [];
  if (missingSkills.length > 0) {
    recommendations.push(`Add projects/skills for: ${missingSkills.slice(0, 4).join(', ')}.`);
    recommendations.push('Highlight existing transferable experience in your resume summary.');
  } else {
    recommendations.push('Strong skill match! Highlight key project outcomes in your ATS resume cover.');
  }

  return {
    matchScore: matchScore === 0 && matchedSkills.length === 0 ? 65 : matchScore,
    matchedSkills, missingSkills, recommendations, isFallback: true,
  };
}

// ─────────────────────────────────────────────────────────
// Live Gemini API call with 5s circuit breaker
// ─────────────────────────────────────────────────────────
async function callGemini(prompt: string, apiKey: string): Promise<string | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      }
    );
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

// ─────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────
export async function analyzeProjectQuality(project: Project): Promise<ProjectAnalysisResult> {
  const isAiEnabled = process.env.ENABLE_AI !== 'false';
  const apiKey = process.env.GEMINI_API_KEY;

  if (!isAiEnabled || !apiKey) return getFallbackAnalysis(project);

  const techStack = Array.isArray(project.tech_stack)
    ? (project.tech_stack as string[]).join(', ')
    : project.tech_stack;

  const prompt = `You are a technical recruiter evaluating a student project for placement readiness.

Analyze this project and return ONLY valid JSON (no markdown, no explanation):
{
  "score": <number 0-100>,
  "strengths": ["<strength 1>", "<strength 2>"],
  "suggestions": ["<actionable improvement 1>", "<actionable improvement 2>"]
}

Project Details:
Title: ${project.title}
Role: ${project.role}
Tech Stack: ${techStack}
Description: ${project.description}
Key Outcomes: ${project.key_outcomes || 'Not specified'}
Has GitHub: ${!!project.github_url}
Has Live Demo: ${!!project.live_url}`;

  try {
    const rawText = await callGemini(prompt, apiKey);
    if (!rawText) return getFallbackAnalysis(project);
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        score: Math.min(100, Math.max(0, Number(parsed.score) || 70)),
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
        isFallback: false,
      };
    }
    return getFallbackAnalysis(project);
  } catch {
    return getFallbackAnalysis(project);
  }
}

export async function matchJobDescription(profile: StudentProfile, jdText: string): Promise<JDMatchResult> {
  const isAiEnabled = process.env.ENABLE_AI !== 'false';
  const apiKey = process.env.GEMINI_API_KEY;

  if (!isAiEnabled || !apiKey || !jdText.trim()) return getFallbackJdMatch(profile, jdText);

  const profileSkills = (profile.student_skills || []).map((s: any) => s.skill?.name || s.name).join(', ');
  const projectTitles = (profile.projects || []).map((p) => p.title).join(', ');

  const prompt = `You are an ATS placement expert. Compare the student profile against the job description.

Return ONLY valid JSON (no markdown):
{
  "matchScore": <number 0-100>,
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["missing1", "missing2"],
  "recommendations": ["recommendation 1", "recommendation 2"]
}

Job Description:
${jdText.slice(0, 1500)}

Student Profile:
- Skills: ${profileSkills}
- Projects: ${projectTitles}
- Degree: ${profile.education?.current_degree || 'B.Tech'} in ${profile.education?.specialization || 'Computer Science'}
- CGPA: ${profile.cgpa_overall || 'N/A'}`;

  try {
    const rawText = await callGemini(prompt, apiKey);
    if (!rawText) return getFallbackJdMatch(profile, jdText);
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        matchScore: Math.min(100, Math.max(0, Number(parsed.matchScore) || 65)),
        matchedSkills: Array.isArray(parsed.matchedSkills) ? parsed.matchedSkills : [],
        missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
        isFallback: false,
      };
    }
    return getFallbackJdMatch(profile, jdText);
  } catch {
    return getFallbackJdMatch(profile, jdText);
  }
}
