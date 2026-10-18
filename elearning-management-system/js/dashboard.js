/**
 * LearnSphere - Student Dashboard Script (dashboard.js)
 * Calculates Student KPIs, Enrolled Courses Progress, Recently Accessed Lessons,
 * Deadlines, and Dynamic Navigation Actions.
 */

function initStudentDashboard() {
  const session = window.DB.getSession();
  if (!session) {
    window.location.href = 'login.html';
    return;
  }

  // If logged in as admin, provide option to switch to admin portal
  if (session.isAdmin) {
    const banner = document.getElementById('admin-switch-banner');
    if (banner) banner.style.display = 'block';
  }

  const db = window.DB.get();
  const student = db.students.find(s => s.id === session.id) || session;

  // Set Student Welcome & Profile info
  const welcomeNameEl = document.getElementById('dash-student-name');
  const userInitialsEl = document.getElementById('dash-user-initials');
  const userFullnameEl = document.getElementById('dash-user-fullname');
  const userEmailEl = document.getElementById('dash-user-email');

  if (welcomeNameEl) welcomeNameEl.textContent = student.name;
  if (userInitialsEl) userInitialsEl.textContent = student.avatar || student.name.substring(0, 2).toUpperCase();
  if (userFullnameEl) userFullnameEl.textContent = student.name;
  if (userEmailEl) userEmailEl.textContent = student.email;

  // Retrieve Student Enrollments
  const studentEnrollments = (db.enrollments || []).filter(e => e.student_id === student.id);
  const totalEnrolled = studentEnrollments.length;
  const completedCourses = studentEnrollments.filter(e => e.status === 'completed' || e.progress_percent === 100).length;
  const inProgressCourses = totalEnrolled - completedCourses;

  const totalProgressSum = studentEnrollments.reduce((acc, curr) => acc + (curr.progress_percent || 0), 0);
  const avgProgress = totalEnrolled > 0 ? Math.round(totalProgressSum / totalEnrolled) : 0;

  // Update KPI counters
  const totalEnrolledEl = document.getElementById('kpi-total-enrolled');
  const inProgressEl = document.getElementById('kpi-in-progress');
  const completedEl = document.getElementById('kpi-completed');
  const avgProgressEl = document.getElementById('kpi-avg-progress');
  const avgProgressBarEl = document.getElementById('kpi-progress-bar');

  if (totalEnrolledEl) totalEnrolledEl.textContent = totalEnrolled;
  if (inProgressEl) inProgressEl.textContent = inProgressCourses;
  if (completedEl) completedEl.textContent = completedCourses;
  if (avgProgressEl) avgProgressEl.textContent = `${avgProgress}%`;
  if (avgProgressBarEl) avgProgressBarEl.style.width = `${avgProgress}%`;

  // Render Enrolled Courses
  renderEnrolledCoursesList(studentEnrollments, db);

  // Render Deadlines & Announcements
  renderDeadlines(db.deadlines || []);
  renderAnnouncements(db.announcements || []);

  // Setup Logout button
  const logoutBtn = document.getElementById('dash-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      window.DB.clearSession();
      window.Toast.show('You have successfully logged out.', 'info');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 500);
    });
  }
}

function renderEnrolledCoursesList(enrollments, db) {
  const container = document.getElementById('enrolled-courses-container');
  if (!container) return;

  if (enrollments.length === 0) {
    container.innerHTML = `
      <div style="padding: 2.5rem; text-align: center; border: 1px dashed var(--color-border); border-radius: var(--radius-md);">
        <p style="font-weight: 600; color: var(--color-text-main); margin-bottom: 0.5rem;">You haven't enrolled in any courses yet</p>
        <p style="color: var(--color-text-muted); font-size: 0.875rem; margin-bottom: 1.25rem;">Browse our comprehensive catalog of 8+ courses to jumpstart your semester.</p>
        <a href="courses.html" class="btn btn-sm btn-primary">Browse Course Catalog</a>
      </div>
    `;
    return;
  }

  container.innerHTML = enrollments.map(enr => {
    const course = db.courses.find(c => c.id === enr.course_id);
    if (!course) return '';

    return `
      <div style="background-color: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 1.25rem; display: flex; flex-direction: column; gap: 0.875rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;">
          <div>
            <div class="course-meta-inline" style="margin-bottom: 0.25rem;">
              <span>${course.category}</span>
              <span aria-hidden="true">·</span>
              <span>${course.level}</span>
              <span aria-hidden="true">·</span>
              <span>${course.instructor}</span>
            </div>
            <h4 style="font-size: 1.05rem; font-weight: 700; color: var(--color-text-main);">${course.title}</h4>
          </div>
          <span style="font-size: 0.8125rem; font-weight: 600; padding: 0.25rem 0.625rem; border-radius: var(--radius-sm); ${enr.progress_percent === 100 ? 'background-color: var(--color-success-bg); color: var(--color-success);' : 'background-color: var(--color-accent-light); color: var(--color-accent);'}">
            ${enr.progress_percent === 100 ? 'Completed' : 'In Progress'}
          </span>
        </div>

        <div class="progress-container">
          <div style="display: flex; justify-content: space-between; font-size: 0.8125rem; color: var(--color-text-muted);">
            <span>Course Progress</span>
            <span class="tabular-nums font-semibold">${enr.progress_percent}%</span>
          </div>
          <div class="progress-bar-track">
            <div class="progress-bar-fill" style="width: ${enr.progress_percent}%;"></div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 0.5rem; border-top: 1px solid var(--color-border); font-size: 0.8125rem;">
          <span style="color: var(--color-text-subtle);">Enrolled on ${enr.enrolled_at}</span>
          <div style="display: flex; gap: 0.5rem;">
            <a href="quiz.html?course=${course.id}" class="btn btn-sm btn-secondary" title="Test Knowledge">Take Quiz</a>
            <a href="learn.html?id=${course.id}" class="btn btn-sm btn-primary">Continue Learning</a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderDeadlines(deadlines) {
  const container = document.getElementById('dash-deadlines-container');
  if (!container) return;

  if (deadlines.length === 0) {
    container.innerHTML = `<p style="font-size: 0.875rem; color: var(--color-text-muted);">No immediate deadlines due this week.</p>`;
    return;
  }

  container.innerHTML = deadlines.map(d => `
    <div style="padding: 0.75rem 0; border-bottom: 1px solid var(--color-border); display: flex; flex-direction: column; gap: 0.25rem;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <strong style="font-size: 0.875rem; color: var(--color-text-main);">${d.title}</strong>
        <span style="font-size: 0.75rem; font-weight: 600; color: ${d.urgent ? 'var(--color-danger)' : 'var(--color-accent)'};">${d.dueDate}</span>
      </div>
      <span style="font-size: 0.8125rem; color: var(--color-text-muted);">${d.course}</span>
    </div>
  `).join('');
}

function renderAnnouncements(announcements) {
  const container = document.getElementById('dash-announcements-container');
  if (!container) return;

  container.innerHTML = announcements.map(a => `
    <div style="padding: 0.75rem 0; border-bottom: 1px solid var(--color-border); display: flex; flex-direction: column; gap: 0.25rem;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 0.75rem; font-weight: 700; color: var(--color-accent);">${a.category}</span>
        <span style="font-size: 0.75rem; color: var(--color-text-subtle);">${a.date}</span>
      </div>
      <h5 style="font-size: 0.875rem; font-weight: 600;">${a.title}</h5>
      <p style="font-size: 0.8125rem; color: var(--color-text-muted); line-height: 1.4;">${a.content}</p>
    </div>
  `).join('');
}

// Safe document ready initialization
if (window.onReady) {
  window.onReady(initStudentDashboard);
} else {
  document.addEventListener('DOMContentLoaded', initStudentDashboard);
}
