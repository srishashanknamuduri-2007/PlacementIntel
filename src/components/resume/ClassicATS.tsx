import React from 'react';
import { StudentProfile } from '@/lib/types';

const techArr = (ts: any) =>
  Array.isArray(ts) ? ts : String(ts || '').split(',').map((s) => s.trim()).filter(Boolean);

export function ClassicATSTemplate({ profile }: { profile: StudentProfile }) {
  const full_name = profile.full_name || 'STUDENT NAME';
  const regNo = profile.register_number || '';
  const dept = profile.department || '';
  const email = profile.user?.college_email || profile.personal_email || '';
  const phone = profile.phone || '';
  const github = profile.github_url || '';
  const linkedin = profile.linkedin_url || '';
  const website = profile.personal_website_url || '';
  const bio = profile.bio || '';
  const edu = profile.education;
  const sems = profile.semester_cgpas || [];
  const skills = profile.student_skills || [];
  const projects = profile.projects || [];
  const certs = profile.certifications || [];
  const exps = profile.experiences || [];
  const achs = profile.achievements || [];
  const extras = profile.extracurriculars || [];

  // Group skills by category
  const skillsByCategory: Record<string, string[]> = {};
  skills.forEach((s: any) => {
    const cat = s.skill?.category || s.category || 'TECHNICAL';
    const name = `${s.skill?.name || s.name} (${s.proficiency || 'Intermediate'})`;
    if (!skillsByCategory[cat]) skillsByCategory[cat] = [];
    skillsByCategory[cat].push(name);
  });

  return (
    <div className="bg-white text-slate-900 p-8 sm:p-12 shadow-2xl rounded-xl border border-slate-300 font-sans max-w-3xl mx-auto leading-relaxed text-sm">
      {/* ATS Header */}
      <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
        <h1 className="text-2xl font-black uppercase tracking-wider text-slate-950">{full_name}</h1>
        <div className="text-xs font-semibold text-slate-700">
          {dept} • {profile.year_or_batch} • Reg No: {regNo}
        </div>
        <div className="text-xs text-slate-700 flex flex-wrap items-center justify-center gap-2 pt-1 font-mono">
          {email && <span>Email: {email}</span>}
          {phone && <span>| Phone: {phone}</span>}
          {linkedin && <span>| LinkedIn: {linkedin}</span>}
          {github && <span>| GitHub: {github}</span>}
          {website && <span>| Portfolio: {website}</span>}
        </div>
      </div>

      {/* Summary */}
      {bio && (
        <div className="mt-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 mb-1.5">
            PROFESSIONAL SUMMARY
          </h2>
          <p className="text-xs text-slate-800 leading-normal">{bio}</p>
        </div>
      )}

      {/* Education */}
      {(edu || sems.length > 0) && (
        <div className="mt-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 mb-2">
            EDUCATION
          </h2>
          {edu && (
            <div className="space-y-1">
              <div className="flex justify-between font-bold text-xs text-slate-950">
                <span>{edu.current_degree} in {edu.specialization}</span>
                <span>Expected: {edu.expected_graduation_year}</span>
              </div>
              <div className="text-xs text-slate-700">
                12th / Diploma: {edu.twelfth_percentage_or_diploma_details} ({edu.twelfth_board}) • 10th: {edu.tenth_percentage}% ({edu.tenth_board})
                {profile.cgpa_overall ? ` • Cumulative CGPA: ${Number(profile.cgpa_overall).toFixed(2)} / 10.0` : ''}
              </div>
            </div>
          )}
          {sems.length > 0 && (
            <div className="text-xs text-slate-700 mt-1 font-mono">
              <span className="font-bold">Semester-wise CGPA: </span>
              {sems.sort((a: any, b: any) => a.semester_number - b.semester_number).map((s: any, idx: number) => (
                <span key={idx} className="mr-2">
                  S{s.semester_number}: {Number(s.cgpa).toFixed(2)}{idx < sems.length - 1 ? ',' : ''}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Technical Skills */}
      {skills.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 mb-1.5">
            TECHNICAL SKILLS & COMPETENCIES
          </h2>
          <div className="text-xs text-slate-800 space-y-1">
            {Object.entries(skillsByCategory).map(([cat, items]) => (
              <div key={cat}>
                <span className="font-bold uppercase text-[11px] text-slate-900">{cat}: </span>
                <span>{items.join(', ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Work Experience */}
      {exps.length > 0 && (
        <div className="mt-4 space-y-2.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5">
            WORK & INTERNSHIP EXPERIENCE
          </h2>
          {exps.map((e: any, idx: number) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between font-bold text-xs text-slate-950">
                <span>{e.role} — {e.org} {e.location ? `(${e.location})` : ''}</span>
                <span>{e.duration}</span>
              </div>
              <p className="text-xs text-slate-800">{e.description}</p>
              {e.key_contributions && (
                <p className="text-xs text-slate-700 italic">Key Contributions: {e.key_contributions}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Technical Projects */}
      {projects.length > 0 && (
        <div className="mt-4 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5">
            TECHNICAL PROJECTS
          </h2>
          {projects.map((p: any, idx: number) => {
            const stack = techArr(p.tech_stack);
            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between font-bold text-xs text-slate-950">
                  <span>
                    {p.title} | <span className="font-semibold text-slate-700">{p.role}</span>
                  </span>
                  <span>{p.duration || ''}</span>
                </div>
                {stack.length > 0 && (
                  <div className="text-[11px] text-slate-600 font-mono">
                    <span className="font-bold">Technologies: </span>
                    {stack.join(', ')}
                  </div>
                )}
                <p className="text-xs text-slate-800">{p.description}</p>
                {p.key_outcomes && (
                  <p className="text-xs text-slate-700 italic">Impact / Outcome: {p.key_outcomes}</p>
                )}
                <div className="flex gap-3 text-[11px] text-indigo-800 font-mono">
                  {p.github_url && <span>GitHub: {p.github_url}</span>}
                  {p.live_url && <span>Live: {p.live_url}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Certifications */}
      {certs.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 mb-1.5">
            CERTIFICATIONS & CREDENTIALS
          </h2>
          <ul className="list-disc list-inside text-xs text-slate-800 space-y-1">
            {certs.map((c: any, idx: number) => (
              <li key={idx}>
                <strong>{c.name}</strong> — {c.issuer} ({c.date})
                {c.credential_id && <span className="text-slate-600 font-mono"> [ID: {c.credential_id}]</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Achievements */}
      {achs.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 mb-1.5">
            HONORS & ACHIEVEMENTS
          </h2>
          <ul className="list-disc list-inside text-xs text-slate-800 space-y-1">
            {achs.map((a: any, idx: number) => (
              <li key={idx}>
                <strong>{a.title}</strong>
                {a.issuing_body ? ` — ${a.issuing_body}` : ''}
                {a.date ? ` (${a.date})` : ''}: {a.description}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Extracurriculars */}
      {extras.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 mb-1.5">
            LEADERSHIP & EXTRACURRICULAR ACTIVITIES
          </h2>
          <ul className="list-disc list-inside text-xs text-slate-800 space-y-1">
            {extras.map((ex: any, idx: number) => (
              <li key={idx}>
                <strong>{ex.activity}</strong> — {ex.role} {ex.organization ? `(${ex.organization})` : ''}
                {ex.duration ? ` [${ex.duration}]` : ''} {ex.description ? `— ${ex.description}` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
