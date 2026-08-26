import React from 'react';
import { StudentProfile } from '@/lib/types';

const techArr = (ts: any) =>
  Array.isArray(ts) ? ts : String(ts || '').split(',').map((s) => s.trim()).filter(Boolean);

export function CompactEngineeringTemplate({ profile }: { profile: StudentProfile }) {
  const full_name = profile.full_name || 'Student Name';
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

  return (
    <div className="bg-white text-slate-900 p-8 shadow-2xl rounded-xl border border-slate-300 font-sans max-w-3xl mx-auto space-y-4 text-xs">
      {/* Header */}
      <div className="border-b-2 border-indigo-950 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
          <h1 className="text-2xl font-black uppercase tracking-tight text-indigo-950">{full_name}</h1>
          <div className="font-mono text-xs text-indigo-900 font-bold">
            CGPA: {profile.cgpa_overall ? `${Number(profile.cgpa_overall).toFixed(2)}/10.0` : 'N/A'}
          </div>
        </div>
        <div className="font-mono text-[11px] text-slate-700 mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
          <span>{dept} ({profile.year_or_batch})</span>
          <span>• Reg: {regNo}</span>
          {email && <span>• {email}</span>}
          {phone && <span>• {phone}</span>}
          {linkedin && <span>• {linkedin}</span>}
          {github && <span>• {github}</span>}
        </div>
      </div>

      {/* Summary */}
      {bio && (
        <div>
          <h2 className="font-extrabold uppercase text-indigo-950 text-xs border-b border-indigo-200 pb-0.5 mb-1">
            Summary
          </h2>
          <p className="text-slate-800 leading-normal">{bio}</p>
        </div>
      )}

      {/* Education */}
      {(edu || sems.length > 0) && (
        <div>
          <h2 className="font-extrabold uppercase text-indigo-950 text-xs border-b border-indigo-200 pb-0.5 mb-1">
            Education
          </h2>
          {edu && (
            <div>
              <div className="flex justify-between font-bold text-slate-950">
                <span>{edu.current_degree} in {edu.specialization}</span>
                <span>Graduation: {edu.expected_graduation_year}</span>
              </div>
              <div className="text-[11px] text-slate-600">
                Senior Secondary (12th): {edu.twelfth_percentage_or_diploma_details} ({edu.twelfth_board}) • Secondary (10th): {edu.tenth_percentage}% ({edu.tenth_board})
              </div>
            </div>
          )}
          {sems.length > 0 && (
            <div className="text-[11px] text-slate-700 font-mono mt-0.5">
              Sem CGPAs: {sems.sort((a: any, b: any) => a.semester_number - b.semester_number).map((s: any) => `S${s.semester_number}: ${Number(s.cgpa).toFixed(2)}`).join(' | ')}
            </div>
          )}
        </div>
      )}

      {/* Technical Stack */}
      {skills.length > 0 && (
        <div>
          <h2 className="font-extrabold uppercase text-indigo-950 text-xs border-b border-indigo-200 pb-0.5 mb-1">
            Technical Stack
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((s: any, idx: number) => (
              <span key={idx} className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-950 text-[11px] font-mono font-semibold">
                {s.skill?.name || s.name} <span className="opacity-70 text-[10px]">({s.proficiency})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {exps.length > 0 && (
        <div className="space-y-1.5">
          <h2 className="font-extrabold uppercase text-indigo-950 text-xs border-b border-indigo-200 pb-0.5">
            Work Experience
          </h2>
          {exps.map((e: any, idx: number) => (
            <div key={idx} className="space-y-0.5">
              <div className="flex justify-between font-bold text-slate-900">
                <span>{e.role} — <span className="font-semibold text-indigo-900">{e.org}</span></span>
                <span className="font-mono text-[10px] text-slate-500">{e.duration}</span>
              </div>
              <p className="text-slate-800 text-[11px] leading-tight">{e.description}</p>
              {e.key_contributions && <p className="text-[10px] text-emerald-800 italic">Key: {e.key_contributions}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-extrabold uppercase text-indigo-950 text-xs border-b border-indigo-200 pb-0.5">
            Projects & Architecture
          </h2>
          {projects.map((p: any, idx: number) => {
            const stack = techArr(p.tech_stack);
            return (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{p.title} — <span className="font-normal italic text-slate-700">{p.role}</span></span>
                  <span className="font-mono text-[10px] text-slate-500">{p.duration}</span>
                </div>
                {stack.length > 0 && (
                  <div className="text-[10px] font-mono text-indigo-900">
                    Stack: {stack.join(', ')}
                  </div>
                )}
                <p className="text-slate-800 text-[11px] leading-tight">{p.description}</p>
                {p.key_outcomes && <p className="text-[10px] font-mono text-emerald-800">Impact: {p.key_outcomes}</p>}
              </div>
            );
          })}
        </div>
      )}

      {/* Certifications & Achievements */}
      {(certs.length > 0 || achs.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {certs.length > 0 && (
            <div>
              <h2 className="font-extrabold uppercase text-indigo-950 text-xs border-b border-indigo-200 pb-0.5 mb-1">
                Certifications
              </h2>
              <div className="space-y-1">
                {certs.map((c: any, idx: number) => (
                  <div key={idx} className="p-1 bg-slate-50 border border-slate-200 rounded text-[11px]">
                    <span className="font-bold block text-slate-900">{c.name}</span>
                    <span className="text-slate-600 text-[10px]">{c.issuer} ({c.date})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {achs.length > 0 && (
            <div>
              <h2 className="font-extrabold uppercase text-indigo-950 text-xs border-b border-indigo-200 pb-0.5 mb-1">
                Achievements
              </h2>
              <div className="space-y-1">
                {achs.map((a: any, idx: number) => (
                  <div key={idx} className="p-1 bg-slate-50 border border-slate-200 rounded text-[11px]">
                    <span className="font-bold block text-amber-900">{a.title}</span>
                    <span className="text-slate-600 text-[10px]">{a.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Extracurriculars */}
      {extras.length > 0 && (
        <div>
          <h2 className="font-extrabold uppercase text-indigo-950 text-xs border-b border-indigo-200 pb-0.5 mb-1">
            Activities
          </h2>
          <div className="flex flex-wrap gap-2 text-[11px] text-slate-700">
            {extras.map((ex: any, idx: number) => (
              <span key={idx}>
                <strong>{ex.activity}</strong> ({ex.role}){idx < extras.length - 1 ? ' • ' : ''}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
