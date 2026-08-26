import React from 'react';
import { StudentProfile } from '@/lib/types';

const techArr = (ts: any) =>
  Array.isArray(ts) ? ts : String(ts || '').split(',').map((s) => s.trim()).filter(Boolean);

export function ModernTwoColumnTemplate({ profile }: { profile: StudentProfile }) {
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
    <div className="bg-white text-slate-900 shadow-2xl rounded-xl border border-slate-200 font-sans max-w-3xl mx-auto overflow-hidden text-xs">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">{full_name}</h1>
            <p className="text-cyan-400 text-xs font-mono font-bold uppercase tracking-widest mt-1">
              {dept} • {profile.year_or_batch} • Reg: {regNo}
            </p>
          </div>
          {profile.cgpa_overall && (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 text-center">
              <div className="text-2xl font-black text-cyan-300">{Number(profile.cgpa_overall).toFixed(2)}</div>
              <div className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">Overall CGPA</div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 p-8 gap-8">
        {/* Left Sidebar */}
        <div className="md:col-span-1 border-r border-slate-200 pr-6 space-y-6">
          {/* Contact */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b pb-1">Contact</h3>
            {email && <div className="truncate text-slate-700 font-mono text-[11px]">{email}</div>}
            {phone && <div className="text-slate-700 font-mono text-[11px]">{phone}</div>}
            {linkedin && (
              <div className="truncate text-indigo-600 font-mono text-[11px]">
                <a href={linkedin} target="_blank" rel="noreferrer">LinkedIn Profile ↗</a>
              </div>
            )}
            {github && (
              <div className="truncate text-indigo-600 font-mono text-[11px]">
                <a href={github} target="_blank" rel="noreferrer">GitHub Profile ↗</a>
              </div>
            )}
            {website && (
              <div className="truncate text-indigo-600 font-mono text-[11px]">
                <a href={website} target="_blank" rel="noreferrer">Personal Website ↗</a>
              </div>
            )}
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b pb-1">Skills Stack</h3>
              <div className="space-y-1.5">
                {skills.map((s: any, idx: number) => (
                  <div key={idx} className="bg-slate-50 p-2 rounded border border-slate-200">
                    <div className="font-bold text-slate-900">{s.skill?.name || s.name}</div>
                    <div className="text-[10px] text-indigo-700 font-mono">{s.proficiency}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {certs.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b pb-1">Certifications</h3>
              <div className="space-y-1.5">
                {certs.map((c: any, idx: number) => (
                  <div key={idx} className="text-slate-800 bg-slate-50 p-1.5 rounded border border-slate-200">
                    <span className="font-bold block">{c.name}</span>
                    <span className="block text-[10px] text-slate-500">{c.issuer} ({c.date})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extracurriculars */}
          {extras.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b pb-1">Activities</h3>
              <div className="space-y-1 text-[11px] text-slate-700">
                {extras.map((ex: any, idx: number) => (
                  <div key={idx}>
                    <strong>{ex.activity}</strong> — {ex.role}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Main Column */}
        <div className="md:col-span-2 space-y-6">
          {bio && (
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b pb-1">Professional Summary</h3>
              <p className="text-slate-700 leading-relaxed">{bio}</p>
            </div>
          )}

          {(edu || sems.length > 0) && (
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b pb-1">Education</h3>
              {edu && (
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    {edu.current_degree} in {edu.specialization}
                  </div>
                  <div className="text-slate-600">Expected Graduation: {edu.expected_graduation_year}</div>
                  <div className="text-slate-600 text-[11px] mt-0.5">
                    12th / Diploma: {edu.twelfth_percentage_or_diploma_details} ({edu.twelfth_board}) • 10th: {edu.tenth_percentage}% ({edu.tenth_board})
                  </div>
                </div>
              )}
              {sems.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {sems.sort((a: any, b: any) => a.semester_number - b.semester_number).map((s: any, idx: number) => (
                    <span key={idx} className="px-2 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-[10px]">
                      Sem {s.semester_number}: {Number(s.cgpa).toFixed(2)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {exps.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b pb-1">Work Experience</h3>
              {exps.map((e: any, idx: number) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{e.role} — <span className="text-indigo-900">{e.org}</span></span>
                    <span className="font-mono text-[10px] text-slate-500">{e.duration}</span>
                  </div>
                  <p className="text-slate-700">{e.description}</p>
                  {e.key_contributions && <p className="text-[11px] text-emerald-800 italic">Key: {e.key_contributions}</p>}
                </div>
              ))}
            </div>
          )}

          {projects.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b pb-1">Technical Projects</h3>
              {projects.map((p: any, idx: number) => {
                const stack = techArr(p.tech_stack);
                return (
                  <div key={idx} className="space-y-1 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex justify-between items-baseline font-bold text-slate-900 text-sm">
                      <span>{p.title} <span className="font-normal text-xs text-indigo-700">({p.role})</span></span>
                      <span className="font-mono text-[10px] text-slate-500">{p.duration}</span>
                    </div>
                    <p className="text-slate-700">{p.description}</p>
                    {p.key_outcomes && <p className="text-[11px] text-emerald-800 font-mono">Outcome: {p.key_outcomes}</p>}
                    {stack.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {stack.map((t: string, j: number) => (
                          <span key={j} className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 text-[9px] font-mono">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {achs.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b pb-1">Achievements</h3>
              <div className="space-y-1">
                {achs.map((a: any, idx: number) => (
                  <div key={idx} className="text-slate-700">
                    <strong className="text-amber-900">{a.title}</strong>: {a.description}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
