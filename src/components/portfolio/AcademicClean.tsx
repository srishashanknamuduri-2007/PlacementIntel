import React from 'react';

const techArr = (ts: any) =>
  Array.isArray(ts) ? ts : String(ts || '').split(',').map((s) => s.trim()).filter(Boolean);

export function AcademicClean({ profile }: { profile: any }) {
  const skills = profile.student_skills || [];
  const projects = profile.projects || [];
  const certs = profile.certifications || [];
  const exps = profile.experiences || [];
  const achs = profile.achievements || [];
  const extras = profile.extracurriculars || [];
  const sems = profile.semester_cgpas || [];

  const byCategory = (cat: string) => skills.filter((s: any) => s.skill?.category === cat).map((s: any) => s.skill?.name);

  const NavyHR = () => <hr style={{ border: 'none', borderTop: '2px solid #1e3a5f', margin: '0.4rem 0 0.6rem' }} />;

  return (
    <div style={{ fontFamily: 'Georgia, "Times New Roman", serif', background: '#fff', color: '#1a1a2e', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: '#1e3a5f', color: '#fff', padding: '1.75rem 2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, letterSpacing: '0.02em' }}>{profile.full_name || 'Your Name'}</h1>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: '#93c5fd' }}>
          {profile.department} &bull; {profile.year_or_batch}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '0.75rem', fontSize: '0.8rem', color: '#bfdbfe' }}>
          {profile.personal_email && <span>✉ {profile.personal_email}</span>}
          {profile.phone && <span>☎ {profile.phone}</span>}
          {profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noreferrer" style={{ color: '#bfdbfe', textDecoration: 'underline' }}>LinkedIn</a>}
          {profile.github_url && <a href={profile.github_url} target="_blank" rel="noreferrer" style={{ color: '#bfdbfe', textDecoration: 'underline' }}>GitHub</a>}
          {profile.personal_website_url && <a href={profile.personal_website_url} target="_blank" rel="noreferrer" style={{ color: '#bfdbfe', textDecoration: 'underline' }}>Portfolio</a>}
        </div>
      </div>

      {/* Body — Two column */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: 'calc(100vh - 120px)' }}>
        {/* Left Sidebar */}
        <div style={{ background: '#f0f4ff', padding: '1.5rem 1.25rem', borderRight: '2px solid #dbeafe' }}>
          {profile.cgpa_overall && (
            <div style={{ marginBottom: '1.5rem', textAlign: 'center', background: '#1e3a5f', borderRadius: 10, padding: '0.75rem', color: '#fff' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>{Number(profile.cgpa_overall).toFixed(2)}</div>
              <div style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#93c5fd' }}>Overall CGPA</div>
            </div>
          )}

          {/* Skills Sidebar */}
          {skills.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#1e3a5f', margin: '0 0 0.4rem' }}>SKILLS</h3>
              <NavyHR />
              {[['LANGUAGE', 'Languages'], ['FRAMEWORK', 'Frameworks'], ['TOOL', 'Tools'], ['SOFT_SKILL', 'Soft Skills']].map(([cat, label]) => {
                const names = byCategory(cat);
                if (!names.length) return null;
                return (
                  <div key={cat} style={{ marginBottom: '0.75rem' }}>
                    <p style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.3rem' }}>{label}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                      {names.map((n: string, i: number) => (
                        <span key={i} style={{ fontSize: '0.7rem', background: '#dbeafe', color: '#1e3a5f', padding: '0.15rem 0.5rem', borderRadius: 999, fontWeight: 600 }}>{n}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Education Sidebar */}
          {profile.education && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#1e3a5f', margin: '0 0 0.4rem' }}>EDUCATION</h3>
              <NavyHR />
              <p style={{ fontWeight: 700, fontSize: '0.82rem', margin: '0 0 0.2rem' }}>{profile.education.current_degree}</p>
              <p style={{ fontSize: '0.75rem', color: '#475569', margin: 0 }}>{profile.education.specialization}</p>
              <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '0.2rem 0 0.75rem' }}>Grad: {profile.education.expected_graduation_year}</p>
              <p style={{ fontSize: '0.72rem', color: '#475569', margin: '0.2rem 0' }}>📗 10th: {profile.education.tenth_percentage}%</p>
              <p style={{ fontSize: '0.72rem', color: '#475569', margin: '0.2rem 0' }}>📘 12th: {profile.education.twelfth_percentage_or_diploma_details}</p>
            </div>
          )}

          {/* Sem CGPA */}
          {sems.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#1e3a5f', margin: '0 0 0.4rem' }}>SEM CGPA</h3>
              <NavyHR />
              {sems.sort((a: any, b: any) => a.semester_number - b.semester_number).map((s: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.2rem 0', borderBottom: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#475569' }}>Semester {s.semester_number}</span>
                  <span style={{ fontWeight: 700, color: '#1e3a5f' }}>{Number(s.cgpa).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Certifications Sidebar */}
          {certs.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#1e3a5f', margin: '0 0 0.4rem' }}>CERTIFICATIONS</h3>
              <NavyHR />
              {certs.map((c: any, i: number) => (
                <div key={i} style={{ marginBottom: '0.5rem' }}>
                  <p style={{ fontWeight: 700, fontSize: '0.75rem', margin: 0 }}>{c.name}</p>
                  <p style={{ fontSize: '0.7rem', color: '#64748b', margin: '0.1rem 0 0' }}>{c.issuer} · {c.date}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div style={{ padding: '1.75rem 2rem' }}>
          {/* Bio/Summary */}
          {profile.bio && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#1e3a5f', margin: '0 0 0.4rem' }}>PROFESSIONAL SUMMARY</h2>
              <NavyHR />
              <p style={{ fontSize: '0.85rem', lineHeight: 1.7, color: '#374151' }}>{profile.bio}</p>
            </div>
          )}

          {/* Experience */}
          {exps.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#1e3a5f', margin: '0 0 0.4rem' }}>WORK EXPERIENCE</h2>
              <NavyHR />
              {exps.map((e: any, i: number) => (
                <div key={i} style={{ marginBottom: '1rem', paddingLeft: '0.75rem', borderLeft: '3px solid #1e3a5f' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '0.88rem', margin: 0 }}>{e.role}</h3>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{e.duration}</span>
                  </div>
                  <p style={{ color: '#1e3a5f', fontSize: '0.8rem', margin: '0.15rem 0 0.5rem', fontStyle: 'italic' }}>{e.org}{e.location ? ` | ${e.location}` : ''}</p>
                  <p style={{ fontSize: '0.82rem', color: '#374151', lineHeight: 1.65, margin: 0 }}>{e.description}</p>
                  {e.key_contributions && <p style={{ fontSize: '0.8rem', color: '#166534', marginTop: '0.4rem' }}>▸ {e.key_contributions}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#1e3a5f', margin: '0 0 0.4rem' }}>TECHNICAL PROJECTS</h2>
              <NavyHR />
              {projects.map((p: any, i: number) => {
                const stack = techArr(p.tech_stack);
                return (
                  <div key={i} style={{ marginBottom: '1rem', padding: '0.875rem 1rem', background: '#f8faff', border: '1px solid #dbeafe', borderRadius: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.25rem' }}>
                      <h3 style={{ fontWeight: 700, fontSize: '0.88rem', margin: 0 }}>{p.title}</h3>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {p.github_url && <a href={p.github_url} target="_blank" rel="noreferrer" style={{ color: '#1e3a5f', fontSize: '0.72rem', textDecoration: 'underline' }}>GitHub</a>}
                        {p.live_url && <a href={p.live_url} target="_blank" rel="noreferrer" style={{ color: '#1e3a5f', fontSize: '0.72rem', textDecoration: 'underline' }}>Live</a>}
                      </div>
                    </div>
                    <p style={{ fontStyle: 'italic', color: '#64748b', fontSize: '0.75rem', margin: '0.15rem 0 0.35rem' }}>{p.role}{p.duration ? ` · ${p.duration}` : ''}</p>
                    <p style={{ fontSize: '0.82rem', color: '#374151', lineHeight: 1.65, margin: '0 0 0.5rem' }}>{p.description}</p>
                    {p.key_outcomes && <p style={{ fontSize: '0.8rem', color: '#166534', margin: '0 0 0.5rem' }}>▸ {p.key_outcomes}</p>}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                      {stack.map((t: string, j: number) => (
                        <span key={j} style={{ fontSize: '0.68rem', padding: '0.1rem 0.45rem', background: '#dbeafe', color: '#1e3a5f', borderRadius: 4, fontWeight: 600 }}>{t}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Achievements */}
          {achs.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#1e3a5f', margin: '0 0 0.4rem' }}>ACHIEVEMENTS</h2>
              <NavyHR />
              {achs.map((a: any, i: number) => (
                <div key={i} style={{ marginBottom: '0.6rem', paddingLeft: '0.75rem', borderLeft: '3px solid #fbbf24' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '0.85rem', color: '#92400e', margin: 0 }}>{a.title}</h3>
                  {a.issuing_body && <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.15rem 0' }}>{a.issuing_body}{a.date ? ` · ${a.date}` : ''}</p>}
                  <p style={{ fontSize: '0.8rem', color: '#374151', margin: 0 }}>{a.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Extracurriculars */}
          {extras.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#1e3a5f', margin: '0 0 0.4rem' }}>EXTRACURRICULAR ACTIVITIES</h2>
              <NavyHR />
              {extras.map((ex: any, i: number) => (
                <div key={i} style={{ marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>{ex.activity}</span>
                  <span style={{ color: '#64748b', fontSize: '0.78rem' }}> — {ex.role}{ex.organization ? ` @ ${ex.organization}` : ''}{ex.duration ? ` (${ex.duration})` : ''}</span>
                  {ex.description && <p style={{ fontSize: '0.78rem', color: '#374151', margin: '0.15rem 0 0', lineHeight: 1.5 }}>{ex.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
