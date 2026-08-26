import { StudentProfile, CompletenessResult } from './types';

export function calculateCompleteness(profile: Partial<StudentProfile> | null): CompletenessResult {
  if (!profile) {
    return {
      score: 0,
      totalFields: 25,
      filledFields: 0,
      gaps: ['Profile not initialized'],
    };
  }

  const gaps: string[] = [];
  let filledCount = 0;
  let totalCount = 0;

  function trackField(
    val: any,
    fieldName: string,
    gapMessage: string,
    isRequired: boolean = true
  ) {
    const isFilled =
      val !== undefined &&
      val !== null &&
      val !== '' &&
      !(Array.isArray(val) && val.length === 0);

    if (isRequired) {
      totalCount++;
      if (isFilled) {
        filledCount++;
      } else {
        gaps.push(gapMessage);
      }
    } else {
      // Optional / Bonus field - only counts towards total if filled
      if (isFilled) {
        totalCount++;
        filledCount++;
      }
    }
  }

  // 1. Personal & Contact Fields
  trackField(profile.full_name, 'Full Name', 'Enter your full name', true);
  trackField(profile.register_number, 'Register Number', 'Register number is required', true);
  trackField(profile.department, 'Department', 'Select your department', true);
  trackField(profile.year_or_batch, 'Year / Batch', 'Select your year or batch', true);
  trackField(profile.phone, 'Phone Number', 'Add your contact phone number', true);
  trackField(profile.personal_email, 'Personal Email', 'Add your personal email address', true);
  trackField(profile.linkedin_url, 'LinkedIn URL', 'Add your LinkedIn profile link', true);
  trackField(profile.github_url, 'GitHub URL', 'Add your GitHub profile link', true);
  trackField(profile.address, 'Address', 'Add your contact address', true);
  trackField(profile.bio, 'Bio', 'Write a short professional bio', true);
  trackField(profile.personal_website_url, 'Portfolio / Website URL', 'Add your personal portfolio or website URL', false);
  trackField(profile.profile_photo_url, 'Profile Photo', 'Upload a profile photo', false);

  // 2. Education Fields
  const edu = profile.education;
  trackField(edu?.tenth_percentage, '10th Percentage', 'Add your 10th grade percentage', true);
  trackField(edu?.tenth_board, '10th Board', 'Specify your 10th grade board (e.g. CBSE/ICSE)', true);
  trackField(edu?.twelfth_percentage_or_diploma_details, '12th Percentage / Diploma', 'Add your 12th percentage or diploma details', true);
  trackField(edu?.twelfth_board, '12th Board', 'Specify your 12th grade board', true);
  trackField(edu?.current_degree, 'Current Degree', 'Specify your current degree (e.g. B.Tech)', true);
  trackField(edu?.specialization, 'Specialization', 'Specify your specialization / major', true);
  trackField(edu?.expected_graduation_year, 'Graduation Year', 'Specify your expected graduation year', true);

  // Overall CGPA
  trackField(profile.cgpa_overall, 'Overall CGPA', 'Add your current overall CGPA', true);

  // Semester CGPAs
  totalCount++;
  if (!profile.semester_cgpas || profile.semester_cgpas.length === 0) {
    gaps.push('Add at least one semester CGPA entry');
  } else {
    filledCount++;
  }

  // 3. Skills (Minimum 3 skills recommended)
  const skills = profile.student_skills || [];
  totalCount++;
  if (skills.length === 0) {
    gaps.push('Add at least 3 skills with self-rated proficiency');
  } else if (skills.length < 3) {
    gaps.push(`Add ${3 - skills.length} more skill(s) (minimum 3 recommended)`);
    filledCount += 0.5; // partial credit
  } else {
    filledCount++;
  }

  // 4. Projects (Minimum 1 detailed project)
  const projects = profile.projects || [];
  totalCount++;
  if (projects.length === 0) {
    gaps.push('Add at least 1 technical project with role and description');
  } else {
    filledCount++;
    projects.forEach((proj, idx) => {
      const pName = proj.title || `Project #${idx + 1}`;
      if (!proj.github_url) {
        gaps.push(`Recommendation: Add a GitHub repository link for '${pName}' project`);
      }
      if (!proj.live_url) {
        gaps.push(`Recommendation: Add a live demo URL for '${pName}' project`);
      }
    });
  }

  // 5. Certifications (Recommended 1)
  const certs = profile.certifications || [];
  totalCount++;
  if (certs.length === 0) {
    gaps.push('Add at least 1 professional certification');
  } else {
    filledCount++;
  }

  // 6. Experience / Internships (Recommended 1)
  const exps = profile.experiences || [];
  totalCount++;
  if (exps.length === 0) {
    gaps.push('Add an internship or relevant work experience entry');
  } else {
    filledCount++;
  }

  // 7. Achievements & Extracurriculars
  const achievements = profile.achievements || [];
  totalCount++;
  if (achievements.length === 0) {
    gaps.push('Add at least 1 key achievement or award');
  } else {
    filledCount++;
  }

  const score = totalCount > 0 ? Math.min(100, Math.round((filledCount / totalCount) * 100)) : 0;

  return {
    score,
    totalFields: totalCount,
    filledFields: Math.floor(filledCount),
    gaps,
  };
}
