/**
 * LearnSphere - Student Profile & Achievements Engine (profile.js)
 * Manages Student Profile Information, Edit Profile Modal,
 * Earned Certificates Verification & Rendering, and Session Teardown.
 */

function initStudentProfile() {
  const session = window.DB.getSession();
  if (!session) {
    window.location.href = 'login.html';
    return;
  }

  const db = window.DB.get();
  const student = db.students.find(s => s.id === session.id) || session;

  // Populate Profile Information
  const nameEl = document.getElementById('profile-name');
  const emailEl = document.getElementById('profile-email');
  const avatarEl = document.getElementById('profile-avatar');
  const bioEl = document.getElementById('profile-bio');
  const roleEl = document.getElementById('profile-role');
  const dateEl = document.getElementById('profile-enrolled-date');

  if (nameEl) nameEl.textContent = student.name;
  if (emailEl) emailEl.textContent = student.email;
  if (avatarEl) avatarEl.textContent = student.avatar || student.name.substring(0, 2).toUpperCase();
  if (bioEl) bioEl.textContent = student.bio || "Enthusiastic student on LearnSphere.";
  if (roleEl) roleEl.textContent = student.role || "Student";
  if (dateEl) dateEl.textContent = student.enrolledDate || "2026-01-15";

  // Render Achievements & Certificates
  renderCertificates(student.id, db);
  renderEnrolledSummary(student.id, db);

  // Setup Edit Profile Modal
  setupEditModal(student);

  // Setup Logout
  document.getElementById('profile-logout-btn')?.addEventListener('click', () => {
    window.DB.clearSession();
    window.Toast.show('Logged out successfully.', 'info');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 500);
  });
}

function renderCertificates(studentId, db) {
  const container = document.getElementById('certificates-container');
  if (!container) return;

  const certs = (db.certificates || []).filter(c => c.student_id === studentId);

  if (certs.length === 0) {
    container.innerHTML = `
      <div style="padding: 2rem; text-align: center; border: 1px dashed var(--color-border); border-radius: var(--radius-sm); grid-column: 1 / -1;">
        <p style="font-weight: 600; color: var(--color-text-main); margin-bottom: 0.25rem;">No certificates issued yet</p>
        <p style="font-size: 0.8125rem; color: var(--color-text-muted);">Complete a course and achieve 80%+ on its assessment quiz to unlock official certificates.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = certs.map(c => `
    <div style="background-color: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span style="font-size: 0.75rem; font-weight: 700; color: var(--color-accent); text-transform: uppercase;">Verified Credential</span>
        <span style="font-size: 0.75rem; color: var(--color-text-subtle);">${c.issued_date}</span>
      </div>
      <h4 style="font-size: 1.1rem; font-weight: 700; color: var(--color-text-main);">${c.course_title}</h4>
      <div style="font-size: 0.8125rem; color: var(--color-text-muted);">
        <span>Awarded to: <strong>${c.student_name}</strong></span><br>
        <span>Grade: <strong>${c.grade}</strong></span><br>
        <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--color-text-subtle);">ID: ${c.certificate_id}</span>
      </div>
      <button class="btn btn-sm btn-secondary view-cert-btn" data-cert-id="${c.certificate_id}" style="margin-top: 0.5rem;">
        View Official Certificate
      </button>
    </div>
  `).join('');

  // Setup Certificate Viewer Modal
  container.querySelectorAll('.view-cert-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const certId = btn.getAttribute('data-cert-id');
      const cert = certs.find(c => c.certificate_id === certId);
      if (cert) showCertificateModal(cert);
    });
  });
}

function showCertificateModal(cert) {
  const modal = document.getElementById('cert-modal-overlay');
  const certBody = document.getElementById('cert-modal-canvas');
  if (!modal || !certBody) return;

  certBody.innerHTML = `
    <div style="border: 4px double var(--color-primary); padding: 2.5rem; text-align: center; background: radial-gradient(circle at 50% 50%, #ffffff 0%, #f8fafc 100%); color: #0f172a; border-radius: 8px;">
      <div style="font-size: 1.8rem; font-weight: 800; color: var(--color-primary); letter-spacing: -0.02em;">LearnSphere</div>
      <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.15em; color: var(--color-accent); margin-bottom: 1.5rem;">Certificate of Academic Achievement</div>
      <p style="font-size: 0.9375rem; color: #64748b; margin-bottom: 0.5rem;">This certifies that</p>
      <div style="font-size: 1.8rem; font-weight: 700; color: #0f172a; margin-bottom: 0.5rem; font-family: serif;">${cert.student_name}</div>
      <p style="font-size: 0.9375rem; color: #64748b; max-width: 440px; margin: 0 auto 1.5rem;">
        has successfully fulfilled all curriculum requirements, interactive modules, and comprehensive assessments for
      </p>
      <div style="font-size: 1.35rem; font-weight: 700; color: var(--color-primary); margin-bottom: 0.75rem;">${cert.course_title}</div>
      <div style="font-size: 0.875rem; font-weight: 600; color: var(--color-success); margin-bottom: 2rem;">Graduated with ${cert.grade}</div>
      
      <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #cbd5e1; padding-top: 1rem; font-size: 0.75rem; color: #64748b;">
        <div>
          <div>Date: <strong>${cert.issued_date}</strong></div>
          <div style="font-family: monospace;">Certificate #${cert.certificate_id}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-family: serif; font-size: 1.1rem; color: #1e3a8a;">Dr. Evelyn Vance</div>
          <div>Academic Director, LearnSphere</div>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('active');

  document.getElementById('cert-modal-close')?.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  document.getElementById('cert-modal-print')?.addEventListener('click', () => {
    window.print();
  });
}

function renderEnrolledSummary(studentId, db) {
  const container = document.getElementById('profile-enrolled-summary');
  if (!container) return;

  const enrollments = (db.enrollments || []).filter(e => e.student_id === studentId);
  if (enrollments.length === 0) {
    container.innerHTML = `<p style="font-size:0.875rem; color:var(--color-text-muted);">No current course enrollments.</p>`;
    return;
  }

  container.innerHTML = enrollments.map(e => {
    const course = db.courses.find(c => c.id === e.course_id);
    if (!course) return '';
    return `
      <div style="padding: 0.75rem 0; border-bottom: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong style="font-size: 0.9375rem; color: var(--color-text-main);">${course.title}</strong>
          <div style="font-size: 0.8125rem; color: var(--color-text-muted);">${course.category} · ${e.status}</div>
        </div>
        <span class="tabular-nums font-semibold" style="font-size: 0.875rem;">${e.progress_percent}%</span>
      </div>
    `;
  }).join('');
}

function setupEditModal(student) {
  const editBtn = document.getElementById('open-edit-profile-btn');
  const modal = document.getElementById('edit-profile-modal');
  const closeBtn = document.getElementById('close-edit-modal-btn');
  const form = document.getElementById('edit-profile-form');

  if (!editBtn || !modal || !form) return;

  editBtn.addEventListener('click', () => {
    document.getElementById('edit-name').value = student.name;
    document.getElementById('edit-email').value = student.email;
    document.getElementById('edit-bio').value = student.bio || '';
    modal.classList.add('active');
  });

  closeBtn?.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const newName = document.getElementById('edit-name').value.trim();
    const newEmail = document.getElementById('edit-email').value.trim();
    const newBio = document.getElementById('edit-bio').value.trim();

    if (!newName || !newEmail) {
      window.Toast.show('Name and email are required.', 'error');
      return;
    }

    const db = window.DB.get();
    const sIdx = db.students.findIndex(s => s.id === student.id);
    if (sIdx !== -1) {
      db.students[sIdx].name = newName;
      db.students[sIdx].email = newEmail;
      db.students[sIdx].bio = newBio;
      db.students[sIdx].avatar = newName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      window.DB.save(db);
    }

    // Update active session
    const session = window.DB.getSession();
    if (session) {
      session.name = newName;
      session.email = newEmail;
      session.bio = newBio;
      session.avatar = newName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      window.DB.setSession(session);
    }

    modal.classList.remove('active');
    window.Toast.show('Profile updated successfully.', 'success');
    initStudentProfile();
  });
}

// Safe document ready initialization
if (window.onReady) {
  window.onReady(initStudentProfile);
} else {
  document.addEventListener('DOMContentLoaded', initStudentProfile);
}
