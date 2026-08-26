import { StudentProfile } from './types';

const techArr = (ts: any) =>
  Array.isArray(ts) ? ts : String(ts || '').split(',').map((s) => s.trim()).filter(Boolean);

// ATS-Compliant HTML Template Compiler for PDF Rendering & Downloads
export function generateResumeHtml(
  profile: StudentProfile,
  templateStyle: 'classic' | 'modern' | 'compact' = 'classic'
): string {
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

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${full_name} - ATS Resume</title>
  <style>
    @page {
      size: letter;
      margin: 0.4in;
    }
    body {
      font-family: Arial, Helvetica, sans-serif;
      color: #111827;
      line-height: 1.45;
      font-size: 10.5pt;
      margin: 0;
      padding: 0;
      background: #ffffff;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #111827;
      padding-bottom: 8px;
      margin-bottom: 12px;
    }
    .name {
      font-size: 20pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 0;
    }
    .subtitle {
      font-size: 10pt;
      font-weight: bold;
      color: #374151;
      margin-top: 2px;
    }
    .contact-line {
      font-size: 9pt;
      margin-top: 4px;
      color: #4b5563;
    }
    .section {
      margin-bottom: 12px;
    }
    .section-title {
      font-size: 11pt;
      font-weight: bold;
      text-transform: uppercase;
      border-bottom: 1.5px solid #111827;
      padding-bottom: 2px;
      margin-bottom: 6px;
      letter-spacing: 0.5px;
      color: #111827;
    }
    .item-header {
      display: flex;
      justify-content: space-between;
      font-weight: bold;
      font-size: 10pt;
    }
    .item-sub {
      font-size: 9pt;
      font-style: italic;
      color: #4b5563;
      margin-bottom: 2px;
    }
    .item-desc {
      font-size: 9.5pt;
      color: #1f2937;
    }
    .skills-list {
      font-size: 9.5pt;
      line-height: 1.5;
    }
    ul {
      margin: 3px 0 6px 18px;
      padding: 0;
    }
    li {
      margin-bottom: 2px;
    }
    .tech-pill {
      display: inline-block;
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      padding: 1px 5px;
      border-radius: 3px;
      font-size: 8.5pt;
      font-family: monospace;
      margin-right: 3px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="name">${full_name}</h1>
    <div class="subtitle">${dept} • ${profile.year_or_batch} • Reg: ${regNo}</div>
    <div class="contact-line">
      ${email ? `Email: ${email}` : ''} 
      ${phone ? `| Phone: ${phone}` : ''} 
      ${linkedin ? `| LinkedIn: ${linkedin}` : ''} 
      ${github ? `| GitHub: ${github}` : ''}
      ${website ? `| Web: ${website}` : ''}
    </div>
  </div>

  ${
    bio
      ? `<div class="section">
          <div class="section-title">Professional Summary</div>
          <div class="item-desc">${bio}</div>
        </div>`
      : ''
  }

  ${
    edu
      ? `<div class="section">
          <div class="section-title">Education</div>
          <div class="item-header">
            <span>${edu.current_degree} in ${edu.specialization}</span>
            <span>Expected: ${edu.expected_graduation_year}</span>
          </div>
          <div class="item-sub">
            12th/Diploma: ${edu.twelfth_percentage_or_diploma_details} (${edu.twelfth_board}) | 10th: ${edu.tenth_percentage}% (${edu.tenth_board})
            ${profile.cgpa_overall ? ` | Overall CGPA: ${Number(profile.cgpa_overall).toFixed(2)}/10.0` : ''}
          </div>
          ${
            sems.length > 0
              ? `<div style="font-size: 9pt; color: #4b5563; font-family: monospace; margin-top: 2px;">
                  Semester CGPA: ${sems.sort((a: any, b: any) => a.semester_number - b.semester_number).map((s: any) => `S${s.semester_number}: ${Number(s.cgpa).toFixed(2)}`).join(' | ')}
                 </div>`
              : ''
          }
        </div>`
      : ''
  }

  ${
    skills.length > 0
      ? `<div class="section">
          <div class="section-title">Technical Skills & Competencies</div>
          <div class="skills-list">
            ${skills.map((s: any) => `<strong>${s.skill?.name || s.name}:</strong> ${s.proficiency}`).join(' • ')}
          </div>
        </div>`
      : ''
  }

  ${
    exps.length > 0
      ? `<div class="section">
          <div class="section-title">Work Experience</div>
          ${exps
            .map(
              (e: any) => `
            <div style="margin-bottom: 8px;">
              <div class="item-header">
                <span>${e.role} — ${e.org} ${e.location ? `(${e.location})` : ''}</span>
                <span>${e.duration}</span>
              </div>
              <div class="item-desc">${e.description}</div>
              ${e.key_contributions ? `<div class="item-sub" style="color: #065f46; margin-top:2px;">Key Contribution: ${e.key_contributions}</div>` : ''}
            </div>
          `
            )
            .join('')}
        </div>`
      : ''
  }

  ${
    projects.length > 0
      ? `<div class="section">
          <div class="section-title">Technical Projects</div>
          ${projects
            .map((p: any) => {
              const stack = techArr(p.tech_stack);
              return `
            <div style="margin-bottom: 8px;">
              <div class="item-header">
                <span>${p.title} (${p.role})</span>
                <span>${p.duration || ''}</span>
              </div>
              ${stack.length > 0 ? `<div style="margin: 2px 0;">${stack.map((t: string) => `<span class="tech-pill">${t}</span>`).join('')}</div>` : ''}
              <div class="item-desc">${p.description}</div>
              ${p.key_outcomes ? `<div class="item-sub" style="color: #065f46; margin-top:2px;">Outcomes: ${p.key_outcomes}</div>` : ''}
            </div>
          `;
            })
            .join('')}
        </div>`
      : ''
  }

  ${
    certs.length > 0
      ? `<div class="section">
          <div class="section-title">Certifications</div>
          <ul>
            ${certs.map((c: any) => `<li><strong>${c.name}</strong> — ${c.issuer} (${c.date}) ${c.credential_id ? `[ID: ${c.credential_id}]` : ''}</li>`).join('')}
          </ul>
        </div>`
      : ''
  }

  ${
    achs.length > 0
      ? `<div class="section">
          <div class="section-title">Achievements & Honors</div>
          <ul>
            ${achs.map((a: any) => `<li><strong>${a.title}</strong> ${a.issuing_body ? `(${a.issuing_body})` : ''}: ${a.description}</li>`).join('')}
          </ul>
        </div>`
      : ''
  }

  ${
    extras.length > 0
      ? `<div class="section">
          <div class="section-title">Leadership & Activities</div>
          <ul>
            ${extras.map((ex: any) => `<li><strong>${ex.activity}</strong> — ${ex.role} ${ex.organization ? `(${ex.organization})` : ''}: ${ex.description || ''}</li>`).join('')}
          </ul>
        </div>`
      : ''
  }
</body>
</html>
  `;
}
