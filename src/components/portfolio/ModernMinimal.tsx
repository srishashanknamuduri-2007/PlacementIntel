import React from 'react';

const techArr = (ts: any) =>
  Array.isArray(ts) ? ts : String(ts || '').split(',').map((s) => s.trim()).filter(Boolean);

const catColor: Record<string, string> = {
  LANGUAGE: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  FRAMEWORK: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
  TOOL: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  SOFT_SKILL: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">{title}</h2>
        <div className="flex-1 h-px bg-gradient-to-r from-indigo-500/40 to-transparent" />
      </div>
      {children}
    </div>
  );
}

export function ModernDark({ profile }: { profile: any }) {
  const skills = profile.student_skills || [];
  const projects = profile.projects || [];
  const certs = profile.certifications || [];
  const exps = profile.experiences || [];
  const achs = profile.achievements || [];
  const extras = profile.extracurriculars || [];
  const sems = profile.semester_cgpas || [];

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', background: '#0f172a', color: '#e2e8f0', minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 60%, #1e293b 100%)', padding: '3rem 2.5rem 2.5rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 900, background: 'linear-gradient(90deg,#818cf8,#c084fc,#f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                {profile.full_name || 'Your Name'}
              </h1>
              <p style={{ color: '#94a3b8', marginTop: '0.25rem', fontSize: '1rem' }}>
                {profile.department} &bull; {profile.year_or_batch}
              </p>
              {profile.bio && (
                <p style={{ color: '#cbd5e1', marginTop: '0.75rem', maxWidth: 600, lineHeight: 1.7, fontSize: '0.9rem' }}>{profile.bio}</p>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem' }}>
                {profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noreferrer" style={{ color: '#818cf8', fontSize: '0.8rem', textDecoration: 'none' }}>🔗 LinkedIn</a>}
                {profile.github_url && <a href={profile.github_url} target="_blank" rel="noreferrer" style={{ color: '#818cf8', fontSize: '0.8rem', textDecoration: 'none' }}>💻 GitHub</a>}
                {profile.personal_website_url && <a href={profile.personal_website_url} target="_blank" rel="noreferrer" style={{ color: '#818cf8', fontSize: '0.8rem', textDecoration: 'none' }}>🌐 Website</a>}
                {profile.personal_email && <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>✉️ {profile.personal_email}</span>}
                {profile.phone && <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>📞 {profile.phone}</span>}
              </div>
            </div>
            {/* Stat Cards */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {profile.cgpa_overall && (
                <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '0.75rem 1.25rem', textAlign: 'center', minWidth: 80 }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#818cf8' }}>{Number(profile.cgpa_overall).toFixed(2)}</div>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>CGPA</div>
                </div>
              )}
              {skills.length > 0 && (
                <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '0.75rem 1.25rem', textAlign: 'center', minWidth: 80 }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#c084fc' }}>{skills.length}</div>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Skills</div>
                </div>
              )}
              {projects.length > 0 && (
                <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '0.75rem 1.25rem', textAlign: 'center', minWidth: 80 }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f472b6' }}>{projects.length}</div>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Projects</div>
                </div>
              )}
              {exps.length > 0 && (
                <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '0.75rem 1.25rem', textAlign: 'center', minWidth: 80 }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#34d399' }}>{exps.length}</div>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Exp.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2.5rem 2.5rem' }}>
        {/* Skills */}
        {skills.length > 0 && (
          <Section title="Skills & Technologies">
            {['LANGUAGE', 'FRAMEWORK', 'TOOL', 'SOFT_SKILL'].map((cat) => {
              const catSkills = skills.filter((s: any) => s.skill?.category === cat);
              if (!catSkills.length) return null;
              const label = { LANGUAGE: '💻 Languages', FRAMEWORK: '⚡ Frameworks', TOOL: '🔧 Tools & Databases', SOFT_SKILL: '🤝 Soft Skills' }[cat];
              return (
                <div key={cat} style={{ marginBottom: '1rem' }}>
                  <p style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>{label}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {catSkills.map((s: any, i: number) => (
                      <span key={i} style={{ padding: '0.25rem 0.75rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600, background: cat === 'LANGUAGE' ? '#1e3a8a33' : cat === 'FRAMEWORK' ? '#6d28d933' : cat === 'TOOL' ? '#065f4633' : '#92400e33', color: cat === 'LANGUAGE' ? '#93c5fd' : cat === 'FRAMEWORK' ? '#c4b5fd' : cat === 'TOOL' ? '#6ee7b7' : '#fcd34d', border: '1px solid', borderColor: cat === 'LANGUAGE' ? '#1e3a8a55' : cat === 'FRAMEWORK' ? '#6d28d955' : cat === 'TOOL' ? '#065f4655' : '#92400e55' }}>
                        {s.skill?.name} <span style={{ opacity: 0.6, fontSize: '0.65rem' }}>· {s.proficiency}</span>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </Section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <Section title="Technical Projects">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(380px,1fr))', gap: '1rem' }}>
              {projects.map((p: any, i: number) => {
                const stack = techArr(p.tech_stack);
                return (
                  <div key={i} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 16, overflow: 'hidden' }}>
                    <div style={{ background: 'linear-gradient(90deg,#4f46e5,#7c3aed)', padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', margin: 0 }}>{p.title}</h3>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {p.github_url && <a href={p.github_url} target="_blank" rel="noreferrer" style={{ color: '#c7d2fe', fontSize: '0.7rem', textDecoration: 'none', background: '#ffffff22', padding: '0.15rem 0.5rem', borderRadius: 999 }}>GitHub</a>}
                          {p.live_url && <a href={p.live_url} target="_blank" rel="noreferrer" style={{ color: '#c7d2fe', fontSize: '0.7rem', textDecoration: 'none', background: '#ffffff22', padding: '0.15rem 0.5rem', borderRadius: 999 }}>Live ↗</a>}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#c7d2fe', background: '#ffffff15', padding: '0.1rem 0.4rem', borderRadius: 4 }}>{p.role}</span>
                    </div>
                    <div style={{ padding: '0.875rem 1rem' }}>
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.6, margin: '0 0 0.75rem' }}>{p.description}</p>
                      {p.key_outcomes && <p style={{ fontSize: '0.75rem', color: '#6ee7b7', marginBottom: '0.75rem' }}>✓ {p.key_outcomes}</p>}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {stack.map((t: string, j: number) => (
                          <span key={j} style={{ fontSize: '0.65rem', padding: '0.1rem 0.5rem', background: '#0f172a', border: '1px solid #334155', borderRadius: 999, color: '#94a3b8' }}>{t}</span>
                        ))}
                      </div>
                      {(p.duration || p.team_size) && (
                        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
                          {p.duration && <span style={{ fontSize: '0.65rem', color: '#475569' }}>⏱ {p.duration}</span>}
                          {p.team_size && <span style={{ fontSize: '0.65rem', color: '#475569' }}>👥 Team of {p.team_size}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* Education */}
        {(profile.education || sems.length > 0) && (
          <Section title="Education">
            {profile.education && (
              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: '1.25rem 1.5rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#e2e8f0', margin: 0 }}>{profile.education.current_degree} in {profile.education.specialization}</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>Expected Graduation: {profile.education.expected_graduation_year}</p>
                  </div>
                  {profile.cgpa_overall && (
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#818cf8' }}>{Number(profile.cgpa_overall).toFixed(2)}</span>
                      <p style={{ color: '#64748b', fontSize: '0.65rem', margin: 0 }}>Overall CGPA</p>
                    </div>
                  )}
                </div>
                <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                  <span>📗 10th: {profile.education.tenth_percentage}% — {profile.education.tenth_board}</span>
                  <span>📘 12th/Diploma: {profile.education.twelfth_percentage_or_diploma_details} — {profile.education.twelfth_board}</span>
                </div>
              </div>
            )}
            {sems.length > 0 && (
              <div>
                <p style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>Semester-wise CGPA</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {sems.sort((a: any, b: any) => a.semester_number - b.semester_number).map((s: any, i: number) => (
                    <div key={i} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 10, padding: '0.5rem 0.75rem', textAlign: 'center', minWidth: 60 }}>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#818cf8' }}>{Number(s.cgpa).toFixed(2)}</div>
                      <div style={{ fontSize: '0.6rem', color: '#475569' }}>Sem {s.semester_number}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Section>
        )}

        {/* Experience */}
        {exps.length > 0 && (
          <Section title="Work Experience">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {exps.map((e: any, i: number) => (
                <div key={i} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: '1.25rem 1.5rem', position: 'relative', borderLeft: '3px solid #818cf8' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.25rem' }}>
                    <div>
                      <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#e2e8f0', margin: 0 }}>{e.role}</h3>
                      <p style={{ color: '#818cf8', fontSize: '0.8rem', margin: '0.2rem 0 0' }}>{e.org}{e.location ? ` · ${e.location}` : ''}</p>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#0f172a', padding: '0.2rem 0.6rem', borderRadius: 999, border: '1px solid #334155', whiteSpace: 'nowrap' }}>{e.duration}</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '0.75rem', lineHeight: 1.65 }}>{e.description}</p>
                  {e.key_contributions && <p style={{ fontSize: '0.8rem', color: '#6ee7b7', marginTop: '0.5rem' }}>✓ {e.key_contributions}</p>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Certifications */}
        {certs.length > 0 && (
          <Section title="Certifications">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '0.75rem' }}>
              {certs.map((c: any, i: number) => (
                <div key={i} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>🏆</div>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '0.85rem', color: '#e2e8f0', margin: 0 }}>{c.name}</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>{c.issuer} · {c.date}</p>
                    {c.credential_id && <p style={{ color: '#64748b', fontSize: '0.65rem', marginTop: '0.2rem' }}>ID: {c.credential_id}</p>}
                    {c.credential_url && <a href={c.credential_url} target="_blank" rel="noreferrer" style={{ color: '#818cf8', fontSize: '0.7rem', textDecoration: 'none' }}>Verify ↗</a>}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Achievements */}
        {achs.length > 0 && (
          <Section title="Achievements">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {achs.map((a: any, i: number) => (
                <div key={i} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>🥇</span>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fbbf24', margin: 0 }}>{a.title}</h3>
                    {a.issuing_body && <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: '0.2rem 0' }}>{a.issuing_body}{a.date ? ` · ${a.date}` : ''}</p>}
                    <p style={{ color: '#94a3b8', fontSize: '0.8rem', lineHeight: 1.6 }}>{a.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Extracurriculars */}
        {extras.length > 0 && (
          <Section title="Extracurricular Activities">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '0.75rem' }}>
              {extras.map((ex: any, i: number) => (
                <div key={i} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '1rem 1.25rem' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '0.85rem', color: '#e2e8f0', margin: 0 }}>{ex.activity}</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: '0.2rem 0' }}>{ex.role}{ex.organization ? ` · ${ex.organization}` : ''}{ex.duration ? ` · ${ex.duration}` : ''}</p>
                  {ex.description && <p style={{ color: '#64748b', fontSize: '0.78rem', lineHeight: 1.6 }}>{ex.description}</p>}
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #1e293b', padding: '1.5rem 2.5rem', textAlign: 'center' }}>
        <p style={{ color: '#334155', fontSize: '0.75rem' }}>Built with Placement Intelligence Platform &bull; {profile.register_number}</p>
      </div>
    </div>
  );
}
