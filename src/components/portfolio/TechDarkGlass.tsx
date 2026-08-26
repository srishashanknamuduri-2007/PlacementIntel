import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Github, Globe, ExternalLink, Award, GraduationCap, Briefcase, Code, Trophy, Sparkles, Terminal, BookOpen, Layers, CheckCircle2 } from 'lucide-react';

const techArr = (ts: any) =>
  Array.isArray(ts) ? ts : String(ts || '').split(',').map((s) => s.trim()).filter(Boolean);

export function TechGlass({ profile }: { profile: any }) {
  const skills = profile.student_skills || [];
  const projects = profile.projects || [];
  const certs = profile.certifications || [];
  const exps = profile.experiences || [];
  const achs = profile.achievements || [];
  const extras = profile.extracurriculars || [];
  const sems = profile.semester_cgpas || [];

  return (
    <div className="bg-[#090d16] text-slate-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-purple-600/20 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-cyan-600/15 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-10 relative z-10">
        {/* Header Hero Glass Card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-indigo-500/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-cyan-300 text-xs font-mono font-bold uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>{profile.department} • {profile.year_or_batch}</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                {profile.full_name || 'Engineering Student'}
              </h1>
              <p className="text-xs font-mono text-indigo-400 tracking-wider">REG NO: {profile.register_number}</p>
              {profile.bio && (
                <p className="text-slate-300 max-w-2xl text-sm sm:text-base leading-relaxed pt-1">
                  {profile.bio}
                </p>
              )}
            </div>

            {/* Quick Metrics Cards */}
            <div className="flex flex-wrap md:flex-col gap-3">
              {profile.cgpa_overall && (
                <div className="p-3.5 rounded-2xl bg-indigo-950/50 border border-indigo-500/30 text-center min-w-[110px] backdrop-blur-sm">
                  <div className="text-2xl font-black text-cyan-300">{Number(profile.cgpa_overall).toFixed(2)}</div>
                  <div className="text-[10px] font-mono text-indigo-300 uppercase tracking-widest">Overall CGPA</div>
                </div>
              )}
              {projects.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-purple-950/50 border border-purple-500/30 text-center min-w-[110px] backdrop-blur-sm">
                  <div className="text-2xl font-black text-purple-300">{projects.length}</div>
                  <div className="text-[10px] font-mono text-purple-300 uppercase tracking-widest">Projects</div>
                </div>
              )}
            </div>
          </div>

          {/* Social & Contact Bar */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-300">
              {profile.personal_email && (
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-cyan-400" />
                  <span>{profile.personal_email}</span>
                </div>
              )}
              {profile.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-cyan-400" />
                  <span>{profile.phone}</span>
                </div>
              )}
              {profile.address && (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span>{profile.address}</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {profile.github_url && (
                <a href={profile.github_url} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-indigo-900/50 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 transition">
                  <Github className="w-4 h-4" />
                </a>
              )}
              {profile.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-indigo-900/50 border border-slate-700 hover:border-blue-400 text-slate-300 hover:text-blue-300 transition">
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {profile.personal_website_url && (
                <a href={profile.personal_website_url} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-indigo-900/50 border border-slate-700 hover:border-purple-400 text-slate-300 hover:text-purple-300 transition">
                  <Globe className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Technical Skills Stack */}
        {skills.length > 0 && (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-800 space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" /> Technical Skills & Matrix
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {skills.map((sk: any, idx: number) => {
                const sName = sk.skill?.name || sk.name;
                const sCat = sk.skill?.category || sk.category || 'TECH';
                return (
                  <div key={idx} className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800 hover:border-cyan-500/50 transition group hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                    <div className="font-bold text-white text-sm group-hover:text-cyan-300 transition">{sName}</div>
                    <div className="flex items-center justify-between mt-1 text-[11px] font-mono">
                      <span className="text-slate-400">{sCat}</span>
                      <span className="text-indigo-400 font-semibold">{sk.proficiency}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Featured Projects */}
        {projects.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-purple-400 flex items-center gap-2">
              <Code className="w-4 h-4 text-purple-400" /> Featured Engineering Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((proj: any, idx: number) => {
                const stack = techArr(proj.tech_stack);
                return (
                  <div key={idx} className="p-6 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-800 hover:border-purple-500/40 transition space-y-4 flex flex-col justify-between group hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg text-white group-hover:text-purple-300 transition">{proj.title}</h3>
                        <div className="flex space-x-2">
                          {proj.github_url && (
                            <a href={proj.github_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-cyan-400 transition">
                              <Github className="w-4 h-4" />
                            </a>
                          )}
                          {proj.live_url && (
                            <a href={proj.live_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-purple-400 transition">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-purple-950/80 border border-purple-800/60 text-purple-300 text-[11px] font-mono font-semibold">
                          {proj.role}
                        </span>
                        {proj.duration && <span className="text-[11px] font-mono text-slate-400">{proj.duration}</span>}
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">{proj.description}</p>

                      {proj.key_outcomes && (
                        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-cyan-200">
                          <span className="font-bold text-cyan-400 font-mono block mb-0.5">Key Impact & Outcomes:</span>
                          {proj.key_outcomes}
                        </div>
                      )}
                    </div>

                    {stack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {stack.map((t: string, j: number) => (
                          <span key={j} className="px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-300 text-[10px] font-mono font-medium">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Education & Academic History */}
        {(profile.education || sems.length > 0) && (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-800 space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-400 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-400" /> Academic Background
            </h2>
            {profile.education && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800">
                  <div className="font-bold text-white text-base">
                    {profile.education.current_degree} in {profile.education.specialization}
                  </div>
                  <div className="text-xs text-indigo-400 font-mono mt-1">Expected Graduation: {profile.education.expected_graduation_year}</div>
                </div>
                <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-1 text-xs text-slate-300 font-mono">
                  <div>📗 10th: {profile.education.tenth_percentage}% ({profile.education.tenth_board})</div>
                  <div>📘 12th / Diploma: {profile.education.twelfth_percentage_or_diploma_details} ({profile.education.twelfth_board})</div>
                </div>
              </div>
            )}

            {sems.length > 0 && (
              <div className="pt-2">
                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">Semester CGPA Progress</div>
                <div className="flex flex-wrap gap-2.5">
                  {sems.sort((a: any, b: any) => a.semester_number - b.semester_number).map((s: any, idx: number) => (
                    <div key={idx} className="px-3.5 py-2 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-center min-w-[75px]">
                      <div className="text-sm font-black text-cyan-300">{Number(s.cgpa).toFixed(2)}</div>
                      <div className="text-[10px] font-mono text-slate-400">Sem {s.semester_number}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Work Experience */}
        {exps.length > 0 && (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-800 space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-400 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-400" /> Work & Industry Experience
            </h2>
            <div className="space-y-4">
              {exps.map((e: any, idx: number) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/40 transition space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="font-bold text-white text-base">{e.role}</div>
                    <span className="text-xs font-mono text-slate-400">{e.duration}</span>
                  </div>
                  <div className="text-xs font-mono text-emerald-400">{e.org} {e.location ? `• ${e.location}` : ''}</div>
                  <p className="text-xs text-slate-300 leading-relaxed">{e.description}</p>
                  {e.key_contributions && (
                    <div className="text-xs text-emerald-300 font-mono pt-1">
                      ✓ {e.key_contributions}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications & Achievements */}
        {(certs.length > 0 || achs.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certs.length > 0 && (
              <div className="p-6 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-800 space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-amber-400 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" /> Certifications
                </h2>
                <div className="space-y-3">
                  {certs.map((c: any, idx: number) => (
                    <div key={idx} className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white">{c.name}</div>
                        <div className="text-slate-400 font-mono mt-0.5">{c.issuer} • {c.date}</div>
                      </div>
                      {c.credential_url && (
                        <a href={c.credential_url} target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-cyan-300 font-mono text-[11px] underline">
                          Verify ↗
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {achs.length > 0 && (
              <div className="p-6 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-800 space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-yellow-400 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-400" /> Achievements & Honors
                </h2>
                <div className="space-y-3">
                  {achs.map((a: any, idx: number) => (
                    <div key={idx} className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-1 text-xs">
                      <div className="font-bold text-yellow-400">{a.title}</div>
                      {a.issuing_body && <div className="text-slate-400 font-mono text-[11px]">{a.issuing_body} {a.date ? `• ${a.date}` : ''}</div>}
                      <p className="text-slate-300">{a.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Extracurriculars */}
        {extras.length > 0 && (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-pink-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-pink-400" /> Extracurricular Activities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {extras.map((ex: any, idx: number) => (
                <div key={idx} className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-1 text-xs">
                  <div className="font-bold text-white text-sm">{ex.activity}</div>
                  <div className="text-pink-400 font-mono">{ex.role} {ex.organization ? `• ${ex.organization}` : ''}</div>
                  {ex.description && <p className="text-slate-300 pt-1">{ex.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-6 border-t border-slate-900 text-xs font-mono text-slate-600">
          Placement Intelligence Platform • Verified Student Profile • {profile.register_number}
        </div>
      </div>
    </div>
  );
}

export const TechDarkGlassTemplate = TechGlass;
